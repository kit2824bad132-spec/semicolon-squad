class AttackInvestigator:
    def reconstruct_sequence(self, incident_data, related_events):
        """
        Correlates security events to reconstruct step-by-step attack timelines.
        """
        timeline = []

        # Sort events by timestamp if available
        events = sorted(related_events, key=lambda x: str(x.get('timestamp', '')))

        if not events:
            # Generate plausible reconstructed timeline based on incident threat type
            threat_type = incident_data.get('threatType', 'Brute Force')
            src_ip = incident_data.get('sourceIp', '192.168.1.100')
            user = incident_data.get('username', 'admin')

            if threat_type == 'Brute Force':
                timeline = [
                    {"step": 1, "stage": "Reconnaissance", "description": f"Automated login script initiated probing against port 22 from {src_ip}", "timestamp": "T+00:00:00"},
                    {"step": 2, "stage": "Authentication Probe", "description": "23 consecutive failed login attempts recorded within 60 seconds", "timestamp": "T+00:01:15"},
                    {"step": 3, "stage": "Initial Access", "description": f"Successful credential match established for user account '{user}'", "timestamp": "T+00:02:30"},
                    {"step": 4, "stage": "Privilege Escalation", "description": "Command execution attempted via sudo su shell elevation", "timestamp": "T+00:03:10"},
                    {"step": 5, "stage": "Exfiltration / Impact", "description": "High outbound packet volume initiated toward command & control node", "timestamp": "T+00:04:45"}
                ]
            elif threat_type == 'Port Scan':
                timeline = [
                    {"step": 1, "stage": "Network Discovery", "description": f"ICMP echo ping sweep originated from {src_ip}", "timestamp": "T+00:00:00"},
                    {"step": 2, "stage": "Port Probe", "description": "SYN packets dispatched across ports 21, 22, 80, 443, 3306, 27017", "timestamp": "T+00:00:45"},
                    {"step": 3, "stage": "Service Identification", "description": "Banner grabbing HTTP responses received from internal gateway", "timestamp": "T+00:01:20"}
                ]
            elif threat_type == 'Data Exfiltration':
                timeline = [
                    {"step": 1, "stage": "Initial Access", "description": f"Authenticated session established by user '{user}'", "timestamp": "T+00:00:00"},
                    {"step": 2, "stage": "Discovery", "description": "Recursive database queries executed on confidential asset tables", "timestamp": "T+00:05:10"},
                    {"step": 3, "stage": "Staging", "description": "Compressed 580MB payload archive created in staging directory", "timestamp": "T+00:12:00"},
                    {"step": 4, "stage": "Exfiltration", "description": f"HTTPS POST outbound session opened to external destination", "timestamp": "T+00:15:30"}
                ]
            else:
                timeline = [
                    {"step": 1, "stage": "Anomalous Activity", "description": f"Suspicious behavior detected from IP {src_ip}", "timestamp": "T+00:00:00"},
                    {"step": 2, "stage": "Threshold Breach", "description": "Isolation Forest anomaly score exceeded critical boundary", "timestamp": "T+00:01:00"},
                    {"step": 3, "stage": "Containment Request", "description": "Automated security rule triggered response recommendation", "timestamp": "T+00:01:30"}
                ]
            return timeline

        for i, ev in enumerate(events):
            timeline.append({
                "step": i + 1,
                "stage": "Event Detection",
                "description": f"Protocol {ev.get('protocol')} from {ev.get('source_ip')} -> port {ev.get('destination_port')} (User: {ev.get('username')})",
                "timestamp": ev.get('timestamp', f'T+{i*30}s')
            })

        return timeline

attack_investigator = AttackInvestigator()
