from prometheus_client import start_http_server, Gauge, Counter
import time
import random
import logging

logger = logging.getLogger("MetricsServer")

task_success = Counter("autor_rl_success_total", "Successful tasks")
task_failure = Counter("autor_rl_failure_total", "Failed tasks")
avg_runtime = Gauge("autor_rl_avg_runtime_sec", "Average runtime per task")

def start_metrics_server(port: int = 9000):
    """Starts the Prometheus metrics server."""
    try:
        start_http_server(port)
        logger.info(f"Prometheus metrics server started on port {port}")
    except Exception as e:
        logger.error(f"Failed to start Prometheus metrics server: {e}")

def record_task_metrics(success: bool, runtime_sec: float):
    """Records task success/failure and runtime metrics."""
    if success:
        task_success.inc()
    else:
        task_failure.inc()
    avg_runtime.set(runtime_sec)
    logger.debug(f"Recorded task metrics: success={success}, runtime={runtime_sec}s")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    start_metrics_server(9000)
    print("Simulating metrics for 60 seconds...")
    for _ in range(30):
        s = random.random() < 0.9
        r = random.uniform(1, 4)
        record_task_metrics(s, r)
        time.sleep(2)
    print("Simulation finished.")

