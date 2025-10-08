
# AutoRL - AI Agent for Mobile Automation

This project provides a full-stack solution for an AI agent designed for mobile automation, including a landing page, a React-based dashboard, a Flask API backend, and the core AI agent logic.

## Project Structure

- `landing-page/`: Contains the static HTML, CSS, and JavaScript for the project landing page.
- `autorl-frontend/`: A React application serving as the dashboard for monitoring and controlling the AI agent.
- `src/`: Contains the Python modules for the AI agent and backend logic.
  - `src/runtime/`: Device management, recovery, logging, metrics, parallel execution.
  - `src/tools/`: Action execution logic (e.g., tap, type).
  - `src/security/`: Data masking utilities.
  - `src/rl/`: Reinforcement Learning policy management.
- `main.py`: The main orchestration script for the AI agent.
- `api_server.py`: The Flask API backend that the frontend communicates with.
- `Dockerfile`: Dockerfile for the Python backend and AI agent services.
- `autorl-frontend/Dockerfile`: Dockerfile for the React frontend application.
- `requirements.txt`: Python dependencies.
- `docker-compose.yml`: Defines and runs the multi-container Docker application.

## Setup and Running the Project

To get the AutoRL project up and running, you will need Docker and Docker Compose installed on your system.

1.  **Clone the repository (if not already done):**
    ```bash
    git clone <repository-url>
    cd AutoRL
    ```

2.  **Build and start the Docker containers:**
    Navigate to the root directory of the project (where `docker-compose.yml` is located) and run:
    ```bash
    docker-compose up --build -d
    ```
    This command will:
    - Build the `appium-server`, `backend`, `ai-agent`, and `frontend` Docker images.
    - Start all services in detached mode (`-d`).
    - The `appium-server` will be available on port `4723`.
    - The `backend` API will be available on port `5000`.
    - The `ai-agent` will run its orchestration logic.
    - The `frontend` (React dashboard) will be served on port `80`.

3.  **Access the Landing Page:**
    The static landing page is located in the `landing-page/` directory. You can open `landing-page/index.html` directly in your browser or serve it using a simple static file server (e.g., `python3 -m http.server 8000` from within the `landing-page` directory).

4.  **Access the AutoRL Dashboard:**
    Once the Docker containers are running, open your web browser and navigate to:
    ```
    http://localhost
    ```
    This will display the React-based AutoRL Dashboard, which communicates with the Flask backend API.

5.  **Access the Backend API (optional):**
    You can directly access the backend API endpoints (e.g., `http://localhost:5000/api/health`) using tools like `curl` or Postman.

6.  **Stop the services:**
    To stop and remove the Docker containers, run:
    ```bash
    docker-compose down
    ```

## Testing End-to-End Functionality

-   **Verify Services:** Check Docker logs (`docker-compose logs -f`) to ensure all services are starting without errors.
-   **Landing Page:** Open `landing-page/index.html` in your browser to verify its display and functionality.
-   **Dashboard Interaction:** Interact with the React dashboard at `http://localhost`.
    -   Observe the device list, task queue, and metrics updating.
    -   Click the "Start Agent" / "Stop Agent" button and verify that the status changes and log messages appear in the backend/agent logs.
-   **Appium Integration:** The `ai-agent` and `backend` services are configured to connect to the `appium-server`. In a real scenario, you would need to have mobile emulators/simulators or physical devices connected and configured for Appium to interact with them. The current `main.py` has mock Appium interactions for demonstration purposes.

## Limitations and Future Improvements

-   **Mock Appium Interactions:** The `main.py` script currently simulates Appium interactions. For full functionality, a real Appium setup with connected devices/emulators is required.
-   **Frontend-Backend Real-time Updates:** The frontend polls the backend every 5 seconds. For real-time updates, WebSockets could be implemented.
-   **Full AI Agent Logic:** The AI agent logic in `main.py` is a simplified example. A complete implementation would involve integrating actual LLMs, vision models, and sophisticated RL policies.
-   **Database Integration:** The backend uses in-memory data structures (`tasks_db`, `metrics_db`, `activity_log`). For persistence, a database (e.g., PostgreSQL, SQLite) would be integrated.

This comprehensive setup provides a strong foundation for further development and competition submission.
