class ThreatClassifier:
    def __init__(self):
        self.threat_categories = [
            "Brute Force",
            "Port Scan",
            "Suspicious Login",
            "Privilege Escalation",
            "Data Exfiltration",
            "Malware-like Behavior",
            "Account Compromise",
            "Unusual Network Activity"
        ]

    def classify_event(self, event, anomaly_score=0.5):
        failed_logins = int(event.get('failed_logins', 0))
        login_success = int(event.get('login_success', 0))
        bytes_sent = int(event.get('bytes_sent', 0))
        dest_port = int(event.get('destination_port', 0))
        privilege_level = str(event.get('privilege_level', 'User'))
        username = str(event.get('username', ''))
        protocol = str(event.get('protocol', 'HTTP'))

        # Expert rule heuristics combined with anomaly scoring
        if failed_logins >= 5:
            return {
                "threat_type": "Brute Force",
                "severity": "HIGH" if failed_logins < 15 else "CRITICAL",
                "confidence": min(0.98, 0.70 + (failed_logins * 0.02)),
                "reason": f"High number of authentication failures detected ({failed_logins} failed attempts)."
            }
        
        if bytes_sent > 100_000_000:  # >100MB
            return {
                "threat_type": "Data Exfiltration",
                "severity": "CRITICAL" if bytes_sent > 500_000_000 else "HIGH",
                "confidence": 0.94,
                "reason": f"Abnormally large outbound data transfer detected ({round(bytes_sent / 1e6, 2)} MB)."
            }
            
        if privilege_level in ['Admin', 'System', 'Root'] and failed_logins > 0:
            return {
                "threat_type": "Privilege Escalation",
                "severity": "HIGH",
                "confidence": 0.88,
                "reason": "Elevated privilege execution attempted following failed login indicators."
            }

        if privilege_level in ['Admin', 'System'] and anomaly_score > 0.70:
            return {
                "threat_type": "Privilege Escalation",
                "severity": "CRITICAL",
                "confidence": 0.91,
                "reason": "High anomaly score detected during elevated administrative session."
            }
            
        if dest_port in [21, 22, 23, 135, 139, 445, 1433, 3306, 3389, 27017] and event.get('request_count', 1) > 10:
            return {
                "threat_type": "Port Scan",
                "severity": "MEDIUM",
                "confidence": 0.85,
                "reason": f"Rapid probe connections across common service port {dest_port}."
            }
            
        if username in ['anonymous', 'guest', 'root', 'admin'] and login_success == 0 and failed_logins > 0:
            return {
                "threat_type": "Suspicious Login",
                "severity": "MEDIUM",
                "confidence": 0.80,
                "reason": f"Repeated login probes against high-risk identifier '{username}'."
            }
            
        if anomaly_score > 0.80:
            return {
                "threat_type": "Malware-like Behavior",
                "severity": "HIGH",
                "confidence": round(anomaly_score, 2),
                "reason": "Unusual protocol payloads and extreme anomaly metrics characteristic of automated malware."
            }

        if anomaly_score > 0.60:
            return {
                "threat_type": "Unusual Network Activity",
                "severity": "MEDIUM",
                "confidence": round(anomaly_score, 2),
                "reason": "Deviations in connection frequency and packet size compared to baseline network behavior."
            }

        return {
            "threat_type": "Unusual Network Activity",
            "severity": "LOW",
            "confidence": 0.50,
            "reason": "Minor variance detected without explicit policy violation."
        }

threat_classifier = ThreatClassifier()
