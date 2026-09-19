import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self, contamination=0.15):
        self.contamination = contamination
        self.model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=42
        )
        self.is_fitted = False

    def _extract_features(self, events):
        df = pd.DataFrame(events)
        feature_cols = [
            'failed_logins', 'login_success', 'bytes_sent', 
            'bytes_received', 'duration', 'request_count', 'source_port'
        ]
        
        # Ensure all columns exist with defaults
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
        # Add engineered features
        df['total_bytes'] = df['bytes_sent'] + df['bytes_received']
        df['bytes_per_sec'] = df['total_bytes'] / (df['duration'] + 1)
        
        cols_to_use = feature_cols + ['total_bytes', 'bytes_per_sec']
        return df[cols_to_use]

    def fit_predict(self, events):
        if not events:
            return []
            
        features = self._extract_features(events)
        self.model.fit(features)
        self.is_fitted = True
        
        # Decision function: lower score = more anomalous
        raw_scores = self.model.decision_function(features)
        predictions = self.model.predict(features) # -1 for anomaly, 1 for normal
        
        # Normalize score between 0 and 1 (1 = highest anomaly probability)
        # Decision function ranges roughly from -0.5 to +0.5
        min_score = np.min(raw_scores) if len(raw_scores) > 0 else -0.5
        max_score = np.max(raw_scores) if len(raw_scores) > 0 else 0.5
        
        results = []
        for i, (score, pred) in enumerate(zip(raw_scores, predictions)):
            # Invert and normalize score so 1.0 is extreme anomaly
            normalized_score = 1.0 - ((score - min_score) / (max_score - min_score + 1e-6))
            normalized_score = float(np.clip(normalized_score, 0.0, 0.99))
            
            is_anomaly = bool(pred == -1 or normalized_score > 0.65)
            
            results.append({
                "index": i,
                "is_anomaly": is_anomaly,
                "anomaly_score": round(normalized_score, 4)
            })
            
        return results

    def predict_single(self, event):
        results = self.fit_predict([event])
        return results[0] if results else {"is_anomaly": False, "anomaly_score": 0.05}

anomaly_detector = AnomalyDetector()
