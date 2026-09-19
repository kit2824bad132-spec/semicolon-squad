# CyberAI Platform — REST API Reference

## 1. Authentication Endpoints
- `POST /api/auth/login`: Authenticate user and issue JWT token.
- `GET /api/auth/me`: Retrieve currently authenticated user profile.

## 2. Security Events Endpoints
- `POST /api/events/upload`: Upload security log CSV dataset.
- `GET /api/events`: List ingested security events.
- `POST /api/events/analyze`: Trigger Python Isolation Forest anomaly detection & threat classification.

## 3. Incident Management Endpoints
- `GET /api/incidents`: Retrieve incident queue.
- `POST /api/incidents`: Create custom incident.
- `GET /api/incidents/:id`: Retrieve detailed incident view.
- `PUT /api/incidents/:id`: Update incident status or analyst notes.
- `POST /api/incidents/:id/investigate`: Reconstruct step-by-step attack sequence.
- `POST /api/incidents/:id/feedback`: Record analyst feedback (Confirmed Threat / False Positive).
- `POST /api/incidents/:id/response`: Execute simulated autonomous response action.

## 4. Reports & Assistant Endpoints
- `GET /api/dashboard`: Retrieve real-time SOC metrics & Recharts data arrays.
- `POST /api/reports`: Generate structured executive PDF/HTML report.
- `GET /api/reports/:id`: View report details.
- `POST /api/assistant`: Query CyberAI Assistant chatbot.
- `POST /api/model/retrain`: Retrain AI/ML models using stored feedback.

## 5. Python AI Microservice Endpoints (Internal Port 8000)
- `POST /detect`: Isolation Forest anomaly detection.
- `POST /classify`: Threat category classification.
- `POST /risk-score`: Explainable factor-weighted risk scoring.
- `POST /investigate`: Attack sequence timeline correlation.
- `POST /retrain`: Online model hyperparameter tuning.
