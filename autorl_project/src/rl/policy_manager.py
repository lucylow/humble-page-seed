import json
from datetime import datetime
from typing import Any, Dict, Optional, Callable, Awaitable
import asyncio

class PolicyManager:
    """Manages the registration, retrieval, and promotion of RL policies."""
    def __init__(self, registry_path: str = "policies.json"):
        self.registry_path = registry_path
        self.policies: Dict[str, Dict[str, Any]] = self._load_registry()
        self.active_policy_name: Optional[str] = None

    def _load_registry(self) -> Dict[str, Dict[str, Any]]:
        try:
            with open(self.registry_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
        except json.JSONDecodeError:
            print(f"Warning: Could not decode JSON from {self.registry_path}. Starting with empty registry.")
            return {}

    def _save_registry(self):
        with open(self.registry_path, "w") as f:
            json.dump(self.policies, f, indent=2)

    def register_policy(self, policy_name: str, policy_object: Any, is_active: bool = False):
        """Registers a new policy or updates an existing one."""
        version = datetime.utcnow().isoformat()
        self.policies[policy_name] = {"version": version, "policy_data": policy_object}
        if is_active or self.active_policy_name is None:
            self.active_policy_name = policy_name
        self._save_registry()
        print(f"Policy \'{policy_name}\' registered (version: {version}). Active: {self.active_policy_name == policy_name}")

    def get_policy(self, policy_name: Optional[str] = None) -> Optional[Any]:
        """Retrieves a policy by name. If no name is given, returns the active policy."""
        name_to_get = policy_name if policy_name else self.active_policy_name
        if name_to_get and name_to_get in self.policies:
            return self.policies[name_to_get]["policy_data"]
        print(f"Warning: Policy \'{name_to_get}\' not found.")
        return None

    def promote_policy(self, policy_name: str) -> bool:
        """Sets the specified policy as the active policy."""
        if policy_name in self.policies:
            self.active_policy_name = policy_name
            print(f"Policy \'{policy_name}\' promoted to active.")
            return True
        print(f"Error: Cannot promote policy \'{policy_name}\' as it does not exist.")
        return False

async def shadow_run(
    policy: Any,
    task_func: Callable[..., Awaitable[Any]],
    *args: Any,
    **kwargs: Any
) -> Any:
    """Runs a given policy in shadow mode without affecting production state.

    Args:
        policy (Any): The policy object to be used for this shadow run.
        task_func (Callable): The asynchronous function representing the task to run.
        *args: Positional arguments to pass to the task_func.
        **kwargs: Keyword arguments to pass to the task_func.

    Returns:
        Any: The result of the task_func execution.
    """
    print(f"[Shadow Run] Starting task with policy: {policy}")
    try:
        # Assuming task_func can accept a policy object or uses the active policy from PolicyManager
        # For this example, we'll just pass it as a kwarg if task_func expects it.
        # In a real scenario, task_func might internally query PolicyManager for the active policy
        # or the policy could be injected into the agent's state.
        result = await task_func(*args, **kwargs, current_policy=policy) # Example of passing policy
        print(f"[Shadow Run] Task completed with result: {result}")
        # Log result but do not commit changes to the main system based on this run
        return result
    except Exception as e:
        print(f"[Shadow Run] Task failed with exception: {e}")
        raise # Re-raise to indicate failure


