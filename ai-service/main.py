from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from detection.anomaly_detector import anomaly_detector
from detection.classifier import threat_classifier
from services.risk_engine import risk_engine
from services.investigator import attack_investigator
from training.trainer import model_trainer

app = FastAPI(
    title="CyberAI Autonomous SOC Microservice",
    description="Python AI/ML service for anomaly detection, threat classification, explainable risk scoring, and attack sequence reconstruction.",
    version="1.0.0"
)

# Enable CORS for Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EventBatchRequest(BaseModel):
    events: List[Dict[str, Any]]

class SingleEventRequest(BaseModel):
    event: Dict[str, Any]
    anomaly_score: Optional[float] = 0.5

class RiskScoreRequest(BaseModel):
    event: Dict[str, Any]
    anomaly_score: Optional[float] = 0.5
    threat_info: Optional[Dict[str, Any]] = None

class InvestigateRequest(BaseModel):
    incident: Dict[str, Any]
    related_events: Optional[List[Dict[str, Any]]] = []

class RetrainRequest(BaseModel):
    feedback: List[Dict[str, Any]]

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "service": "CyberAI Python AI/ML Microservice",
        "version": "1.0.0",
        "endpoints": ["/detect", "/classify", "/risk-score", "/investigate", "/retrain", "/health"]
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "model_fitted": anomaly_detector.is_fitted}

@app.post("/detect")
def detect_anomalies(payload: EventBatchRequest):
    try:
        results = anomaly_detector.fit_predict(payload.events)
        return {
            "status": "SUCCESS",
            "count": len(results),
            "anomalies_found": sum(1 for r in results if r["is_anomaly"]),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@app.post("/classify")
def classify_threat(payload: SingleEventRequest):
    try:
        classification = threat_classifier.classify_event(payload.event, payload.anomaly_score)
        return {
            "status": "SUCCESS",
            "classification": classification
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Threat classification failed: {str(e)}")

@app.post("/risk-score")
def calculate_risk(payload: RiskScoreRequest):
    try:
        risk_result = risk_engine.calculate_risk(
            payload.event, 
            payload.anomaly_score, 
            payload.threat_info
        )
        return {
            "status": "SUCCESS",
            "risk": risk_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk score calculation failed: {str(e)}")

@app.post("/investigate")
def investigate_incident(payload: InvestigateRequest):
    try:
        sequence = attack_investigator.reconstruct_sequence(payload.incident, payload.related_events)
        return {
            "status": "SUCCESS",
            "incident_id": payload.incident.get("incidentId", "INC-000"),
            "attack_sequence": sequence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investigation analysis failed: {str(e)}")

@app.post("/retrain")
def retrain_model(payload: RetrainRequest):
    try:
        result = model_trainer.retrain_with_feedback(payload.feedback)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
