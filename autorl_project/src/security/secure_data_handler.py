"""Security and Data Privacy Handler"""
from cryptography.fernet import Fernet
import hashlib
import os
from typing import Dict, Any, List
from src.core.advanced_logging import get_logger

logger = get_logger("SecureDataHandler")


class SecureDataHandler:
    """Handles encryption, hashing, and sanitization of sensitive data"""
    
    def __init__(self, encryption_key: bytes = None):
        if encryption_key:
            self.encryption_key = encryption_key
        else:
            # Try to load from environment, generate if not available
            key_str = os.environ.get('AUTORL_ENCRYPTION_KEY')
            if key_str:
                self.encryption_key = key_str.encode()
            else:
                self.encryption_key = Fernet.generate_key()
                logger.warning("Generated new encryption key - store AUTORL_ENCRYPTION_KEY in environment")
        
        self.cipher = Fernet(self.encryption_key)
        self.sensitive_fields = ['password', 'ssn', 'credit_card', 'api_key', 'token', 'secret']
    
    def encrypt_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Encrypt sensitive fields in data dictionary"""
        if not isinstance(data, dict):
            return data
        
        encrypted_data = data.copy()
        
        for field in self.sensitive_fields:
            if field in encrypted_data:
                try:
                    value = str(encrypted_data[field])
                    encrypted_value = self.cipher.encrypt(value.encode()).decode()
                    encrypted_data[field] = encrypted_value
                    logger.debug(f"Encrypted field: {field}")
                except Exception as e:
                    logger.error(f"Failed to encrypt field {field}: {str(e)}")
        
        return encrypted_data
    
    def decrypt_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Decrypt sensitive fields in data dictionary"""
        if not isinstance(data, dict):
            return data
        
        decrypted_data = data.copy()
        
        for field in self.sensitive_fields:
            if field in decrypted_data:
                try:
                    encrypted_value = decrypted_data[field]
                    if isinstance(encrypted_value, str):
                        decrypted_value = self.cipher.decrypt(encrypted_value.encode()).decode()
                        decrypted_data[field] = decrypted_value
                except Exception as e:
                    logger.error(f"Failed to decrypt field {field}: {str(e)}")
        
        return decrypted_data
    
    def hash_user_data(self, user_id: str, salt: str = "autorl_default_salt") -> str:
        """Create anonymized hash for user identification"""
        hash_input = f"{user_id}_{salt}".encode()
        return hashlib.sha256(hash_input).hexdigest()[:16]
    
    def sanitize_logs(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove or mask sensitive information from logs"""
        if not isinstance(log_data, dict):
            return log_data
        
        sanitized = {}
        
        for key, value in log_data.items():
            # Check if key is sensitive
            if any(sensitive in key.lower() for sensitive in self.sensitive_fields):
                sanitized[key] = '[REDACTED]'
            elif key == 'screenshot':
                sanitized[key] = '[SCREENSHOT_DATA_REDACTED]'
            elif key == 'user_input':
                sanitized[key] = '[USER_INPUT_MASKED]'
            elif key == 'device_id' and isinstance(value, str):
                sanitized[key] = self.hash_user_data(value)
            elif isinstance(value, dict):
                sanitized[key] = self.sanitize_logs(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    self.sanitize_logs(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                sanitized[key] = value
        
        return sanitized
    
    def validate_input(self, data: Dict[str, Any], required_fields: List[str]) -> tuple[bool, str]:
        """Validate input data has required fields"""
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            error_msg = f"Missing required fields: {', '.join(missing_fields)}"
            logger.warning(error_msg)
            return False, error_msg
        
        return True, "Validation successful"
    
    def sanitize_file_path(self, file_path: str) -> str:
        """Sanitize file path to prevent directory traversal attacks"""
        # Remove any parent directory references
        sanitized = file_path.replace('..', '').replace('//', '/')
        
        # Ensure it doesn't start with /
        if sanitized.startswith('/'):
            sanitized = sanitized[1:]
        
        return sanitized
