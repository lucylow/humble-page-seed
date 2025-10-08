from PIL import Image, ImageDraw, ImageFilter
from typing import List, Tuple, Union
import numpy as np

def mask_sensitive_screenshot(image_path: str, sensitive_boxes: List[Tuple[int, int, int, int]], output_path: str, mask_type: str = "redact"):
    """Blur/redact sensitive fields in screenshot.

    Args:
        image_path (str): Path to the input image.
        sensitive_boxes (List[Tuple[int, int, int, int]]): List of bounding boxes (x1, y1, x2, y2) to mask.
        output_path (str): Path to save the masked image.
        mask_type (str): Type of masking to apply. Can be "redact" (default) or "blur".
    """
    try:
        img = Image.open(image_path).convert("RGBA") # Ensure alpha channel for potential blending
        draw = ImageDraw.Draw(img)

        for box in sensitive_boxes:
            x1, y1, x2, y2 = box
            if mask_type == "redact":
                draw.rectangle([x1, y1, x2, y2], fill="black") # Simple redaction
            elif mask_type == "blur":
                # Extract the region to blur
                region = img.crop((x1, y1, x2, y2))
                # Apply a strong blur
                blurred_region = region.filter(ImageFilter.GaussianBlur(radius=15))
                # Paste the blurred region back into the original image
                img.paste(blurred_region, (x1, y1))
            else:
                print(f"Warning: Unknown mask_type \'{mask_type}\'. Defaulting to redact.")
                draw.rectangle([x1, y1, x2, y2], fill="black")

        img.save(output_path)
        print(f"Masked screenshot saved to {output_path}")
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
    except Exception as e:
        print(f"An error occurred during screenshot masking: {e}")

def mask_text_data(text: str, sensitive_keywords: List[str], replacement: str = "[MASKED]") -> str:
    """Masks sensitive keywords in a given text string.

    Args:
        text (str): The input text string.
        sensitive_keywords (List[str]): A list of keywords to search and mask.
        replacement (str): The string to replace sensitive keywords with.

    Returns:
        str: The text with sensitive keywords masked.
    """
    masked_text = text
    for keyword in sensitive_keywords:
        # Use regex to replace whole words, case-insensitive
        masked_text = re.sub(r'\b' + re.escape(keyword) + r'\b', replacement, masked_text, flags=re.IGNORECASE)
    return masked_text

# Example usage (for testing purposes)
if __name__ == '__main__':
    # Example for screenshot masking
    # You would need a dummy image and actual coordinates for sensitive areas
    # from PIL import Image
    # dummy_img = Image.new('RGB', (400, 300), color = 'white')
    # draw = ImageDraw.Draw(dummy_img)
    # draw.text((10, 10), "User: John Doe", fill=(0,0,0))
    # draw.text((10, 50), "Password: secret123", fill=(0,0,0))
    # draw.text((10, 90), "Credit Card: 1234-5678-9012-3456", fill=(0,0,0))
    # dummy_img.save("dummy_screenshot.png")

    # sensitive_areas = [(80, 45, 180, 65), (100, 85, 300, 105)] # Example coordinates
    # mask_sensitive_screenshot("dummy_screenshot.png", sensitive_areas, "masked_screenshot_redact.png", "redact")
    # mask_sensitive_screenshot("dummy_screenshot.png", sensitive_areas, "masked_screenshot_blur.png", "blur")

    # Example for text masking
    sample_text = "Please enter your password: secret123. Your SSN is 123-45-6789. The API_KEY is abcdef123."
    keywords = ["password", "ssn", "api_key"]
    masked_output = mask_text_data(sample_text, keywords)
    print(f"Original text: {sample_text}")
    print(f"Masked text: {masked_output}")

    sample_text_2 = "My credit card number is 1111-2222-3333-4444 and my PIN is 1234."
    keywords_2 = ["credit card", "pin"]
    masked_output_2 = mask_text_data(sample_text_2, keywords_2)
    print(f"Original text: {sample_text_2}")
    print(f"Masked text: {masked_output_2}")

