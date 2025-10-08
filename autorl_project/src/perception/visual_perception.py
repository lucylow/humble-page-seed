import os
from PIL import Image
import pytesseract
from typing import List, Dict, Any
import json

# Mock function for UI element detection (replace with actual ML model integration)
def detect_ui_elements(image_path: str) -> List[Dict[str, Any]]:
    """Simulates UI element detection, returning mock bounding boxes and labels."""
    # In a real scenario, this would use an ML model (e.g., YOLO, custom CNN)
    # to detect buttons, input fields, text, etc.
    print(f"[Perception] Simulating UI element detection for {image_path}")
    mock_elements = [
        {"text": "Username", "bbox": [50, 100, 150, 120], "type": "label"},
        {"text": "", "bbox": [160, 95, 300, 125], "type": "input", "id": "username_field"},
        {"text": "Password", "bbox": [50, 150, 150, 170], "type": "label"},
        {"text": "", "bbox": [160, 145, 300, 175], "type": "input", "id": "password_field"},
        {"text": "Login", "bbox": [100, 200, 250, 230], "type": "button", "id": "login_button"},
        {"text": "Home", "bbox": [10, 10, 50, 30], "type": "button", "id": "home_button"},
        {"text": "Profile", "bbox": [300, 10, 380, 30], "type": "button", "id": "profile_button"},
        {"text": "Welcome to Dashboard", "bbox": [50, 50, 350, 80], "type": "text", "id": "home_screen_element"},
    ]
    return mock_elements

def perform_ocr(image_path: str) -> str:
    """Performs OCR on the given image path and returns the extracted text."""
    print(f"[Perception] Performing OCR on {image_path}")
    try:
        # Ensure tesseract is installed and in PATH, or specify tesseract_cmd
        # pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract' # Example for Linux
        text = pytesseract.image_to_string(Image.open(image_path))
        return text
    except Exception as e:
        print(f"[Perception] OCR failed: {e}. Returning empty string.")
        return ""

class VisualPerception:
    """Handles visual perception tasks like OCR and UI element detection."""
    def __init__(self, screenshot_dir: str = "./screenshots"):
        self.screenshot_dir = screenshot_dir
        os.makedirs(self.screenshot_dir, exist_ok=True)

    def capture_and_analyze(self, driver) -> Dict[str, Any]:
        """Captures a screenshot, performs OCR and UI element detection, and returns structured UI state."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        screenshot_path = os.path.join(self.screenshot_dir, f"screenshot_{timestamp}.png")
        
        print(f"[Perception] Capturing screenshot to {screenshot_path}")
        driver.save_screenshot(screenshot_path)

        # Perform OCR
        full_text = perform_ocr(screenshot_path)

        # Detect UI elements
        ui_elements = detect_ui_elements(screenshot_path)

        # Construct structured UI state
        ui_state = {
            "timestamp": timestamp,
            "screenshot_path": screenshot_path,
            "full_text_ocr": full_text,
            "ui_elements": ui_elements,
            "device_info": driver.get_capabilities() # Add device capabilities for context
        }
        print(f"[Perception] Analysis complete. Found {len(ui_elements)} UI elements.")
        return ui_state

    def get_element_locator(self, ui_state: Dict[str, Any], element_id: str) -> Optional[Tuple[str, str]]:
        """Helper to get Appium locator from UI state based on a logical ID."""
        for element in ui_state.get("ui_elements", []):
            if element.get("id") == element_id:
                # For simplicity, we assume 'id' maps to accessibility id or name
                # In a real system, this would be more sophisticated, e.g., using XPath or coordinates
                return ("accessibility id", element_id) # Or element.get("text") if it's a button
        return None

# Example usage (for testing purposes)
if __name__ == '__main__':
    # This part requires a running Appium server and a connected device/emulator
    # For a standalone test, you might mock the driver or use a dummy image.
    print("This module is designed to be integrated with an Appium driver.")
    print("To test, ensure Appium is running and a device is connected.")
    print("Then, you can instantiate VisualPerception and call capture_and_analyze with a mock driver.")

    # Mock Driver for demonstration without a real Appium setup
    class MockDriver:
        def save_screenshot(self, path):
            print(f"MockDriver: Saving screenshot to {path}")
            # Create a dummy image for OCR/detection
            img = Image.new("RGB", (400, 600), color = (255, 255, 255))
            d = ImageDraw.Draw(img)
            d.text((50, 100), "Username", fill=(0,0,0))
            d.text((160, 95), "", fill=(0,0,0)) # Input field area
            d.text((50, 150), "Password", fill=(0,0,0))
            d.text((160, 145), "", fill=(0,0,0)) # Input field area
            d.text((100, 200), "Login", fill=(0,0,0))
            d.text((50, 50), "Welcome to Dashboard", fill=(0,0,0))
            img.save(path)

        def get_capabilities(self):
            return {"deviceName": "MockDevice", "platformName": "mockOS"}

    vp = VisualPerception()
    mock_driver = MockDriver()
    ui_state = vp.capture_and_analyze(mock_driver)
    print("\nStructured UI State:")
    print(json.dumps(ui_state, indent=2))

    login_button_locator = vp.get_element_locator(ui_state, "login_button")
    print(f"\nLogin button locator: {login_button_locator}")

