# CyberAI Platform — System Architecture

## Architecture Diagram

```text
                 ┌────────────────────────────────┐
                 │       React.js + Vite          │
                 │   Client Frontend (Port 5173)  │
                 └───────────────┬────────────────┘
                                 │ HTTP REST (JWT Auth)
                                 ▼
                 ┌────────────────────────────────┐
                 │      Node.js + Express.js      │
                 │    Main Backend (Port 5000)    │
                 └───────────────┬────────────────┘
                                 │
                 ┌───────────────┴────────────────┐
                 │                                │
                 ▼                                ▼
    ┌─────────────────────────┐      ┌─────────────────────────┐
    │     MongoDB Database    │      │  Python FastAPI Service │
    │   (Events, Incidents)   │      │    AI/ML (Port 8000)     │
    └─────────────────────────┘      └────────────┬────────────┘
                                                  │
                                                  ▼
                                         Scikit-Learn Models
                                       (Isolation Forest, RF)
```

## Key Architectural Principles

1. **Strict MERN Base**: Node.js and Express.js handle all client communication, authentication, routing, and database persistence.
2. **Dedicated Python AI Microservice**: Python FastAPI runs on port 8000 and is responsible ONLY for Machine Learning processing (unsupervised Isolation Forest anomaly detection, hybrid threat classification, factor-weighted explainable risk scoring, attack sequence correlation, and online retraining).
3. **Safety Simulation Guarantee**: In defensive cybersecurity compliance, all response actions (IP blocking, host isolation, account locking) are executed in dry-run sandbox simulation with the permanent system banner: `● SYSTEM ONLINE | SIMULATION MODE`.
