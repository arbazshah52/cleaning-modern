# Modernstäd.se – Cleaning Service Booking Website

## GitHub Repository

[View the project on GitHub](https://github.com/arbazshah52/cleaning-modern.git)

## Website Purpose

Modernstäd.se is a cleaning-service booking website for private customers and businesses in Malmö and surrounding areas.

The website allows users to:

- Browse available cleaning services.
- Choose private or business booking options.
- Calculate hourly or fixed prices.
- Apply RUT deductions for eligible private services.
- Add travel-zone fees.
- Submit booking requests with personal and address details.
- Receive booking confirmations by email.
- Use an AI price agent to discuss cleaning needs and receive a fixed-price offer.

## Programming Languages Used

- **Python** — Backend logic, API endpoints, pricing calculations, and tests.
- **TypeScript** — Type-safe frontend development.
- **TSX** — React components combining TypeScript and UI markup.
- **HTML/CSS** — Email templates and website presentation.
- **JSON** — Configuration, API data, and AI response structures.

## Backend Technologies

- **FastAPI** — Creates the REST API and backend routes.
- **Uvicorn** — Runs the FastAPI application.
- **Pydantic** — Validates booking, quote, and AI request data.
- **MongoDB** — Stores bookings and AI conversation sessions.
- **Motor** — Provides asynchronous MongoDB access from Python.
- **HTTPX** — Sends asynchronous HTTP requests, including email integration requests.
- **Pytest** — Tests backend functionality.
- **Emergent Integrations** — Connects the AI price agent to language models.

## Frontend Technologies

- **React 19** — Builds the interactive user interface.
- **TypeScript 5** — Provides static typing and safer frontend code.
- **Vite** — Provides the frontend development server and production build.
- **React Router** — Handles application pages and navigation.
- **Tailwind CSS** — Provides utility-based styling.
- **Axios** — Connects the frontend to backend API endpoints.
- **React Hook Form and Zod** — Handle form state and validation.
- **Framer Motion** — Adds animations.
- **Lucide React** — Provides interface icons.
- **Sonner** — Displays toast notifications.

## Testing Used

The project uses **Pytest** for backend testing.

Test coverage includes:

- Service catalog and travel-zone endpoints.
- Hourly and fixed-price quote calculations.
- RUT discount rules.
- Private and business booking validation.
- AI chat and AI booking behavior.
- Company information and health endpoints.
- Long text input handling.
- Email security guardrails.
- Pricing and discount limits.

The main test files are:

- `backend/tests/test_modernstad_api.py`
- `backend/tests/test_ai_agent.py`
- `backend/tests/test_refactor_and_bugfix.py`

Additional backend quality tools listed in the project include **Black**, **isort**, **Flake8**, and **Mypy**.

## Jupyter/IPython Usage

No `.ipynb` files were found in this repository, so Jupyter Notebook or IPython usage cannot be confirmed as part of the current project. The backend does include pandas and NumPy dependencies, but no notebook implementation is currently included.

## What I Learned

- How to build a REST API with FastAPI and Python.
- How to validate user input with Pydantic models.
- How to create pricing rules and apply RUT deductions on the server.
- How to connect a React and TypeScript frontend to a Python backend.
- How to build multi-step booking forms with reusable React components.
- How to store bookings and AI conversations in MongoDB.
- How to integrate an AI agent into a real business workflow.
- How to keep final pricing under server-side control instead of trusting frontend values.
- How to write automated API tests with Pytest.
- How to add validation and security checks for email content and user input.
- How to structure separate user journeys for private customers and businesses.

## LinkedIn Summary

Built a full-stack cleaning-service booking platform using **Python, FastAPI, MongoDB, React, TypeScript, and Vite**. The application supports private and business bookings, automated price calculations, RUT deductions, travel fees, email confirmations, and an AI-powered fixed-price agent. Through this project, I strengthened my skills in REST API development, frontend architecture, database integration, form validation, AI integration, and automated testing.
