import logging
import json
import re
from typing import Dict, Any, List

class MaskedLogger:
    """Logs structured events and masks sensitive info across different logging levels."""
    SENSITIVE_KEYWORDS: List[str] = ["password", "pin", "ssn", "credit_card", "api_key", "token", "secret"]
    SENSITIVE_PATTERNS: List[re.Pattern] = [
        re.compile(r'\b\d{13,16}\b'),  # Credit card numbers
        re.compile(r'\b\d{3}-\d{2}-\d{4}\b'), # SSN format
        re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b') # Email addresses
    ]

    def __init__(self, name: str = "AutoRL", level=logging.INFO):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)

        # Prevent adding multiple handlers if already configured
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def _mask_value(self, value: Any) -> Any:
        if isinstance(value, str):
            lower_value = value.lower()
            for keyword in self.SENSITIVE_KEYWORDS:
                if keyword in lower_value:
                    return "[MASKED]"
            for pattern in self.SENSITIVE_PATTERNS:
                if pattern.search(value):
                    return "[MASKED]"
        elif isinstance(value, dict):
            return {k: self._mask_value(v) for k, v in value.items()}
        elif isinstance(value, list):
            return [self._mask_value(item) for item in value]
        return value

    def mask_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not data:
            return {}
        masked_data = {}
        for key, value in data.items():
            if any(keyword in key.lower() for keyword in self.SENSITIVE_KEYWORDS):
                masked_data[key] = "[MASKED]"
            else:
                masked_data[key] = self._mask_value(value)
        return masked_data

    def _log(self, level: int, msg: str, data: Dict[str, Any] = None):
        extra_data = self.mask_sensitive_data(data) if data else {}
        # Use extra for structured logging, which many log aggregators can parse
        self.logger.log(level, msg, extra={'structured_data': extra_data})

    def debug(self, msg: str, data: Dict[str, Any] = None):
        self._log(logging.DEBUG, msg, data)

    def info(self, msg: str, data: Dict[str, Any] = None):
        self._log(logging.INFO, msg, data)

    def warning(self, msg: str, data: Dict[str, Any] = None):
        self._log(logging.WARNING, msg, data)

    def error(self, msg: str, data: Dict[str, Any] = None):
        self._log(logging.ERROR, msg, data)

    def critical(self, msg: str, data: Dict[str, Any] = None):
        self._log(logging.CRITICAL, msg, data)

# Example usage (for testing purposes, not part of the class itself)
if __name__ == '__main__':
    logger = MaskedLogger(level=logging.DEBUG)
    logger.info("User login attempt", data={"username": "testuser", "password": "mysecretpassword"})
    logger.debug("Debug info", data={"config": {"api_key": "12345", "endpoint": "example.com"}})
    logger.error("Payment failed", data={"user_id": 123, "credit_card_number": "1234-5678-9012-3456", "amount": 100.00})
    logger.info("Normal event", data={"event_id": "abc", "status": "success"})
    logger.info("Email received", data={"sender": "test@example.com", "subject": "Hello"})

