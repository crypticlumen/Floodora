# Floodora: Smart Drainage Monitoring & Early Flood-Risk Awareness (Backend Service)

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)
[![Tests Passing](https://img.shields.io/badge/tests-30%20passed-brightgreen.svg)](tests/)

This repository contains the standalone **Floodora Backend Service**, providing REST API endpoints for:
- **Drainage Risk Assessment (`/api/assess`)**: Transparent heuristic risk scoring (0–100), categories (LOW, MEDIUM, HIGH, CRITICAL), contributing factors, and operational recommendations.
- **What-If Scenario Simulation (`/api/simulate`)**: Immutable scenario evaluation comparing baseline with hypothetical overrides (rainfall, blockage, etc.).
- **Monitored Locations (`/api/locations`)**: Pre-configured Mumbai drainage hotspots (Dadar Culvert, Hindmata Sump, Andheri Subway, Kurla Collector, Milan Subway).
- **Preset Scenarios (`/api/scenarios`)**: Pre-configured demo scenarios for operator walkthroughs and presentations.
- **Session Audit History (`/api/history`)**: In-memory logging of recent assessments.

---

## 📂 Project Structure

```
Floodora/
├── .gitignore                      # Python, venv, cache & test exclusions
├── requirements.txt                # FastAPI, Uvicorn, Pydantic, Pytest
├── README.md                       # Documentation & API reference
├── backend/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application, CORS, and health checks
│   ├── models.py                   # Pydantic schemas, validation, and contracts
│   ├── data_store.py               # Monitored locations, demo presets & history store
│   ├── services/
│   │   ├── __init__.py
│   │   ├── risk_service.py         # Drainage risk scoring, categories & recommendations
│   │   └── simulation_service.py   # Immutable what-if simulation & delta analysis
│   └── api/
│       ├── __init__.py
│       └── routes_risk.py          # REST API route handlers
└── tests/
    ├── __init__.py
    ├── test_api.py                 # End-to-end API route & status tests
    ├── test_risk_engine.py         # Risk scoring, validation & capping tests
    └── test_simulator.py           # Simulation delta & immutability tests
```

---

## 🚀 Quickstart

### 1. Setup Virtual Environment
```bash
py -m venv .venv
.\.venv\Scripts\activate.bat
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Automated Tests
```bash
pytest -v
```
*(All 30 automated unit and integration tests passing)*

### 4. Start the Backend Server
```bash
uvicorn backend.main:app --reload --port 8000
```
Open **[http://localhost:8000/docs](http://localhost:8000/docs)** for interactive OpenAPI / Swagger documentation.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service root status and documentation link |
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/assess` | Compute drainage risk score, factors, and recommended actions |
| `POST` | `/api/simulate` | Compare baseline reading with what-if hypothetical overrides |
| `GET` | `/api/locations` | List monitored drainage locations (Dadar, Kurla, Andheri, Hindmata, Milan) |
| `GET` | `/api/locations/{id}` | Retrieve details for a specific drainage hotspot |
| `GET` | `/api/scenarios` | Preset demo scenarios for hackathon presentations |
| `GET` | `/api/history` | Session audit log of recent assessments |

---

## ⚠️ Prototype Scope & Disclaimer

Floodora provides prototype early-warning indicators for decision support. Risk scores are uncalibrated prototype metrics and do not replace official emergency services, certified meteorological models, or human municipal review.
