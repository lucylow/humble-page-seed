import asyncio
from typing import List, Callable, Tuple, Any, Dict
from src.runtime.device_manager import DeviceManager, Device
import psutil

class TaskRunner:
    """Run tasks on multiple devices in parallel"""
    def __init__(self, device_manager: DeviceManager):
        self.device_manager = device_manager

    async def _execute_single_task(self, task_func: Callable, *args, **kwargs) -> Any:
        device = None
        try:
            device = await self.device_manager.acquire_device()
            print(f"Executing task on {device.device_id}")
            result = await task_func(device, *args, **kwargs)
            return result
        except Exception as e:
            print(f"Error executing task on {device.device_id if device else 'unknown device'}: {e}")
            raise # Re-raise the exception after logging
        finally:
            if device:
                await self.device_manager.release_device(device)

    async def run_all_tasks(self, tasks_with_args: List[Tuple[Callable, Tuple, Dict]]) -> List[Any]:
        """Runs a list of tasks (each with its own function, args, and kwargs) in parallel.
        tasks_with_args: List of tuples, where each tuple is (task_func, args_tuple, kwargs_dict).
        """
        if not tasks_with_args:
            return []

        # Create a list of coroutines to be run concurrently
        coroutines = [self._execute_single_task(func, *args, **kwargs) for func, args, kwargs in tasks_with_args]

        # Run all coroutines in parallel and gather their results
        results = await asyncio.gather(*coroutines, return_exceptions=True)

        # Handle exceptions from individual tasks if any
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"Task {i} failed with exception: {result}")
                # Depending on requirements, you might want to re-raise, log, or return a specific error object
        return results

def get_recommended_parallel_tasks() -> int:
    """Determines the recommended number of parallel tasks based on system resources."""
    mem_percent = psutil.virtual_memory().percent
    cpu_percent = psutil.cpu_percent(interval=1) # interval=1 to get a non-zero value

    # Simple heuristic: adjust based on memory and CPU usage
    if mem_percent > 85 or cpu_percent > 90:
        return 2 # Very high load, reduce parallelism
    elif mem_percent > 70 or cpu_percent > 75:
        return 4 # High load
    elif mem_percent > 50 or cpu_percent > 50:
        return 6 # Moderate load
    else:
        return 8 # Default for lower load, can be adjusted based on typical device/emulator count


