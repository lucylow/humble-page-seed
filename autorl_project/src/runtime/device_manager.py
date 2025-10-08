import asyncio
from typing import List, Dict, Optional

class Device:
    def __init__(self, device_id: str, platform: str, is_real: bool):
        self.device_id = device_id
        self.platform = platform  # "android" or "ios"
        self.is_real = is_real
        self._session = None  # Appium session, private to encourage management via manager

    @property
    def session(self):
        return self._session

    @session.setter
    def session(self, new_session):
        self._session = new_session

    def __repr__(self):
        return f"Device(id='{self.device_id}', platform='{self.platform}', is_real={self.is_real})"

class DeviceManager:
    """Manage device pool (real or virtual) for parallel runs"""
    def __init__(self, max_devices: Optional[int] = None):
        self.devices: List[Device] = []
        self.available_devices: asyncio.Queue = asyncio.Queue(maxsize=max_devices if max_devices else 0)
        self.active_devices: Dict[str, Device] = {}

    async def add_device(self, device: Device):
        if device.device_id in self.active_devices:
            print(f"Warning: Device {device.device_id} already added.")
            return
        self.devices.append(device)
        self.active_devices[device.device_id] = device
        await self.available_devices.put(device) # Use put for async safety
        print(f"Device {device.device_id} added to pool.")

    async def acquire_device(self) -> Device:
        device = await self.available_devices.get()
        print(f"Device {device.device_id} acquired.")
        return device

    async def release_device(self, device: Device):
        if device.session:
            try:
                device.session.quit() # Attempt to close Appium session
                device.session = None
                print(f"Appium session for {device.device_id} quit successfully.")
            except Exception as e:
                print(f"Error quitting Appium session for {device.device_id}: {e}")
        await self.available_devices.put(device)
        print(f"Device {device.device_id} released.")

    def get_device_by_id(self, device_id: str) -> Optional[Device]:
        return self.active_devices.get(device_id)

    async def shutdown(self):
        for device in self.devices:
            if device.session:
                try:
                    device.session.quit()
                    device.session = None
                except Exception as e:
                    print(f"Error during shutdown for device {device.device_id}: {e}")
        print("DeviceManager shutdown complete.")

