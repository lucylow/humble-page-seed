
from pathlib import Path
import argparse
from datetime import datetime
from jinja2 import Template
from tools.spec_generator.improve_spec import SpecGenerator, ARCHITECTURE_MERMAID

INNOVATION_TEMPLATE_STR = """
# Technical Innovation Writeup: {{ project_name }}

## 1. Executive Summary

{{ executive_summary }}

## 2. Technical Architecture & Core Innovation

This section should detail your system's design and what makes it novel.

### High-Level Architecture:

{{ architecture_mermaid }}

The most robust and common pattern involves a backend orchestrator:
`Mobile Client (UI Layer) → Your Backend API (Orchestrator) → AI Agent (Brain) → Tools/APIs (Actions) → Mobile Client (Result)`

### The AI Agent as a "Task Executor":

Our agent clearly differentiates itself from a simple chatbot by:

-   **Using Tools:** It can call functions/APIs (e.g., `getWeather()`, `searchHotels()`).
-   **Having Memory:** It can remember context beyond the current prompt.
-   **Making Decisions:** It plans multi-step tasks (e.g., "To book a flight, I need to check calendars, search options, then fill details").
-   **Executing Actions:** It performs tangible tasks, not just generates text.

### Innovation Deep-Dive:

| Feature | Standard LLM (Chatbot) | Your AI Agent (Innovation) |
| :--- | :--- | :--- |
| **Core Function** | Text generation and conversation | **Task execution and automation** |
| **Mobile Context** | Limited or generic | **Deep, on-device integration** using **Visual Perception (OCR, UI Element Detection)** |
| **Action Scope** | Cannot perform actions | Can **autonomously trigger tools/APIs** like `tap()`, `type_text()` based on visual cues |
| **Learning & Adaptation** | Static, session-based | **Learns from user interactions** via **Reinforcement Learning and LLM Reflection** |
| **Example** | "Here's how you could book a flight." | **Executes the steps to book the flight for you.** |

## 3. Implementation Strategy

Detail your technical choices to demonstrate production readiness.

-   **Frontend (Mobile Client):** React Native / Flutter for cross-platform UI, capturing user intent and displaying streaming responses. Utilizes **AG-UI** for event-driven communication.
-   **Backend & AI Orchestration:** Python/Flask for managing the agent's logic, securely calling tools, and interacting with the LLM.
-   **AI Model & Tools:** Primary LLM (e.g., GPT-4, Gemini) for planning. Key tools include `VisualPerception`, `ActionExecutor`, `RecoveryManager`.

## 4. Responsible AI Design

Adheres to principles of Fairness, Reliability & Safety (Emergency Stop), Privacy & Security (real-time PII masking), Transparency (reasoning trace), and Accountability (full audit trail).

"""

INNOVATION_TEMPLATE = Template(INNOVATION_TEMPLATE_STR)

class InnovationGenerator(SpecGenerator):
    def __init__(self, project_name: str, executive_summary: str):
        super().__init__(project_name, executive_summary)

    def generate_innovation_markdown(self) -> str:
        return INNOVATION_TEMPLATE.render(
            project_name=self.project_name,
            executive_summary=self.executive_summary,
            architecture_mermaid=ARCHITECTURE_MERMAID
        )

def main():
    parser = argparse.ArgumentParser(description="Generate or improve innovation write-ups for AutoRL.")
    parser.add_argument("--project_name", type=str, default="AutoRL AI Agent",
                        help="Name of the project.")
    parser.add_argument("--executive_summary", type=str,
                        default="AutoRL is a mobile-native AI agent designed to automate complex multi-app workflows on Android/iOS devices using a novel combination of LLM-powered planning and visual perception.",
                        help="Executive summary of the project.")
    parser.add_argument("--output_dir", type=str, default=".",
                        help="Directory to save generated documents.")
    parser.add_argument("--format", type=str, choices=["md", "docx", "all"], default="all",
                        help="Output format for the innovation write-up.")

    args = parser.parse_args()

    generator = InnovationGenerator(args.project_name, args.executive_summary)
    output_path = Path(args.output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    if args.format == "md" or args.format == "all":
        innovation_md = generator.generate_innovation_markdown()
        (output_path / "innovation_writeup.md").write_text(innovation_md)
        print(f"Generated innovation_writeup.md in {output_path}")

    if args.format == "docx" or args.format == "all":
        generator.generate_innovation_docx(output_path / "innovation_writeup.docx")
        print(f"Generated innovation_writeup.docx in {output_path}")

if __name__ == "__main__":
    main()

