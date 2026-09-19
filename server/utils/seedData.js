const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Incident = require('../models/Incident');
const SecurityEvent = require('../models/SecurityEvent');
const Threat = require('../models/Threat');
const ResponseAction = require('../models/ResponseAction');
const Feedback = require('../models/Feedback');
const Report = require('../models/Report');
const { getIsConnected } = require('../config/db');

// In-Memory store for offline / fallback operations
const memoryStore = {
  users: [],
  incidents: [],
  events: [],
  threats: [],
  responses: [],
  feedback: [],
  reports: []
};

const demoEvents = [
  {
    eventId: 'EVT-101',
    timestamp: new Date('2026-09-19T08:02:40Z'),
    sourceIP: '45.33.22.11',
    sourceIp: '45.33.22.11',
    destinationIP: '10.0.0.1',
    destinationIp: '10.0.0.1',
    username: 'root',
    eventType: 'Authentication Failure',
    protocol: 'SSH',
    port: 22,
    sourcePort: 58221,
    destinationPort: 22,
    failedLogins: 24,
    loginSuccess: 0,
    dataTransferred: 160,
    bytesSent: 120,
    bytesReceived: 40,
    duration: 60,
    requestCount: 24,
    privilegeLevel: 'User',
    unusualActivity: true,
    isAnomaly: true,
    severity: 'HIGH',
    anomalyScore: 0.91,
    threatType: 'Brute Force'
  },
  {
    eventId: 'EVT-102',
    timestamp: new Date('2026-09-19T08:05:00Z'),
    sourceIP: '185.220.101.5',
    sourceIp: '185.220.101.5',
    destinationIP: '10.0.0.2',
    destinationIp: '10.0.0.2',
    username: 'anonymous',
    eventType: 'Port Scanning',
    protocol: 'TCP',
    port: 21,
    sourcePort: 33001,
    destinationPort: 21,
    failedLogins: 0,
    loginSuccess: 0,
    dataTransferred: 50,
    bytesSent: 50,
    bytesReceived: 0,
    duration: 20,
    requestCount: 21,
    privilegeLevel: 'User',
    unusualActivity: true,
    isAnomaly: true,
    severity: 'MEDIUM',
    anomalyScore: 0.75,
    threatType: 'Port Scan'
  },
  {
    eventId: 'EVT-103',
    timestamp: new Date('2026-09-19T08:25:40Z'),
    sourceIP: '192.168.1.104',
    sourceIp: '192.168.1.104',
    destinationIP: '10.0.0.4',
    destinationIp: '10.0.0.4',
    username: 'alex_dev',
    eventType: 'Privilege Elevation',
    protocol: 'Internal RPC',
    port: 445,
    sourcePort: 54100,
    destinationPort: 445,
    failedLogins: 0,
    loginSuccess: 1,
    dataTransferred: 45000,
    bytesSent: 35000,
    bytesReceived: 10000,
    duration: 35,
    requestCount: 8,
    privilegeLevel: 'System',
    unusualActivity: true,
    isAnomaly: true,
    severity: 'CRITICAL',
    anomalyScore: 0.97,
    threatType: 'Privilege Escalation'
  },
  {
    eventId: 'EVT-104',
    timestamp: new Date('2026-09-19T08:30:00Z'),
    sourceIP: '192.168.1.104',
    sourceIp: '192.168.1.104',
    destinationIP: '10.0.0.99',
    destinationIp: '10.0.0.99',
    username: 'alex_dev',
    eventType: 'High Volume Outbound Transfer',
    protocol: 'HTTPS',
    port: 443,
    sourcePort: 59110,
    destinationPort: 443,
    failedLogins: 0,
    loginSuccess: 1,
    dataTransferred: 580000000,
    bytesSent: 580000000,
    bytesReceived: 24000,
    duration: 1800,
    requestCount: 45,
    privilegeLevel: 'System',
    unusualActivity: true,
    isAnomaly: true,
    severity: 'HIGH',
    anomalyScore: 0.94,
    threatType: 'Data Exfiltration'
  },
  {
    eventId: 'EVT-105',
    timestamp: new Date('2026-09-19T08:10:00Z'),
    sourceIP: '192.168.1.15',
    sourceIp: '192.168.1.15',
    destinationIP: '10.0.0.8',
    destinationIp: '10.0.0.8',
    username: 'mwilson',
    eventType: 'Login Verification',
    protocol: 'HTTPS',
    port: 443,
    sourcePort: 52120,
    destinationPort: 443,
    failedLogins: 1,
    loginSuccess: 1,
    dataTransferred: 12000,
    bytesSent: 4000,
    bytesReceived: 8000,
    duration: 10,
    requestCount: 2,
    privilegeLevel: 'User',
    unusualActivity: false,
    isAnomaly: false,
    severity: 'LOW',
    anomalyScore: 0.22,
    threatType: 'Suspicious Login'
  }
];

const demoThreats = [
  {
    threatId: 'THR-101',
    threatType: 'Brute Force',
    name: 'Brute Force SSH Credential Stuffing',
    confidence: 0.94,
    severity: 'HIGH',
    sourceIP: '45.33.22.11',
    sourceIp: '45.33.22.11',
    affectedSystem: '10.0.0.1 (SSH Edge Gateway)',
    evidence: ['24 failed login attempts within 60s', 'Targeting root credential', 'External unverified IP block'],
    detectedAt: new Date('2026-09-19T08:02:40Z'),
    status: 'Active',
    description: 'Automated SSH credential stuffing probing internal root account.'
  },
  {
    threatId: 'THR-102',
    threatType: 'Port Scan',
    name: 'Reconnaissance SYN Port Sweep',
    confidence: 0.88,
    severity: 'MEDIUM',
    sourceIP: '185.220.101.5',
    sourceIp: '185.220.101.5',
    affectedSystem: '10.0.0.2 (Public Web Front)',
    evidence: ['Sequential TCP SYN packets across ports 21, 22, 80, 443, 3306', 'Tor exit node signature'],
    detectedAt: new Date('2026-09-19T08:05:00Z'),
    status: 'Active',
    description: 'Broad reconnaissance scanning common service ports.'
  },
  {
    threatId: 'THR-103',
    threatType: 'Privilege Escalation',
    name: 'Unauthorized Shell Elevation',
    confidence: 0.97,
    severity: 'CRITICAL',
    sourceIP: '192.168.1.104',
    sourceIp: '192.168.1.104',
    affectedSystem: '10.0.0.4 (Domain Controller/Auth Node)',
    evidence: ['Privilege changed User -> System without MFA token', 'Exploited background daemon'],
    detectedAt: new Date('2026-09-19T08:25:40Z'),
    status: 'Active',
    description: 'Standard account elevated privileges to System shell execution context.'
  },
  {
    threatId: 'THR-104',
    threatType: 'Data Exfiltration',
    name: 'Massive Outbound Payload Transfer',
    confidence: 0.92,
    severity: 'HIGH',
    sourceIP: '192.168.1.104',
    sourceIp: '192.168.1.104',
    affectedSystem: '10.0.0.99 (External Endpoint)',
    evidence: ['580 MB transferred via HTTPS POST', 'High-entropy compressed staging file'],
    detectedAt: new Date('2026-09-19T08:30:00Z'),
    status: 'Active',
    description: 'Large outbound confidential archive transmission.'
  }
];

const demoIncidents = [
  {
    incidentId: 'INC-1001',
    title: 'SSH Brute Force Credential Attack on Edge Gateway',
    description: 'Automated script attempted multiple rapid SSH logins against root account.',
    threatType: 'Brute Force',
    severity: 'HIGH',
    riskScore: 88,
    sourceIp: '45.33.22.11',
    destinationIp: '10.0.0.1',
    username: 'root',
    status: 'Investigating',
    affectedAssets: ['10.0.0.1', 'root'],
    evidence: [
      { key: 'Failed Logins', value: '24 attempts in 60s' },
      { key: 'Protocol', value: 'SSH (Port 22)' },
      { key: 'Geo Location', value: 'External Unverified ASN' }
    ],
    attackTimeline: [
      { step: 1, stage: 'Authentication Probe', description: '24 failed SSH logins from 45.33.22.11 targeting root account', timestamp: '2026-09-19T08:02:40Z' },
      { step: 2, stage: 'Initial Access', description: '1 successful login recorded after 24 failures', timestamp: '2026-09-19T08:03:25Z' },
      { step: 3, stage: 'Shell Elevation', description: 'Admin privileges granted in interactive terminal', timestamp: '2026-09-19T08:03:30Z' }
    ],
    timeline: [
      { step: 1, stage: 'Authentication Probe', description: '24 failed SSH logins from 45.33.22.11 targeting root account', timestamp: '2026-09-19T08:02:40Z' },
      { step: 2, stage: 'Initial Access', description: '1 successful login recorded after 24 failures', timestamp: '2026-09-19T08:03:25Z' },
      { step: 3, stage: 'Shell Elevation', description: 'Admin privileges granted in interactive terminal', timestamp: '2026-09-19T08:03:30Z' }
    ],
    riskFactors: [
      { factor: 'Extreme failed login frequency', points: 30 },
      { factor: 'Isolation Forest Anomaly Score (0.91)', points: 25 },
      { factor: 'Targeted root administrative account', points: 20 },
      { factor: 'External unverified source IP address', points: 13 }
    ],
    aiExplanation: 'This incident is classified as HIGH risk (88/100) because multiple failed authentication attempts were followed by a successful SSH login and privileged activity from an unusual source. The pattern indicates probable automated SSH credential stuffing.',
    recommendedResponse: [
      { id: 'act-1', type: 'SIMULATE_BLOCK_IP', label: 'Simulate IP Blocking (45.33.22.11)', severity: 'HIGH' },
      { id: 'act-2', type: 'SIMULATE_ACCOUNT_LOCK', label: 'Simulate Account Lock (root)', severity: 'HIGH' },
      { id: 'act-3', type: 'NOTIFY_ADMIN', label: 'Notify SOC Administrator', severity: 'ALL' }
    ],
    recommendedActions: [
      { id: 'act-1', type: 'SIMULATE_BLOCK_IP', label: 'Simulate IP Blocking (45.33.22.11)', severity: 'HIGH' },
      { id: 'act-2', type: 'SIMULATE_ACCOUNT_LOCK', label: 'Simulate Account Lock (root)', severity: 'HIGH' },
      { id: 'act-3', type: 'NOTIFY_ADMIN', label: 'Notify SOC Administrator', severity: 'ALL' }
    ],
    responseHistory: [
      {
        actionId: 'ACT-001',
        incidentId: 'INC-1001',
        action: 'Simulated IP Block',
        actionType: 'SIMULATE_BLOCK_IP',
        severity: 'HIGH',
        status: 'SIMULATED_SUCCESS',
        simulationMode: true,
        executedAt: new Date('2026-09-19T08:04:00Z'),
        description: '[SIMULATION MODE] Simulated block of inbound packets from 45.33.22.11 in virtual firewall rules.'
      }
    ],
    analystNotes: 'Initial triage completed. Automated SSH brute force script identified.',
    createdAt: new Date('2026-09-19T08:03:30Z')
  },
  {
    incidentId: 'INC-1002',
    title: 'TCP SYN Port Scan from Known Reconnaissance Node',
    description: 'Rapid port sweep targeting standard application service ports.',
    threatType: 'Port Scan',
    severity: 'MEDIUM',
    riskScore: 58,
    sourceIp: '185.220.101.5',
    destinationIp: '10.0.0.2',
    username: 'anonymous',
    status: 'New',
    affectedAssets: ['10.0.0.2'],
    evidence: [
      { key: 'Target Ports', value: '21, 22, 23, 25, 80, 443, 3306, 27017' },
      { key: 'Request Rate', value: '21 ports probed in 20 seconds' }
    ],
    attackTimeline: [
      { step: 1, stage: 'SYN Sweep', description: 'Sequential TCP SYN packets to common service ports', timestamp: '2026-09-19T08:05:00Z' },
      { step: 2, stage: 'Service Enumeration', description: 'Banner grabbing HTTP & SMB probes detected', timestamp: '2026-09-19T08:05:10Z' }
    ],
    timeline: [
      { step: 1, stage: 'SYN Sweep', description: 'Sequential TCP SYN packets to common service ports', timestamp: '2026-09-19T08:05:00Z' },
      { step: 2, stage: 'Service Enumeration', description: 'Banner grabbing HTTP & SMB probes detected', timestamp: '2026-09-19T08:05:10Z' }
    ],
    riskFactors: [
      { factor: 'Rapid multi-port probe connections', points: 25 },
      { factor: 'Known Tor exit node IP range', points: 20 },
      { factor: 'Anonymous protocol requests', points: 13 }
    ],
    aiExplanation: 'This incident is classified as MEDIUM risk (58/100) due to sequential port probing across internal application ports originating from a known reconnaissance IP address.',
    recommendedResponse: [
      { id: 'act-4', type: 'INCREASE_MONITORING', label: 'Increase IP Traffic Inspection', severity: 'MEDIUM' },
      { id: 'act-5', type: 'NOTIFY_ADMIN', label: 'Notify Administrator', severity: 'ALL' }
    ],
    recommendedActions: [
      { id: 'act-4', type: 'INCREASE_MONITORING', label: 'Increase IP Traffic Inspection', severity: 'MEDIUM' },
      { id: 'act-5', type: 'NOTIFY_ADMIN', label: 'Notify Administrator', severity: 'ALL' }
    ],
    responseHistory: [],
    analystNotes: 'Monitoring active. No open vulnerable services confirmed.',
    createdAt: new Date('2026-09-19T08:05:20Z')
  },
  {
    incidentId: 'INC-1003',
    title: 'Critical Privilege Escalation to Root/System Execution Context',
    description: 'User alex_dev spawned administrative subshell bypassing standard MFA.',
    threatType: 'Privilege Escalation',
    severity: 'CRITICAL',
    riskScore: 96,
    sourceIp: '192.168.1.104',
    destinationIp: '10.0.0.4',
    username: 'alex_dev',
    status: 'New',
    affectedAssets: ['10.0.0.4', 'alex_dev'],
    evidence: [
      { key: 'User Account', value: 'alex_dev' },
      { key: 'Elevated Privilege', value: 'User -> System' },
      { key: 'Command Execution', value: 'sudo /bin/bash via exploited daemon' }
    ],
    attackTimeline: [
      { step: 1, stage: 'User Session', description: 'Standard developer login established', timestamp: '2026-09-19T08:22:10Z' },
      { step: 2, stage: 'Privilege Modification', description: 'Privilege level elevated from User to System without OAuth MFA token', timestamp: '2026-09-19T08:25:40Z' },
      { step: 3, stage: 'Kernel Memory Read', description: 'Direct memory dump initiated targeting LSASS secrets', timestamp: '2026-09-19T08:25:55Z' }
    ],
    timeline: [
      { step: 1, stage: 'User Session', description: 'Standard developer login established', timestamp: '2026-09-19T08:22:10Z' },
      { step: 2, stage: 'Privilege Modification', description: 'Privilege level elevated from User to System without OAuth MFA token', timestamp: '2026-09-19T08:25:40Z' },
      { step: 3, stage: 'Kernel Memory Read', description: 'Direct memory dump initiated targeting LSASS secrets', timestamp: '2026-09-19T08:25:55Z' }
    ],
    riskFactors: [
      { factor: 'Unauthorized Privilege Escalation (User -> System)', points: 30 },
      { factor: 'Unapproved kernel memory inspection process', points: 25 },
      { factor: 'Isolation Forest Anomaly Score (0.97)', points: 25 },
      { factor: 'Sensitive domain controller access request', points: 16 }
    ],
    aiExplanation: 'This incident is classified as CRITICAL risk (96/100) because standard user credentials "alex_dev" bypassed normal authorization boundaries to gain System-level execution context.',
    recommendedResponse: [
      { id: 'act-6', type: 'SIMULATE_HOST_ISOLATION', label: 'Simulate Host Isolation (10.0.0.4)', severity: 'CRITICAL' },
      { id: 'act-7', type: 'SIMULATE_ACCOUNT_LOCK', label: 'Simulate Account Lock (alex_dev)', severity: 'CRITICAL' },
      { id: 'act-8', type: 'GENERATE_REPORT', label: 'Generate Emergency Incident Report', severity: 'CRITICAL' }
    ],
    recommendedActions: [
      { id: 'act-6', type: 'SIMULATE_HOST_ISOLATION', label: 'Simulate Host Isolation (10.0.0.4)', severity: 'CRITICAL' },
      { id: 'act-7', type: 'SIMULATE_ACCOUNT_LOCK', label: 'Simulate Account Lock (alex_dev)', severity: 'CRITICAL' },
      { id: 'act-8', type: 'GENERATE_REPORT', label: 'Generate Emergency Incident Report', severity: 'CRITICAL' }
    ],
    responseHistory: [],
    analystNotes: 'Critical containment required. Escalated to Tier 3 SOC response team.',
    createdAt: new Date('2026-09-19T08:26:00Z')
  },
  {
    incidentId: 'INC-1004',
    title: 'High Volume Data Exfiltration Stream to External S3 Bucket',
    description: 'Egress payload exceeding 580MB observed targeting third-party endpoint.',
    threatType: 'Data Exfiltration',
    severity: 'HIGH',
    riskScore: 84,
    sourceIp: '192.168.1.104',
    destinationIp: '10.0.0.99',
    username: 'alex_dev',
    status: 'Investigating',
    affectedAssets: ['10.0.0.99', 'alex_dev'],
    evidence: [
      { key: 'Data Volume', value: '580.0 MB Outbound' },
      { key: 'Destination', value: 'External Cloud Storage S3 Bucket' },
      { key: 'Duration', value: '1,800 seconds' }
    ],
    attackTimeline: [
      { step: 1, stage: 'Staging', description: 'Encrypted ZIP archive generated in temp directory', timestamp: '2026-09-19T08:25:00Z' },
      { step: 2, stage: 'Outbound Session', description: 'HTTPS POST connection initiated to external endpoint 10.0.0.99', timestamp: '2026-09-19T08:26:00Z' },
      { step: 3, stage: 'Exfiltration Stream', description: 'Continuous egress transfer at 3.2 MB/s', timestamp: '2026-09-19T08:30:00Z' }
    ],
    timeline: [
      { step: 1, stage: 'Staging', description: 'Encrypted ZIP archive generated in temp directory', timestamp: '2026-09-19T08:25:00Z' },
      { step: 2, stage: 'Outbound Session', description: 'HTTPS POST connection initiated to external endpoint 10.0.0.99', timestamp: '2026-09-19T08:26:00Z' },
      { step: 3, stage: 'Exfiltration Stream', description: 'Continuous egress transfer at 3.2 MB/s', timestamp: '2026-09-19T08:30:00Z' }
    ],
    riskFactors: [
      { factor: 'Massive data volume exfiltration (>500MB)', points: 30 },
      { factor: 'Unusual outbound destination domain', points: 25 },
      { factor: 'Correlated with privilege escalation incident INC-1003', points: 20 },
      { factor: 'Off-hours transfer timing', points: 9 }
    ],
    aiExplanation: 'This incident is classified as HIGH risk (84/100) due to a 580MB outbound data transmission from host 192.168.1.104 targeting an unrated external destination.',
    recommendedResponse: [
      { id: 'act-9', type: 'SIMULATE_BLOCK_IP', label: 'Simulate IP Blocking (10.0.0.99)', severity: 'HIGH' },
      { id: 'act-10', type: 'SIMULATE_HOST_ISOLATION', label: 'Simulate Host Isolation (192.168.1.104)', severity: 'CRITICAL' }
    ],
    recommendedActions: [
      { id: 'act-9', type: 'SIMULATE_BLOCK_IP', label: 'Simulate IP Blocking (10.0.0.99)', severity: 'HIGH' },
      { id: 'act-10', type: 'SIMULATE_HOST_ISOLATION', label: 'Simulate Host Isolation (192.168.1.104)', severity: 'CRITICAL' }
    ],
    responseHistory: [],
    analystNotes: 'Investigating exfiltrated payload contents. Data loss prevention alert triggered.',
    createdAt: new Date('2026-09-19T08:30:00Z')
  },
  {
    incidentId: 'INC-1005',
    title: 'False Positive Single Password Typo Alert',
    description: 'Corporate user had 1 typo before authenticating successfully via 2FA.',
    threatType: 'Suspicious Login',
    severity: 'LOW',
    riskScore: 22,
    sourceIp: '192.168.1.15',
    destinationIp: '10.0.0.8',
    username: 'mwilson',
    status: 'False Positive',
    affectedAssets: ['10.0.0.8', 'mwilson'],
    evidence: [
      { key: 'Failed Logins', value: '1 typo failure before success' },
      { key: 'Device', value: 'Corporate Laptop (Verified Cert)' }
    ],
    attackTimeline: [
      { step: 1, stage: 'Single Typo', description: 'Incorrect password entered once on SSO portal', timestamp: '2026-09-19T08:10:00Z' },
      { step: 2, stage: 'Successful Auth', description: '2FA token verified successfully 10s later', timestamp: '2026-09-19T08:10:10Z' }
    ],
    timeline: [
      { step: 1, stage: 'Single Typo', description: 'Incorrect password entered once on SSO portal', timestamp: '2026-09-19T08:10:00Z' },
      { step: 2, stage: 'Successful Auth', description: '2FA token verified successfully 10s later', timestamp: '2026-09-19T08:10:10Z' }
    ],
    riskFactors: [
      { factor: 'Single login failure followed by valid MFA token', points: 10 },
      { factor: 'Verified corporate hardware certificate', points: 12 }
    ],
    aiExplanation: 'This alert is evaluated as LOW risk (22/100) and verified as a False Positive resulting from a user password typo immediately resolved by valid 2FA authentication.',
    recommendedResponse: [
      { id: 'act-11', type: 'MONITOR_EVENT', label: 'Close & Log Baseline Activity', severity: 'LOW' }
    ],
    recommendedActions: [
      { id: 'act-11', type: 'MONITOR_EVENT', label: 'Close & Log Baseline Activity', severity: 'LOW' }
    ],
    responseHistory: [],
    analystNotes: 'Confirmed routine user password typo. Closed as False Positive.',
    createdAt: new Date('2026-09-19T08:10:15Z')
  }
];

const demoResponses = [
  {
    actionId: 'ACT-001',
    incidentId: 'INC-1001',
    action: 'Simulated IP Block',
    actionType: 'SIMULATE_BLOCK_IP',
    severity: 'HIGH',
    status: 'SIMULATED_SUCCESS',
    simulationMode: true,
    mode: 'SIMULATION MODE',
    executedAt: new Date('2026-09-19T08:04:00Z'),
    description: '[SIMULATION MODE] Simulated block of inbound packets from 45.33.22.11 in virtual firewall rules.',
    details: '[SIMULATION MODE] Simulated block of inbound packets from 45.33.22.11 in virtual firewall rules.',
    target: '45.33.22.11',
    executedBy: 'Autonomous AI Engine'
  },
  {
    actionId: 'ACT-002',
    incidentId: 'INC-1003',
    action: 'Simulated Host Isolation',
    actionType: 'SIMULATE_HOST_ISOLATION',
    severity: 'CRITICAL',
    status: 'SIMULATED_SUCCESS',
    simulationMode: true,
    mode: 'SIMULATION MODE',
    executedAt: new Date('2026-09-19T08:26:30Z'),
    description: '[SIMULATION MODE] Host 10.0.0.4 placed in dry-run quarantine containment VLAN.',
    details: '[SIMULATION MODE] Host 10.0.0.4 placed in dry-run quarantine containment VLAN.',
    target: '10.0.0.4',
    executedBy: 'Autonomous AI Engine'
  }
];

const demoFeedback = [
  {
    incidentId: 'INC-1001',
    analyst: 'admin@cyberai.com',
    submittedBy: 'admin@cyberai.com',
    feedback: 'CONFIRMED_THREAT',
    feedbackType: 'CONFIRMED_THREAT',
    correctClassification: 'Brute Force',
    threatType: 'Brute Force',
    analystNotes: 'Confirmed automated SSH brute force attacking root account.',
    createdAt: new Date('2026-09-19T08:10:00Z')
  },
  {
    incidentId: 'INC-1005',
    analyst: 'admin@cyberai.com',
    submittedBy: 'admin@cyberai.com',
    feedback: 'FALSE_POSITIVE',
    feedbackType: 'FALSE_POSITIVE',
    correctClassification: 'Legitimate User Login',
    threatType: 'Suspicious Login',
    analystNotes: 'User entered typo once, second attempt succeeded with MFA.',
    createdAt: new Date('2026-09-19T08:12:00Z')
  }
];

const demoReports = [
  {
    reportId: 'RPT-1001',
    incidentId: 'INC-1001',
    title: 'Executive Security Audit Report: INC-1001 (Brute Force)',
    summary: 'Investigation into SSH brute force credential attack originating from 45.33.22.11 targeting administrative root account.',
    attackSequence: [
      { step: 1, stage: 'Authentication Probe', description: '24 failed SSH logins from 45.33.22.11 targeting root account' },
      { step: 2, stage: 'Initial Access', description: '1 successful login recorded after 24 failures' },
      { step: 3, stage: 'Shell Elevation', description: 'Admin privileges granted in interactive terminal' }
    ],
    impact: 'Elevated risk of unauthorized root shell access on edge gateway.',
    evidence: [
      { key: 'Failed Logins', value: '24 attempts in 60s' },
      { key: 'Source IP', value: '45.33.22.11' }
    ],
    response: [
      { action: 'Simulated IP Block', target: '45.33.22.11', status: 'SIMULATED_SUCCESS', mode: 'SIMULATION MODE' }
    ],
    generatedAt: new Date('2026-09-19T08:15:00Z'),
    threatType: 'Brute Force',
    severity: 'HIGH',
    riskScore: 88,
    affectedAssets: ['10.0.0.1', 'root'],
    sourceIp: '45.33.22.11',
    aiAnalysis: 'High likelihood of automated credential stuffing.',
    resolution: 'Contained in virtual sandbox simulation.',
    analystFeedback: 'CONFIRMED_THREAT'
  }
];

const seedDemoData = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const defaultAdmin = {
    name: 'SOC Chief Analyst',
    email: 'admin@cyberai.com',
    password: hashedPassword,
    role: 'Administrator / SOC Director',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    authProvider: 'local'
  };

  // Populate In-Memory Store
  memoryStore.users = [defaultAdmin];
  memoryStore.events = [...demoEvents];
  memoryStore.threats = [...demoThreats];
  memoryStore.incidents = [...demoIncidents];
  memoryStore.responses = [...demoResponses];
  memoryStore.feedback = [...demoFeedback];
  memoryStore.reports = [...demoReports];

  // Populate MongoDB if connected
  if (getIsConnected()) {
    try {
      // 1. Users
      const existingUser = await User.findOne({ email: 'admin@cyberai.com' });
      if (!existingUser) {
        await User.create(defaultAdmin);
        console.log('[Seed] Admin user created in MongoDB: admin@cyberai.com / admin123');
      }

      // 2. SecurityEvents
      const eventCount = await SecurityEvent.countDocuments();
      if (eventCount === 0) {
        await SecurityEvent.insertMany(demoEvents);
        console.log(`[Seed] ${demoEvents.length} SecurityEvents seeded into MongoDB.`);
      }

      // 3. Threats
      const threatCount = await Threat.countDocuments();
      if (threatCount === 0) {
        await Threat.insertMany(demoThreats);
        console.log(`[Seed] ${demoThreats.length} Threats seeded into MongoDB.`);
      }

      // 4. Incidents
      for (const inc of demoIncidents) {
        await Incident.findOneAndUpdate(
          { incidentId: inc.incidentId },
          inc,
          { upsert: true, new: true }
        );
      }
      console.log(`[Seed] ${demoIncidents.length} Incidents seeded/synced in MongoDB.`);

      // 5. ResponseActions
      const respCount = await ResponseAction.countDocuments();
      if (respCount === 0) {
        await ResponseAction.insertMany(demoResponses);
        console.log(`[Seed] ${demoResponses.length} ResponseActions seeded into MongoDB.`);
      }

      // 6. Feedback
      const fbCount = await Feedback.countDocuments();
      if (fbCount === 0) {
        await Feedback.insertMany(demoFeedback);
        console.log(`[Seed] ${demoFeedback.length} Feedback entries seeded into MongoDB.`);
      }

      // 7. Reports
      const rptCount = await Report.countDocuments();
      if (rptCount === 0) {
        await Report.insertMany(demoReports);
        console.log(`[Seed] ${demoReports.length} Reports seeded into MongoDB.`);
      }
    } catch (err) {
      console.warn('[Seed Warning] MongoDB seeding error:', err.message);
    }
  } else {
    console.log('[Seed] Complete demo cybersecurity dataset loaded into memory store fallback.');
  }
};

module.exports = { seedDemoData, memoryStore };
