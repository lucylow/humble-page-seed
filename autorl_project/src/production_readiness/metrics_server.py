from prometheus_client import start_http_server, Counter, Gauge, Histogram, Info
import time
import random
import logging
from contextlib import asynccontextmanager

logger = logging.getLogger("MetricsServer")

# Define comprehensive Prometheus metrics
task_success_counter = Counter('autorl_task_success_total', 'Successful task completions', ['agent', 'task_type'])
task_failure_counter = Counter('autorl_task_failure_total', 'Failed task executions', ['agent', 'error_type'])
current_active_tasks_gauge = Gauge('autorl_active_tasks', 'Current active tasks')
avg_runtime_gauge = Gauge('autorl_avg_runtime_seconds', 'Average task runtime in seconds')
task_duration_histogram = Histogram('autorl_task_duration_seconds', 'Task execution time distribution', ['agent', 'task_type'])
device_count_gauge = Gauge('autorl_active_devices', 'Number of active devices')
recovery_attempts_counter = Counter('autorl_recovery_attempts_total', 'Total recovery attempts', ['success'])
error_rate_gauge = Gauge('autorl_error_rate', 'Error rate over time window')

# Legacy metrics for backward compatibility
task_success = task_success_counter.labels(agent='default', task_type='default')
task_failure = task_failure_counter.labels(agent='default', error_type='unknown')
avg_runtime = avg_runtime_gauge

# System info
system_info = Info('autorl_system', 'AutoRL system information')

class PerformanceMonitor:
    """Monitors and records performance metrics"""
    
    def __init__(self):
        self._task_runtimes = []
        self._max_runtime_samples = 100
    
    @asynccontextmanager
    async def measure_task(self, task_id: str, agent_name: str, task_type: str = "default"):
        """Context manager to measure task execution time"""
        start_time = time.time()
        current_active_tasks_gauge.inc()
        
        try:
            yield
            duration = time.time() - start_time
            
            # Record success metrics
            task_success_counter.labels(agent=agent_name, task_type=task_type).inc()
            task_duration_histogram.labels(agent=agent_name, task_type=task_type).observe(duration)
            
            # Update average runtime
            self._update_avg_runtime(duration)
            
            logger.debug(f"Task {task_id} completed in {duration:.2f}s")
            
        except Exception as e:
            duration = time.time() - start_time
            error_type = type(e).__name__
            
            # Record failure metrics
            task_failure_counter.labels(agent=agent_name, error_type=error_type).inc()
            
            logger.error(f"Task {task_id} failed after {duration:.2f}s: {str(e)}")
            raise
            
        finally:
            current_active_tasks_gauge.dec()
    
    def _update_avg_runtime(self, duration: float):
        """Update average runtime calculation"""
        self._task_runtimes.append(duration)
        if len(self._task_runtimes) > self._max_runtime_samples:
            self._task_runtimes.pop(0)
        
        avg = sum(self._task_runtimes) / len(self._task_runtimes)
        avg_runtime_gauge.set(avg)
    
    def update_device_count(self, count: int):
        """Update active device count"""
        device_count_gauge.set(count)
        logger.debug(f"Active devices: {count}")
    
    def record_recovery_attempt(self, success: bool):
        """Record recovery attempt"""
        recovery_attempts_counter.labels(success=str(success).lower()).inc()


def start_metrics_server(port: int = 8000):
    """Start Prometheus metrics server"""
    try:
        start_http_server(port)
        
        # Set system info
        system_info.info({
            'version': '1.0.0',
            'environment': 'production'
        })
        
        logger.info(f"Prometheus metrics server started on port {port}")
        print(f"[Metrics] Prometheus metrics server started on port {port}")
    except Exception as e:
        logger.error(f"Failed to start metrics server: {str(e)}")
        raise


def record_task_metrics(success: bool, runtime_sec: float, agent_name: str = "default", task_type: str = "default"):
    """Records task success/failure and runtime metrics (legacy function for compatibility)"""
    if success:
        task_success_counter.labels(agent=agent_name, task_type=task_type).inc()
    else:
        task_failure_counter.labels(agent=agent_name, error_type="unknown").inc()
    
    avg_runtime_gauge.set(runtime_sec)
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

