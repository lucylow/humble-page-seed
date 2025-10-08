import asyncio
import os
from appium.webdriver import Remote
from appium.options.common import AppiumOptions
from selenium.common.exceptions import WebDriverException, TimeoutException
import time

from src.runtime.device_manager import Device, DeviceManager
from src.tools.action_execution import ActionExecutor
from src.runtime.recovery import RecoveryManager
from src.runtime.logging import MaskedLogger
from src.production_readiness.metrics_server import start_metrics_server, record_task_metrics
from src.production_readiness.logging_utils import log_event, store_secure_log
from src.rl.policy_manager import PolicyManager, shadow_run
from src.runtime.parallel_runner import TaskRunner, get_recommended_parallel_tasks
from src.perception.visual_perception import VisualPerception
from src.llm.llm_planner import LLMPlanner

# Configuration
APPIUM_SERVER_URL = os.getenv("APPIUM_SERVER_URL", "http://localhost:4723/wd/hub")
DEVICE_MODE = os.getenv("DEVICE_MODE", "appium")

# Initialize logger globally
logger = MaskedLogger(name="AutoRL_Orchestrator")

async def initialize_appium_driver(device: Device) -> Remote:
    options = AppiumOptions()
    options.set_capability("platformName", device.platform)
    options.set_capability("appium:deviceName", device.device_id)
    options.set_capability("appium:automationName", "UiAutomator2" if device.platform == "android" else "XCUITest")
    options.set_capability("appium:newCommandTimeout", 60)

    logger.info(f"Initializing Appium driver for {device.device_id} on {APPIUM_SERVER_URL}")
    log_event("DRIVER_INIT", f"Attempting to initialize driver for {device.device_id}", "INFO")
    try:
        driver = Remote(APPIUM_SERVER_URL, options=options)
        device.session = driver
        logger.info(f"Appium driver initialized for {device.device_id}")
        log_event("DRIVER_INIT_SUCCESS", f"Driver initialized for {device.device_id}", "INFO")
        return driver
    except Exception as e:
        logger.error(f"Failed to initialize Appium driver for {device.device_id}: {e}")
        log_event("DRIVER_INIT_FAILURE", f"Failed to initialize driver for {device.device_id}: {e}", "ERROR")
        raise

async def execute_action_plan(executor: ActionExecutor, visual_perception: VisualPerception, ui_state: dict, action_plan: list):
    for action_step in action_plan:
        action_type = action_step.get("action")
        target_id = action_step.get("target_id")
        value = action_step.get("value")

        locator = visual_perception.get_element_locator(ui_state, target_id)

        if not locator:
            logger.warning(f"Element with ID \'{target_id}\' not found in UI state. Skipping action.")
            log_event("ACTION_SKIPPED", f"Element {target_id} not found for action {action_type}", "WARNING")
            continue

        try:
            if action_type == "type_text":
                await executor.type_text(locator[0], locator[1], value)
            elif action_type == "tap":
                await executor.tap(locator[0], locator[1])
            elif action_type == "wait_for_displayed":
                await executor.wait_for_displayed(locator[0], locator[1])
            elif action_type == "sleep":
                await asyncio.sleep(value)
            else:
                logger.warning(f"Unknown action type in plan: {action_type}")
                log_event("UNKNOWN_ACTION", f"Unknown action type {action_type} in plan", "WARNING")
        except (WebDriverException, TimeoutException) as e:
            logger.error(f"Action \'{action_type}\' on \'{target_id}\' failed: {e}")
            log_event("ACTION_FAILURE", f"Action {action_type} on {target_id} failed: {e}", "ERROR")
            raise

async def run_agent_task(device: Device, task_instruction: str, current_policy: dict = None):
    logger.info(f"Starting task \'{task_instruction}\' on device {device.device_id}")
    log_event("TASK_START", f"Task \'{task_instruction}\' started on {device.device_id}", "INFO")
    driver = None
    task_start_time = time.time()
    success = False
    error_type = "NONE"

    try:
        if not device.session:
            driver = await initialize_appium_driver(device)
        else:
            driver = device.session

        executor = ActionExecutor(driver)
        recovery_manager = RecoveryManager(executor)
        visual_perception = VisualPerception() # Initialize visual perception module
        llm_planner = LLMPlanner() # Initialize LLM planner

        current_instruction = task_instruction
        max_planning_attempts = 3
        for attempt in range(max_planning_attempts):
            logger.info(f"[Attempt {attempt + 1}] Agent on {device.device_id} analyzing UI and planning actions for: {current_instruction}")
            ui_state = visual_perception.capture_and_analyze(driver)
            action_plan = llm_planner.generate_action_plan(current_instruction, ui_state)

            if not action_plan:
                logger.warning(f"LLM Planner generated an empty plan for \'{current_instruction}\'.")
                log_event("EMPTY_PLAN", f"LLM generated empty plan for \'{current_instruction}\'", "WARNING")
                if attempt < max_planning_attempts - 1:
                    current_instruction = f"Re-evaluate and plan for: {task_instruction}"
                    await asyncio.sleep(1)
                    continue
                else:
                    raise Exception("LLM Planner failed to generate a valid plan after multiple attempts.")

            try:
                await execute_action_plan(executor, visual_perception, ui_state, action_plan)
                logger.info(f"Successfully completed task \'{task_instruction}\' on {device.device_id} using LLM plan.")
                log_event("TASK_SUCCESS", f"Task \'{task_instruction}\' completed on {device.device_id}", "INFO")
                success = True
                break
            except (WebDriverException, TimeoutException) as e:
                logger.error(f"Task \'{task_instruction}\' failed during execution of LLM plan on {device.device_id}: {e}")
                log_event("TASK_FAILURE_LLM_PLAN", f"Task \'{task_instruction}\' failed during LLM plan execution: {e}", "ERROR")
                error_type = "UI_INTERACTION_ERROR"
                if attempt < max_planning_attempts - 1:
                    logger.info(f"Attempting LLM reflection for recovery on {device.device_id}.")
                    corrective_plan = llm_planner.reflect_and_correct(current_instruction, ui_state, action_plan[-1], str(e))
                    if corrective_plan:
                        logger.info("LLM generated a corrective plan. Attempting to execute...")
                        log_event("LLM_REFLECTION", f"LLM generated corrective plan for \'{task_instruction}\'", "INFO")
                        await execute_action_plan(executor, visual_perception, ui_state, corrective_plan)
                        logger.info(f"Successfully recovered and completed task \'{task_instruction}\' on {device.device_id} after reflection.")
                        log_event("TASK_RECOVERED", f"Task \'{task_instruction}\' recovered on {device.device_id}", "INFO")
                        success = True
                        break
                    else:
                        logger.warning("LLM reflection did not yield a corrective plan.")
                        log_event("LLM_REFLECTION_FAILED", f"LLM reflection failed for \'{task_instruction}\'", "WARNING")
                raise

        if not success:
            raise Exception(f"Task \'{task_instruction}\' failed after {max_planning_attempts} planning/reflection attempts.")

    except (WebDriverException, TimeoutException) as e:
        logger.error(f"Task \'{task_instruction}\' failed on device {device.device_id} due to UI interaction: {e}")
        log_event("TASK_FAILURE_UI", f"Task \'{task_instruction}\' failed due to UI interaction: {e}", "ERROR")
        error_type = "UI_INTERACTION_ERROR"
        if not await recovery_manager.recover(f"Task {task_instruction} execution"): 
            logger.critical(f"Recovery failed for task \'{task_instruction}\' on device {device.device_id}. Aborting.")
            log_event("RECOVERY_CRITICAL_FAILURE", f"Recovery failed for \'{task_instruction}\' on {device.device_id}", "CRITICAL")
        else:
            log_event("RECOVERY_ATTEMPTED", f"Recovery attempted for \'{task_instruction}\' on {device.device_id}", "WARNING")
    except Exception as e:
        logger.critical(f"An unexpected error occurred during task \'{task_instruction}\' on device {device.device_id}: {e}")
        log_event("TASK_FAILURE_UNEXPECTED", f"Unexpected error for \'{task_instruction}\' on {device.device_id}: {e}", "CRITICAL")
        error_type = "UNEXPECTED_ERROR"
    finally:
        runtime = time.time() - task_start_time
        record_task_metrics(success, runtime)
        log_event("TASK_END", f"Task \'{task_instruction}\' ended on {device.device_id} with success={success}, runtime={runtime:.2f}s", "INFO")
        if not success:
            store_secure_log(f"task_failure_{device.device_id}_{int(time.time())}.log", f"Task: {task_instruction}\nError: {error_type}\nDetails: {e}")
    return success

async def main():
    logger.info("Starting AutoRL Agent Orchestrator")
    log_event("ORCHESTRATOR_START", "AutoRL Agent Orchestrator starting", "INFO")

    logger.info("Starting Prometheus metrics server on port 8000")
    start_metrics_server(port=8000)

    max_parallel = get_recommended_parallel_tasks()
    logger.info(f"Recommended max parallel tasks: {max_parallel}")
    device_manager = DeviceManager(max_devices=max_parallel)
    policy_manager = PolicyManager()
    task_runner = TaskRunner(device_manager)

    await device_manager.add_device(Device("emulator-5554", "android", False))
    await device_manager.add_device(Device("iPhone 15", "ios", False))
    await device_manager.add_device(Device("emulator-5556", "android", False))
    await device_manager.add_device(Device("Pixel_4_API_30", "android", True))

    logger.info(f"Registered {len(device_manager.devices)} devices.")
    log_event("DEVICES_REGISTERED", f"Registered {len(device_manager.devices)} devices", "INFO")

    dummy_policy = {"strategy": "explore", "params": {"epsilon": 0.1}}
    policy_manager.register_policy("initial_policy", dummy_policy)
    logger.info(f"Registered initial_policy: {policy_manager.policies["initial_policy"]}")

    tasks_to_run_definitions = [
        (run_agent_task, (device_manager.get_device_by_id("emulator-5554"), "Login to the app and browse"), {}),
        (run_agent_task, (device_manager.get_device_by_id("iPhone 15"), "Go to my profile"), {}),
        (run_agent_task, (device_manager.get_device_by_id("emulator-5556"), "Login to the app again"), {}),
        (run_agent_task, (device_manager.get_device_by_id("Pixel_4_API_30"), "Simulate a login failure"), {}),
    ]

    valid_tasks = []
    for func, args, kwargs in tasks_to_run_definitions:
        if args[0] is not None:
            valid_tasks.append((func, args, kwargs))
        else:
            logger.warning(f"Skipping task as device was not found: {args[1]}")
            log_event("TASK_SKIPPED", f"Task skipped due to device not found: {args[1]}", "WARNING")

    logger.info(f"Running {len(valid_tasks)} tasks in parallel...")
    results = await task_runner.run_all_tasks(valid_tasks)
    logger.info(f"Parallel task execution results: {results}")
    log_event("PARALLEL_TASKS_COMPLETED", f"Parallel task execution results: {results}", "INFO")

    await device_manager.shutdown()
    logger.info("AutoRL Agent Orchestrator finished.")
    log_event("ORCHESTRATOR_SHUTDOWN", "AutoRL Agent Orchestrator finished", "INFO")

if __name__ == "__main__":
    asyncio.run(main())

