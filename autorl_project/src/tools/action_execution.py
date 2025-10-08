import asyncio
import time
from typing import Tuple

from appium.webdriver.common.appiumby import AppiumBy
from selenium.common.exceptions import NoSuchElementException, TimeoutException, WebDriverException
from appium.webdriver.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class ActionExecutor:
    """Executes taps, swipes, typing with robust timeout & retry logic"""
    def __init__(self, driver: WebDriver, default_timeout: int = 10, retries: int = 3, retry_delay: float = 1.0):
        self.driver = driver
        self.default_timeout = default_timeout
        self.retries = retries
        self.retry_delay = retry_delay

    async def _find_element_with_wait(self, locator_type: str, locator: str, timeout: int = None):
        current_timeout = timeout or self.default_timeout
        try:
            # Use WebDriverWait for explicit waits, which is more robust than polling manually
            wait = WebDriverWait(self.driver, current_timeout)
            element = wait.until(EC.presence_of_element_located((locator_type, locator)))
            return element
        except TimeoutException:
            raise TimeoutException(f"Element {locator} not found within {current_timeout}s")

    async def tap(self, locator_type: str, locator: str):
        for attempt in range(self.retries):
            try:
                element = await self._find_element_with_wait(locator_type, locator)
                if element.is_displayed() and element.is_enabled():
                    element.click()
                    print(f"Tapped on element {locator} (Attempt {attempt + 1})")
                    return
                else:
                    print(f"Element {locator} not displayed or enabled (Attempt {attempt + 1})")
            except (NoSuchElementException, TimeoutException, WebDriverException) as e:
                print(f"Error tapping element {locator} (Attempt {attempt + 1}): {e}")
            await asyncio.sleep(self.retry_delay)
        raise WebDriverException(f"Failed to tap element {locator} after {self.retries} attempts.")

    async def type_text(self, locator_type: str, locator: str, text: str):
        for attempt in range(self.retries):
            try:
                element = await self._find_element_with_wait(locator_type, locator)
                if element.is_displayed() and element.is_enabled():
                    element.clear()
                    element.send_keys(text)
                    print(f"Typed text into element {locator} (Attempt {attempt + 1})")
                    return
                else:
                    print(f"Element {locator} not displayed or enabled for typing (Attempt {attempt + 1})")
            except (NoSuchElementException, TimeoutException, WebDriverException) as e:
                print(f"Error typing into element {locator} (Attempt {attempt + 1}): {e}")
            await asyncio.sleep(self.retry_delay)
        raise WebDriverException(f"Failed to type text into element {locator} after {self.retries} attempts.")

    async def wait_for_displayed(self, locator_type: str, locator: str, timeout: int = None):
        current_timeout = timeout or self.default_timeout
        try:
            wait = WebDriverWait(self.driver, current_timeout)
            element = wait.until(EC.visibility_of_element_located((locator_type, locator)))
            print(f"Element {locator} displayed within {current_timeout}s.")
            return element
        except TimeoutException:
            raise TimeoutException(f"Element {locator} not displayed in {current_timeout}s")

    async def swipe(self, start_x: int, start_y: int, end_x: int, end_y: int, duration: int = 800):
        """Performs a swipe action."""
        try:
            self.driver.swipe(start_x, start_y, end_x, end_y, duration)
            print(f"Swiped from ({start_x},{start_y}) to ({end_x},{end_y})")
        except WebDriverException as e:
            print(f"Error performing swipe: {e}")
            raise

    async def get_screen_dimensions(self) -> Tuple[int, int]:
        """Returns screen width and height."""
        return self.driver.get_window_size()["width"], self.driver.get_window_size()["height"]

