"""Device Health Monitoring System"""
import asyncio
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, Optional
from dataclasses import dataclass
from src.core.advanced_logging import get_logger

logger = get_logger("DeviceHealthMonitor")


class DeviceStatus(Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    UNHEALTHY = "unhealthy"


@dataclass
class DeviceHealth:
    device_id: str
    status: DeviceStatus
    last_heartbeat: datetime
    error_count: int
    success_count: int
    avg_response_time: float
    memory_usage: float
    cpu_usage: float


class DeviceHealthMonitor:
    """Monitors device health and availability"""
    
    def __init__(self, heartbeat_interval: float = 30.0, unhealthy_threshold: int = 5):
        self.heartbeat_interval = heartbeat_interval
        self.unhealthy_threshold = unhealthy_threshold
        self.device_health: Dict[str, DeviceHealth] = {}
        self.monitoring_tasks: Dict[str, asyncio.Task] = {}
    
    async def start_monitoring(self, device):
        """Start monitoring a device"""
        device_id = device.device_id
        
        if device_id in self.monitoring_tasks:
            logger.warning(f"Device {device_id} already being monitored")
            return
        
        self.device_health[device_id] = DeviceHealth(
            device_id=device_id,
            status=DeviceStatus.AVAILABLE,
            last_heartbeat=datetime.now(),
            error_count=0,
            success_count=0,
            avg_response_time=0.0,
            memory_usage=0.0,
            cpu_usage=0.0
        )
        
        task = asyncio.create_task(self._monitor_device(device))
        self.monitoring_tasks[device_id] = task
        
        logger.info(f"Started monitoring device: {device_id}")
    
    async def stop_monitoring(self, device_id: str):
        """Stop monitoring a device"""
        if device_id in self.monitoring_tasks:
            self.monitoring_tasks[device_id].cancel()
            del self.monitoring_tasks[device_id]
            logger.info(f"Stopped monitoring device: {device_id}")
    
    async def _monitor_device(self, device):
        """Internal monitoring loop"""
        device_id = device.device_id
        
        while True:
            try:
                await asyncio.sleep(self.heartbeat_interval)
                
                # Check device responsiveness
                is_responsive = await self._check_device_health(device)
                
                health = self.device_health[device_id]
                health.last_heartbeat = datetime.now()
                
                if not is_responsive:
                    health.error_count += 1
                    logger.warning(
                        f"Device {device_id} health check failed",
                        error_count=health.error_count
                    )
                    
                    if health.error_count >= self.unhealthy_threshold:
                        health.status = DeviceStatus.UNHEALTHY
                        logger.error(
                            f"Device {device_id} marked as unhealthy",
                            error_count=health.error_count
                        )
                else:
                    health.success_count += 1
                    if health.error_count > 0:
                        health.error_count = max(0, health.error_count - 1)
                    
                    if health.status == DeviceStatus.UNHEALTHY and health.error_count == 0:
                        health.status = DeviceStatus.AVAILABLE
                        logger.info(f"Device {device_id} recovered to healthy state")
                
            except asyncio.CancelledError:
                logger.info(f"Monitoring cancelled for device: {device_id}")
                break
            except Exception as e:
                logger.error(
                    f"Error monitoring device {device_id}: {str(e)}",
                    error_code="MONITOR_ERROR"
                )
    
    async def _check_device_health(self, device) -> bool:
        """Check if device is responsive"""
        try:
            if device.session is None:
                return False
            
            # Try to get current activity/screen
            import time
            start = time.time()
            _ = device.session.current_activity if hasattr(device.session, 'current_activity') else True
            response_time = time.time() - start
            
            # Update metrics
            health = self.device_health[device.device_id]
            if health.avg_response_time == 0:
                health.avg_response_time = response_time
            else:
                health.avg_response_time = (health.avg_response_time * 0.7) + (response_time * 0.3)
            
            return response_time < 5.0  # 5 second timeout
            
        except Exception as e:
            logger.debug(f"Device health check failed: {str(e)}")
            return False
    
    def get_device_health(self, device_id: str) -> Optional[DeviceHealth]:
        """Get health status for a device"""
        return self.device_health.get(device_id)
    
    def get_healthy_devices(self) -> list:
        """Get list of healthy device IDs"""
        return [
            device_id for device_id, health in self.device_health.items()
            if health.status in [DeviceStatus.AVAILABLE, DeviceStatus.BUSY]
        ]
    
    def record_task_result(self, device_id: str, success: bool, duration: float):
        """Record task execution result for metrics"""
        if device_id not in self.device_health:
            return
        
        health = self.device_health[device_id]
        if success:
            health.success_count += 1
        else:
            health.error_count += 1
        
        # Update average response time
        if health.avg_response_time == 0:
            health.avg_response_time = duration
        else:
            health.avg_response_time = (health.avg_response_time * 0.8) + (duration * 0.2)
