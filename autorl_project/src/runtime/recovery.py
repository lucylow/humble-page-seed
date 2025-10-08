import asyncio
from src.tools.action_execution import ActionExecutor
from appium.webdriver.common.appiumby import AppiumBy
from selenium.common.exceptions import WebDriverException, TimeoutException

class RecoveryManager:
    """Manages retries, safe states, and fallback logic"""
    def __init__(self, executor: ActionExecutor, max_recovery_attempts: int = 3, recovery_delay: float = 2.0):
        self.executor = executor
        self.max_recovery_attempts = max_recovery_attempts
        self.recovery_delay = recovery_delay

    async def recover(self, failure_stage: str, safe_screen_locator: tuple = (AppiumBy.ACCESSIBILITY_ID, "home_button")) -> bool:
        print(f"[Recovery] Failure detected at stage: {failure_stage}")
        for attempt in range(self.max_recovery_attempts):
            print(f"[Recovery] Attempt {attempt + 1}/{self.max_recovery_attempts} to recover...")
            try:
                # Try to navigate to a known safe screen, e.g., home button
                await self.executor.tap(safe_screen_locator[0], safe_screen_locator[1])
                await asyncio.sleep(self.recovery_delay) # Give time for UI to settle
                # Optionally, verify if we are on the safe screen
                await self.executor.wait_for_displayed(safe_screen_locator[0], safe_screen_locator[1], timeout=5)
                print(f"[Recovery] Successfully navigated to safe screen after {attempt + 1} attempts.")
                return True
            except (WebDriverException, TimeoutException) as e:
                print(f"[Recovery] Recovery attempt {attempt + 1} failed: {e}")
                await asyncio.sleep(self.recovery_delay)
            except Exception as e:
                print(f"[Recovery] Unexpected error during recovery attempt {attempt + 1}: {e}")
                await asyncio.sleep(self.recovery_delay)
        print(f"[Recovery] Failed to recover after {self.max_recovery_attempts} attempts. Aborting task.")
        return False

    async def restart_app(self):
        print("[Recovery] Attempting to restart the application...")
        try:
            self.executor.driver.reset() # This will close and restart the app
            print("[Recovery] Application restarted successfully.")
            return True
        except WebDriverException as e:
            print(f"[Recovery] Failed to restart application: {e}")
            return False

