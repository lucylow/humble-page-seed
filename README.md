
# AutoRL AI Agent: Production-Ready Mobile Automation

## Overview

AutoRL is a mobile-native AI agent designed to automate complex multi-app workflows on Android/iOS devices. It leverages a novel combination of Large Language Model (LLM)-powered planning, visual perception, and reinforcement learning to achieve robust and adaptable mobile automation. This project is built to meet the criteria for "Production Ready Apps" and "Ideas with Full Tech Spec" in the Open Mobile Hub AI Agent Competition.

## Features

-   **LLM-Powered Planning**: Utilizes advanced LLMs (e.g., GPT-4o / Gemini Flash) to interpret user intent and current UI state, generating dynamic action plans.
-   **Visual Perception**: Employs OCR and UI element detection to understand the mobile screen, enabling interaction with any application without requiring access to its underlying code.
-   **Reinforcement Learning Integration**: Policy Manager allows for the integration of RL policies to optimize task execution and adapt to new environments.
-   **Robust Action Execution**: Uses Appium WebDriver for reliable interaction with mobile devices (tap, type, swipe, etc.).
-   **Error Recovery & Reflection**: Includes a Recovery Manager and LLM-based reflection to handle unexpected UI states or execution failures, ensuring task completion.
-   **Production Readiness**: Incorporates comprehensive logging, Prometheus metrics, secure data handling (PII masking), and a Dockerized deployment strategy.
-   **Full-Stack Solution**: Includes a responsive landing page, a React-based frontend dashboard for monitoring and control, and a Flask API backend.
-   **Automated Documentation**: Tools to generate detailed technical specifications and innovation write-ups.

## Architecture

The system follows a multi-agent orchestration pattern, cleanly separating concerns between perception, reasoning, and action. The core flow is: **Mobile Interface** -> **Orchestrator API** -> **Specialized Agents (Perception, Planning, Execution)** -> **Mobile Interface**.

```mermaid
flowchart LR
    subgraph Mobile Device
        A[Mobile Client  
(screen capture, UI hooks)]
        B[On-Device Perception  
(OCR, Detectors, Embeddings)]
        C[Local Memory  
(Plan Cache, Embeddings)]
    end
    subgraph Backend
        D[Orchestrator API  
(FastAPI)]
        E[Planning LLM  
(LLM + Prompting Layer)]
        F[RL Trainer & Replay DB  
(Gym-like envs)]
        G[Vector DB & Plan Repo  
(Qdrant / SQLite)]
        H[HITL Service & Audit Logs]
        I[Monitoring & Metrics  
(Prometheus / Grafana)]
    end
    A --> B --> D
    D --> E
    E --> D
    D --> F
    F --> G
    D --> H
    H --> D
    G --> E
    I --> D
```

### Components:

-   **`landing-page/`**: Static HTML/CSS/JS landing page for project presentation.
-   **`autorl-frontend/`**: React.js application providing a dashboard for monitoring agent status, tasks, and metrics.
-   **`api_server.py`**: Flask-based REST API serving as the orchestrator, handling requests from the frontend and coordinating with backend agents.
-   **`main.py`**: The core AI agent orchestrator, responsible for managing the lifecycle of tasks, devices, and agent interactions.
-   **`src/perception/visual_perception.py`**: Handles screen capture, OCR (using Tesseract), and UI element detection.
-   **`src/llm/llm_planner.py`**: Interfaces with LLMs to generate action plans and perform reflection for error recovery.
-   **`src/runtime/device_manager.py`**: Manages connected mobile devices and their Appium sessions.
-   **`src/tools/action_execution.py`**: Executes actions (tap, type, swipe) on the mobile device via Appium.
-   **`src/runtime/recovery.py`**: Implements strategies for recovering from unexpected states during task execution.
-   **`src/rl/policy_manager.py`**: Manages and applies RL policies for agent behavior.
-   **`src/production_readiness/`**: Contains modules for enhanced logging (`logging_utils.py`) and Prometheus metrics (`metrics_server.py`).
-   **`src/security/data_masking.py`**: Placeholder for PII masking functionalities.
-   **`src/tools/spec_generator/improve_spec.py`**: Tool to generate detailed technical specifications.
-   **`src/tools/innovation_generator/improve_innovation.py`**: Tool to generate innovation write-ups.

## Getting Started

### Prerequisites

-   Docker and Docker Compose (ensure `docker compose` command is available)
-   An OpenAI API Key (or compatible LLM API key) for the LLM Planner. Set this as an environment variable `OPENAI_API_KEY`.

### Setup and Run with Docker Compose

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd autorl_project
    ```

2.  **Set your OpenAI API Key:**
    Create a `.env` file in the root of the `autorl_project` directory with your OpenAI API key:
    ```
    OPENAI_API_KEY=your_openai_api_key_here
    ```

3.  **Build and start the services:**
    ```bash
    docker compose build
    docker compose up -d
    ```

    This will:
    -   Start an Appium server.
    -   Build and run the Flask backend API, which also starts the AI agent orchestrator (`main.py`) in the background.
    -   Build and run the React frontend application.
    -   Serve the static landing page.

4.  **Access the applications:**
    -   **Landing Page**: `http://localhost:80`
    -   **Frontend Dashboard**: `http://localhost:3000`
    -   **Backend API**: `http://localhost:5000`
    -   **Prometheus Metrics**: `http://localhost:9000/metrics`

### Manual Setup (for development/debugging)

1.  **Backend & AI Agent:**
    -   Install Python dependencies: `pip install -r requirements.txt`
    -   Install Tesseract OCR (e.g., `sudo apt-get install tesseract-ocr` on Ubuntu).
    -   Start Appium server manually: `appium --base-path /wd/hub`
    -   Run the API server: `python api_server.py`
    -   The `main.py` orchestrator will be started by `api_server.py`.

2.  **Frontend:**
    -   Navigate to `autorl-frontend/`.
    -   Install Node.js dependencies: `npm install` or `yarn install`
    -   Start the React app: `npm start` or `yarn start`

3.  **Landing Page:**
    -   The `landing-page/` directory contains static files. You can serve them using any static file server (e.g., Nginx, Python's `http.server`).

## Usage

-   **Frontend Dashboard**: Interact with the dashboard at `http://localhost:3000` to monitor agent activity, view device status, and potentially trigger tasks (API endpoints are provided for this).
-   **Backend API**: Use the API endpoints (e.g., `/api/devices`, `/api/tasks`, `/api/agent/start`, `/api/plan`, `/api/perception/analyze`) to programmatically control and query the agent.
-   **Technical Specification Generation**: Run `python autorl_project/tools/spec_generator/improve_spec.py --format all` to generate `technical_specification.md`, `.docx`, and `.pptx` files.
-   **Innovation Write-up Generation**: Run `python autorl_project/tools/innovation_generator/improve_innovation.py --format all` to generate `innovation_writeup.md` and `.docx` files.

## Production Readiness & MLOps Considerations

-   **Logging**: Centralized, structured logging with PII masking capabilities.
-   **Monitoring**: Prometheus metrics exposed for real-time performance tracking (task success/failure, active tasks, runtime).
-   **Scalability**: Microservices architecture allows independent scaling of components.
-   **Security**: Placeholder for data masking and secure communication.
-   **Reproducibility**: Use of Docker ensures consistent environments.
-   **Continuous Learning**: Designed to integrate with RL training pipelines for ongoing model improvement.

## Future Enhancements

-   Integration with a real-time message queue (e.g., Kafka, RabbitMQ) for inter-service communication.
-   Advanced PII masking and data anonymization techniques.
-   Full implementation of RL training and deployment pipeline.
-   More sophisticated UI element detection models (e.g., fine-tuned YOLO).
-   User authentication and authorization for the frontend and API.
-   Comprehensive end-to-end testing framework.

This project provides a strong foundation for a production-ready AI agent, demonstrating a clear technical vision and adherence to modern software engineering and MLOps practices.

