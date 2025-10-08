from flask import Flask, jsonify, request
from flask_cors import CORS
import asyncio
from datetime import datetime
import threading
import logging

from src.runtime.device_manager import Device, DeviceManager
from src.production_readiness.metrics_server import start_metrics_server, record_task_metrics, task_success, task_failure, avg_runtime
from src.production_readiness.logging_utils import log_event, mask_sensitive, store_secure_log, decrypt_secure_log
from src.runtime.logging import MaskedLogger # Still use MaskedLogger for sensitive data in general logs
from src.rl.policy_manager import PolicyManager

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize logger globally for API server
api_logger = MaskedLogger(name="AutoRL_API")

# Initialize DeviceManager and PolicyManager
device_manager_instance = DeviceManager() 
policy_manager_instance = PolicyManager()

# --- Activity Log (for dashboard display) ---
activity_log = [
    {"timestamp": datetime.now().strftime("%H:%M:%S"), "message": "API Server started", "level": "info"}
]

def update_activity_log(message: str, level: str = "info"):
    activity_log.insert(0, {"timestamp": datetime.now().strftime("%H:%M:%S"), "message": message, "level": level})
    if len(activity_log) > 100: # Keep log size manageable
        activity_log.pop()
    log_event("API_ACTIVITY", message, level.upper()) # Log to production readiness event log

# --- API Endpoints ---

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    log_event("HEALTH_CHECK", "API health check performed", "DEBUG")
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route("/api/devices", methods=["GET"])
def get_devices():
    """Get all connected devices and their statuses"""
    devices_list = []
    # This needs to be an async call to device_manager_instance.devices if it fetches live data
    # For now, we'll assume device_manager_instance.devices is a list of Device objects populated by main.py
    for device in device_manager_instance.devices:
        devices_list.append({
            "id": device.device_id,
            "platform": device.platform,
            "is_real": device.is_real,
            "status": "active" if device.session else "idle", 
            "currentTask": "N/A" 
        })
    return jsonify(devices_list)

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    """Get all tasks (currently mock data) - in a real system, this would query a task queue/DB"""
    # Placeholder for actual task data from orchestrator
    return jsonify([]) 

@app.route("/api/tasks", methods=["POST"])
def create_task():
    """Create a new task (currently mock data) - would trigger orchestrator in real system"""
    data = request.json
    new_task_name = data.get("name", "Unnamed Task")
    update_activity_log(f"New task '{new_task_name}' requested.")
    api_logger.info(f"New task request: {new_task_name}", data=data)
    # In a real system, this would send a message to the orchestrator (e.g., via a message queue)
    return jsonify({"status": "acknowledged", "message": f"Task '{new_task_name}' queued for orchestrator"}), 202

@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    """Get system metrics from Prometheus client"""
    metrics_data = {
        "total_tasks_success": task_success._value,
        "total_tasks_failure": task_failure._value,
        "avg_task_runtime_seconds": avg_runtime._value,
        # Add other metrics as needed
    }
    return jsonify(metrics_data)

@app.route("/api/activity", methods=["GET"])
def get_activity():
    """Get recent activity log"""
    return jsonify(activity_log)

@app.route("/api/agent/start", methods=["POST"])
def start_agent():
    """Simulate starting the AI agent orchestrator"""
    update_activity_log("Agent start requested via API.", "info")
    api_logger.info("Agent start requested via API")
    return jsonify({"status": "acknowledged", "message": "Agent orchestrator start signal sent"})

@app.route("/api/agent/stop", methods=["POST"])
def stop_agent():
    """Simulate stopping the AI agent orchestrator"""
    update_activity_log("Agent stop requested via API.", "info")
    api_logger.info("Agent stop requested via API")
    return jsonify({"status": "acknowledged", "message": "Agent orchestrator stop signal sent"})

@app.route("/api/policies", methods=["GET"])
def get_policies():
    """Get all registered policies from PolicyManager"""
    policies_info = []
    for name, data in policy_manager_instance.policies.items():
        policies_info.append({
            "name": name,
            "version": data.get("version"),
            "is_active": name == policy_manager_instance.active_policy_name,
            "strategy": data.get("policy_data", {}).get("strategy", "unknown") 
        })
    return jsonify(policies_info)

@app.route("/api/policies/promote", methods=["POST"])
def promote_policy():
    """Promote a policy to active"""
    data = request.json
    policy_name = data.get("policy_name")
    if policy_name and policy_manager_instance.promote_policy(policy_name):
        update_activity_log(f"Policy '{policy_name}' promoted to active.", "success")
        api_logger.info(f"Policy '{policy_name}' promoted to active.")
        return jsonify({"status": "success", "message": f"Policy {policy_name} promoted."})
    update_activity_log(f"Failed to promote policy '{policy_name}'.", "error")
    api_logger.error(f"Failed to promote policy '{policy_name}'.")
    return jsonify({"status": "error", "message": f"Failed to promote policy {policy_name}"}), 400

def run_metrics_server_thread():
    # This function will be run in a separate thread
    start_metrics_server(port=8000)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO) # Basic logging for the API server
    api_logger.info("Starting AutoRL API Server")

    # Start Prometheus metrics server in a separate thread
    metrics_thread = threading.Thread(target=run_metrics_server_thread, daemon=True)
    metrics_thread.start()

    # Add dummy devices to the manager for API exposure
    # In a real setup, main.py would manage the actual Appium sessions
    asyncio.run(device_manager_instance.add_device(Device("emulator-5554", "android", False)))
    asyncio.run(device_manager_instance.add_device(Device("iPhone 15", "ios", False)))
    asyncio.run(device_manager_instance.add_device(Device("emulator-5556", "android", False)))

    # Register a dummy policy for API exposure
    policy_manager_instance.register_policy("initial_policy", {"strategy": "explore", "params": {"epsilon": 0.1}}, is_active=True)
    policy_manager_instance.register_policy("optimized_policy", {"strategy": "exploit", "params": {"epsilon": 0.01}})

    api_logger.info("AutoRL API Server ready on port 5000")
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False) 

