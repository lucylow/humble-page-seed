from prometheus_client import Gauge, Counter, Histogram, start_http_server
import time

# Define Prometheus metrics
# Counters for total successes and failures
task_success_total = Counter(
    'autorl_task_success_total', 'Total number of successful task executions'
)
task_failure_total = Counter(
    'autorl_task_failure_total', 'Total number of failed task executions'
)

# Gauge for current number of in-progress tasks
tasks_in_progress = Gauge(
    'autorl_tasks_in_progress', 'Current number of tasks being executed'
)

# Histogram for task duration
task_duration_seconds = Histogram(
    'autorl_task_duration_seconds', 'Histogram of task execution durations',
    buckets=(0.1, 0.5, 1, 5, 10, 30, 60, 120, float('inf'))
)

# Counter for specific error types (e.g., UI_TIMEOUT, LLM_ERROR, RECOVERY_FAILED)
task_error_types_total = Counter(
    'autorl_task_error_types_total', 'Total number of task failures by type',
    ['error_type']
)

# Gauge for RL-specific metrics (example)
rl_cumulative_reward = Gauge(
    'autorl_rl_cumulative_reward', 'Cumulative reward per RL episode',
    ['episode_id']
)
rl_episode_length = Gauge(
    'autorl_rl_episode_length', 'Length of RL episode in steps',
    ['episode_id']
)

def start_metrics_server(port: int = 8000):
    """Starts the Prometheus HTTP server for exposing metrics."""
    try:
        start_http_server(port)
        print(f"Prometheus metrics server started on port {port}")
    except OSError as e:
        print(f"Warning: Could not start Prometheus metrics server on port {port}: {e}")
        print("Metrics will not be exposed via HTTP, but can still be recorded internally.")

def record_task_start():
    """Records the start of a task."""
    tasks_in_progress.inc()
    return time.time() # Return start time for duration calculation

def record_task_end(start_time: float, success: bool, error_type: str = None):
    """Records the end of a task, its success/failure, and duration."""
    tasks_in_progress.dec()
    duration = time.time() - start_time
    task_duration_seconds.observe(duration)

    if success:
        task_success_total.inc()
    else:
        task_failure_total.inc()
        if error_type:
            task_error_types_total.labels(error_type=error_type).inc()

def record_rl_episode_metrics(episode_id: str, reward: float, length: int):
    """Records metrics for a completed RL episode."""
    rl_cumulative_reward.labels(episode_id=episode_id).set(reward)
    rl_episode_length.labels(episode_id=episode_id).set(length)

# Example usage (for testing purposes)
if __name__ == '__main__':
    start_metrics_server(8001) # Use a different port if 8000 is taken by main.py
    print("Recording some dummy metrics...")

    # Simulate a task
    task_start = record_task_start()
    time.sleep(2.5)
    record_task_end(task_start, success=True)

    # Simulate another task that fails
    task_start = record_task_start()
    time.sleep(0.8)
    record_task_end(task_start, success=False, error_type="UI_TIMEOUT")

    # Simulate an RL episode
    record_rl_episode_metrics("episode_001", 15.2, 120)

    print("Metrics recorded. Access them at http://localhost:8001/metrics")
    # Keep the script running to allow Prometheus to scrape
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Exiting metrics example.")

