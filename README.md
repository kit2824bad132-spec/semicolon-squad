# CyberAI Platform — AI Powered Autonomous Cybersecurity & Incident Investigation

**BUILDATHON 2026 Problem Statement**: AI Powered Autonomous Cybersecurity & Incident Investigation

A complete, modern, functional Security Operations Center (SOC) platform designed to monitor security events, detect anomalies using machine learning, classify threats, compute explainable risk scores, reconstruct correlated attack sequences, safely simulate autonomous responses, manage incidents, and learn continuously from analyst feedback.

---

## 🛡️ Key Features

1. **Real-time SOC Monitoring**: Ingests network logs and visualizes threat severity, timeline activity, and categories with interactive Recharts.
2. **AI Anomaly Detection**: Unsupervised `Isolation Forest` machine learning model deployed via FastAPI to identify subtle log outliers and score anomaly probabilities.
3. **Explainable Risk Engine**: Calculates a 0–100 explainable risk score broken down by specific factor additions (+25 failed logins, +20 privilege escalation, +15 external IP) alongside non-certainty defensive narratives.
4. **Hybrid Threat Classification**: Classifies activity into Brute Force, Port Scan, Suspicious Login, Privilege Escalation, Data Exfiltration, and Malware-like Behavior.
5. **Correlated Attack Sequence Timeline**: Reconstructs step-by-step causal attack chains across multi-stage incidents.
6. **Defensive Safety & Autonomous Simulation**: All response playbooks (IP Blocking, Host Isolation, Account Lock) execute in sandbox simulation with the permanent system indicator: `● SYSTEM ONLINE | SIMULATION MODE`.
7. **CyberAI Security Assistant**: Natural language chatbot providing forensic answers grounded in actual application data.
8. **Continuous Learning Loop**: Analysts label alerts as *Confirmed Threat* or *False Positive*, triggering online retraining of Isolation Forest contamination rates.
9. **Structured Report Generation**: Produces executive audit reports ready for printing or PDF export.

---

## 🏗️ MERN + Python Microservice Architecture

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

---

## 💻 Tech Stack

- **Frontend**: React.js 18, Vite, Tailwind CSS (Custom enterprise theme), React Router v6, Axios, Recharts, Lucide React icons, Material Symbols Outlined.
- **Main Backend**: Node.js, Express.js, Mongoose, JWT Authentication, bcryptjs, Multer (CSV upload), Axios.
- **Database**: MongoDB (with seamless in-memory fallback store).
- **AI/ML Microservice**: Python 3.10+, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn (`IsolationForest`, `RandomForestClassifier`).

---

## 🔑 Demo Credentials

- **Email**: `admin@cyberai.com`
- **Password**: `admin123`

---

## 🚀 Running the Project

### Option A: Three Terminal Method (Recommended)

#### Terminal 1 — React Frontend
```bash
cd client
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

#### Terminal 2 — Node/Express Main Backend
```bash
cd server
npm install
npm run dev
```
*(Runs on `http://localhost:5000`)*

#### Terminal 3 — Python AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*(Runs on `http://localhost:8000`)*

### Option B: Root Concurrently Method
```bash
npm run install:all
npm run dev
```

---

## 👥 Team Members
**Semicolon Squad** — BUILDATHON 2026
