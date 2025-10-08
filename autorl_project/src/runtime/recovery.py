import asyncio
from src.tools.action_execution import ActionExecutor
from appium.webdriver.common.appiumby import AppiumBy
from selenium.common.exceptions import WebDriverException, TimeoutException
from src.core.error_handling import ErrorClassifier, AutoRLError, ErrorSeverity
from src.core.advanced_logging import get_logger

logger = get_logger("RecoveryManager")

class RecoveryManager:
    """Manages retries, safe states, and fallback logic with advanced error classification"""
    def __init__(self, executor: ActionExecutor, max_recovery_attempts: int = 3, recovery_delay: float = 2.0):
        self.executor = executor
        self.max_recovery_attempts = max_recovery_attempts
        self.recovery_delay = recovery_delay
        self.error_classifier = ErrorClassifier()

    async def recover(self, failure_stage: str, exception: Exception = None, safe_screen_locator: tuple = (AppiumBy.ACCESSIBILITY_ID, "home_button")) -> bool:
        context = {"failure_stage": failure_stage, "safe_screen": str(safe_screen_locator)}
        
        if exception:
            error = self.error_classifier.classify_error(exception, context)
            logger.log_error(error.code, error.message, context, severity=error.severity.value.upper())
            
            if not error.recoverable:
                logger.critical(f"Unrecoverable error at {failure_stage}", error_code=error.code)
                return False
        else:
            logger.warning(f"Recovery initiated at stage: {failure_stage}", context=context)
        
        for attempt in range(self.max_recovery_attempts):
            logger.info(f"Recovery attempt {attempt + 1}/{self.max_recovery_attempts}", context=context)
            try:
                # Try to navigate to a known safe screen
                await self.executor.tap(safe_screen_locator[0], safe_screen_locator[1])
                await asyncio.sleep(self.recovery_delay)
                await self.executor.wait_for_displayed(safe_screen_locator[0], safe_screen_locator[1], timeout=5)
                
                logger.info(f"Successfully recovered after {attempt + 1} attempts", context=context)
                return True
            except (WebDriverException, TimeoutException) as e:
                logger.warning(f"Recovery attempt {attempt + 1} failed: {str(e)}", context=context)
                await asyncio.sleep(self.recovery_delay)
            except Exception as e:
                logger.error(f"Unexpected error during recovery: {str(e)}", context=context)
                await asyncio.sleep(self.recovery_delay)
        
        logger.error(f"Recovery failed after {self.max_recovery_attempts} attempts", context=context)
        return False

    async def restart_app(self):
        logger.info("Attempting to restart application")
        try:
            self.executor.driver.reset()
            await asyncio.sleep(2)  # Wait for app to restart
            logger.info("Application restarted successfully")
            return True
        except WebDriverException as e:
            logger.error(f"Failed to restart application: {str(e)}", error_code="APP_RESTART_FAILED")
            return False

