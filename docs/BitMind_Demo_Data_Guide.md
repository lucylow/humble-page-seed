# BitMind Demo Data Guide

This guide provides an overview of the mock data files included in the `data/` directory for the BitMind Smart Invoice Demo.
These files are designed to facilitate local development, testing, and demonstration of the application's features without requiring live blockchain interactions or external API calls.

## Data Files Overview

### `bitmind_demo_data.json`
This file contains mock data representing a collection of invoices with their associated milestones. It simulates the core data structure that the BitMind Smart Invoice application would manage on the blockchain.

**Purpose:**
- To provide sample invoice data for backend logic testing.
- To simulate different invoice states (e.g., pending, completed milestones).

**Structure Example:**
```json
{
  "invoices": [
    {
      "id": "INV-001",
      "client": "DAO_A",
      "amount": 1000,
      "currency": "STX",
      "milestones": [
        { "id": 1, "description": "Phase 1 Completion", "status": "completed" },
        { "id": 2, "description": "Phase 2 Completion", "status": "pending" }
      ]
    }
  ]
}
```

### `bitmind_ui_demo_data.json`
This file holds data specifically tailored for the user interface demonstration. It includes simplified invoice representations suitable for displaying in frontend components.

**Purpose:**
- To populate UI components with sample data for visual testing.
- To demonstrate various invoice statuses and progress bars in the frontend.

**Structure Example:**
```json
{
  "ui_invoices": [
    {
      "id": "UI-INV-001",
      "title": "Website Redesign",
      "status": "In Progress",
      "progress": 60
    }
  ]
}
```

### `bitmind_test_data.json`
This file contains predefined test cases and expected outcomes for unit and integration testing of the application's logic.

**Purpose:**
- To drive automated tests for smart contract interactions and application business logic.
- To ensure consistent and predictable test results.

**Structure Example:**
```json
{
  "test_cases": [
    {
      "name": "Invoice Creation Success",
      "input": {"client": "TestDAO", "amount": 100, "currency": "STX"},
      "expected_output": {"status": "pending"}
    }
  ]
}
```

## Usage in Demo

These mock data files can be loaded by the application's frontend or backend components to simulate real-world scenarios. For example, the `src/invoice-manager.js` or UI components might read from these JSON files to display invoices or process mock transactions without needing a live blockchain connection.

Refer to the `README.md` for instructions on how to set up and run the demo, which will utilize these data files.
