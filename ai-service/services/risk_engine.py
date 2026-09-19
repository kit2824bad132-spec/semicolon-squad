class ExplainableRiskEngine:
    def calculate_risk(self, event, anomaly_score=0.5, threat_info=None):
        factors = []
        total_score = 0

        failed_logins = int(event.get('failed_logins', 0))
        login_success = int(event.get('login_success', 0))
        bytes_sent = int(event.get('bytes_sent', 0))
        privilege_level = str(event.get('privilege_level', 'User'))
        username = str(event.get('username', ''))
        source_ip = str(event.get('source_ip', ''))

        # Factor 1: Failed Logins Frequency
        if failed_logins >= 10:
            add = 30
            factors.append({"factor": "Extreme authentication failures (>10 attempts)", "points": add})
            total_score += add
        elif failed_logins >= 3:
            add = 25
            factors.append({"factor": "Multiple failed login attempts", "points": add})
            total_score += add

        # Factor 2: High Anomaly Score
        if anomaly_score >= 0.85:
            add = 25
            factors.append({"factor": "Critical ML anomaly score (Isolation Forest > 0.85)", "points": add})
            total_score += add
        elif anomaly_score >= 0.65:
            add = 15
            factors.append({"factor": "Elevated ML anomaly baseline score", "points": add})
            total_score += add

        # Factor 3: Privilege Escalation
        if privilege_level in ['Admin', 'System', 'Root']:
            add = 20
            factors.append({"factor": "Privileged account involvement (Admin/System)", "points": add})
            total_score += add

        # Factor 4: Large Data Transfer / Exfiltration
        if bytes_sent > 100_000_000:
            add = 20
            factors.append({"factor": "Massive outbound payload transfer (>100MB)", "points": add})
            total_score += add
        elif bytes_sent > 10_000_000:
            add = 12
            factors.append({"factor": "Unusual outbound data size", "points": add})
            total_score += add

        # Factor 5: High Risk IP / Anonymous User
        if source_ip.startswith('185.') or source_ip.startswith('45.') or source_ip.startswith('103.'):
            add = 15
            factors.append({"factor": "External unverified IP block reputation", "points": add})
            total_score += add

        if username in ['anonymous', 'root', 'guest']:
            add = 10
            factors.append({"factor": "High-risk target username", "points": add})
            total_score += add

        # Clamp total score between 5 and 100
        final_risk = min(100, max(5, total_score))

        # Severity categorization
        if final_risk >= 80:
            severity = "CRITICAL"
        elif final_risk >= 60:
            severity = "HIGH"
        elif final_risk >= 35:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        # Generate non-overconfident defensive explanation
        explanation = self.generate_explanation(final_risk, severity, factors, event, threat_info)

        return {
            "risk_score": final_risk,
            "severity": severity,
            "factors": factors,
            "explanation": explanation
        }

    def generate_explanation(self, risk_score, severity, factors, event, threat_info):
        threat_name = threat_info.get("threat_type", "Suspicious Activity") if threat_info else "Security Anomaly"
        
        factor_desc = ", ".join([f["factor"].lower() for f in factors[:3]]) if factors else "unusual baseline parameters"
        
        narrative = (
            f"This incident is classified as {severity} risk ({risk_score}/100) because evidence indicates "
            f"{factor_desc}. "
            f"The observed activity suggests a possible {threat_name.lower()} attempt originating from "
            f"source IP {event.get('source_ip', 'unknown')}. "
            f"The subsequent pattern increases the likelihood of unauthorized compromise, "
            f"warranting swift contained response."
        )
        return narrative

risk_engine = ExplainableRiskEngine()
