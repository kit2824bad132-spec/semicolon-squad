const fs = require('fs');
const csv = require('csv-parser');
const SecurityEvent = require('../models/SecurityEvent');
const Incident = require('../models/Incident');
const Threat = require('../models/Threat');
const aiService = require('../services/aiService');
const { memoryStore } = require('../utils/seedData');
const { getIsConnected } = require('../config/db');

exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'ERROR', message: 'No CSV file uploaded' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Clean up uploaded file
        try { fs.unlinkSync(req.file.path); } catch (e) {}

        const eventsToSave = results.map((row, idx) => ({
          eventId: `EVT-${Date.now()}-${idx + 1}`,
          timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
          sourceIP: row.source_ip || row.sourceIP || row.sourceIp || '192.168.1.100',
          sourceIp: row.source_ip || row.sourceIP || row.sourceIp || '192.168.1.100',
          destinationIP: row.destination_ip || row.destinationIP || row.destinationIp || '10.0.0.1',
          destinationIp: row.destination_ip || row.destinationIP || row.destinationIp || '10.0.0.1',
          sourcePort: parseInt(row.source_port || row.sourcePort || 50000, 10),
          destinationPort: parseInt(row.destination_port || row.destinationPort || 80, 10),
          port: parseInt(row.port || row.destination_port || row.destinationPort || 80, 10),
          protocol: row.protocol || 'HTTP',
          username: row.username || 'anonymous',
          eventType: row.event_type || row.eventType || 'Network Traffic',
          failedLogins: parseInt(row.failed_logins || row.failedLogins || 0, 10),
          loginSuccess: parseInt(row.login_success || row.loginSuccess || 1, 10),
          dataTransferred: parseInt(row.data_transferred || row.dataTransferred || (row.bytes_sent || 0) + (row.bytes_received || 0), 10),
          bytesSent: parseInt(row.bytes_sent || row.bytesSent || 0, 10),
          bytesReceived: parseInt(row.bytes_received || row.bytesReceived || 0, 10),
          duration: parseInt(row.duration || 0, 10),
          requestCount: parseInt(row.request_count || row.requestCount || 1, 10),
          privilegeLevel: row.privilege_level || row.privilegeLevel || 'User',
          unusualActivity: false,
          isAnomaly: false,
          severity: 'LOW',
          anomalyScore: 0.0
        }));

        if (getIsConnected()) {
          await SecurityEvent.insertMany(eventsToSave);
        } else {
          memoryStore.events.push(...eventsToSave);
        }

        res.json({
          status: 'SUCCESS',
          message: `Successfully uploaded and parsed ${eventsToSave.length} security events.`,
          count: eventsToSave.length,
          sample: eventsToSave.slice(0, 5)
        });
      });
  } catch (err) {
    console.error('CSV Upload Error:', err);
    res.status(500).json({ status: 'ERROR', message: 'Failed to process CSV file.' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const data = req.body;
    const newEvent = {
      eventId: data.eventId || `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      sourceIP: data.sourceIP || data.sourceIp || '192.168.1.100',
      sourceIp: data.sourceIP || data.sourceIp || '192.168.1.100',
      destinationIP: data.destinationIP || data.destinationIp || '10.0.0.1',
      destinationIp: data.destinationIP || data.destinationIp || '10.0.0.1',
      username: data.username || 'anonymous',
      eventType: data.eventType || 'Network Traffic',
      protocol: data.protocol || 'HTTP',
      port: parseInt(data.port || data.destinationPort || 80, 10),
      failedLogins: parseInt(data.failedLogins || data.failed_logins || 0, 10),
      dataTransferred: parseInt(data.dataTransferred || data.bytesSent || 0, 10),
      unusualActivity: Boolean(data.unusualActivity || data.isAnomaly),
      severity: data.severity || 'LOW',
      anomalyScore: parseFloat(data.anomalyScore || 0.0),
      createdAt: new Date()
    };

    let savedEvent = newEvent;
    if (getIsConnected()) {
      savedEvent = await SecurityEvent.create(newEvent);
    } else {
      memoryStore.events.unshift(newEvent);
    }

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Security event recorded successfully into MongoDB.',
      event: savedEvent
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: `Failed to create event: ${err.message}` });
  }
};

exports.getEvents = async (req, res) => {
  try {
    let events = [];
    if (getIsConnected()) {
      events = await SecurityEvent.find().sort({ createdAt: -1 }).limit(1000);
    } else {
      events = memoryStore.events;
    }

    res.json({
      status: 'SUCCESS',
      count: events.length,
      events
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: 'Failed to retrieve security events.' });
  }
};

exports.analyzeEvents = async (req, res) => {
  try {
    let events = [];
    if (getIsConnected()) {
      events = await SecurityEvent.find().lean();
    } else {
      events = memoryStore.events;
    }

    if (events.length === 0) {
      return res.status(400).json({ status: 'ERROR', message: 'No security events found to analyze. Please upload a CSV or load demo data first.' });
    }

    // Step 1: Python AI Anomaly Detection (Isolation Forest)
    const anomalyResult = await aiService.detectAnomalies(events);
    const scoreMap = new Map();
    if (anomalyResult.results) {
      anomalyResult.results.forEach(r => {
        scoreMap.set(r.index, r);
      });
    }

    const analyzedEvents = [];
    const newIncidentsCreated = [];

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      const anomalyInfo = scoreMap.get(i) || { is_anomaly: false, anomaly_score: 0.15 };
      const anomalyScore = anomalyInfo.anomaly_score;
      const isAnomaly = anomalyInfo.is_anomaly;

      // Step 2: Threat Classification
      const classification = await aiService.classifyThreat(ev, anomalyScore);

      // Step 3: Explainable Risk Score Calculation
      const riskObj = await aiService.calculateRisk(ev, anomalyScore, classification);

      ev.isAnomaly = isAnomaly;
      ev.unusualActivity = isAnomaly;
      ev.anomalyScore = anomalyScore;
      ev.threatType = classification.threat_type;
      ev.severity = riskObj.severity;

      analyzedEvents.push(ev);

      // Update in MongoDB
      if (getIsConnected() && ev._id) {
        await SecurityEvent.findByIdAndUpdate(ev._id, {
          isAnomaly,
          unusualActivity: isAnomaly,
          anomalyScore,
          threatType: classification.threat_type,
          severity: riskObj.severity
        });
      }

      // Step 4: Auto Incident Creation for High / Critical Anomalies
      if (isAnomaly && (riskObj.severity === 'HIGH' || riskObj.severity === 'CRITICAL')) {
        const incidentId = `INC-${1000 + (memoryStore.incidents.length || 0) + newIncidentsCreated.length + 1}`;
        const sourceIp = ev.sourceIP || ev.sourceIp || '192.168.1.100';
        const destIp = ev.destinationIP || ev.destinationIp || '10.0.0.1';

        const newIncident = {
          incidentId,
          title: `${classification.threat_type} Incident on ${destIp}`,
          description: riskObj.explanation || `Automated alert detected for ${classification.threat_type}.`,
          threatType: classification.threat_type,
          severity: riskObj.severity,
          riskScore: riskObj.risk_score,
          sourceIp,
          destinationIp: destIp,
          username: ev.username || 'unknown',
          status: 'New',
          affectedAssets: [destIp, ev.username].filter(Boolean),
          evidence: [
            { key: 'Source IP', value: sourceIp },
            { key: 'Failed Logins', value: `${ev.failedLogins || 0}` },
            { key: 'Bytes Sent', value: `${ev.bytesSent || ev.dataTransferred || 0} bytes` },
            { key: 'Protocol', value: ev.protocol || 'HTTP' }
          ],
          attackTimeline: [
            { step: 1, stage: 'Detection Trigger', description: `Isolation Forest flagged event with anomaly score ${anomalyScore}`, timestamp: new Date().toISOString() },
            { step: 2, stage: 'Classification', description: `Threat classified as ${classification.threat_type} (${classification.reason || 'Pattern matched'})`, timestamp: new Date().toISOString() }
          ],
          timeline: [
            { step: 1, stage: 'Detection Trigger', description: `Isolation Forest flagged event with anomaly score ${anomalyScore}`, timestamp: new Date().toISOString() },
            { step: 2, stage: 'Classification', description: `Threat classified as ${classification.threat_type} (${classification.reason || 'Pattern matched'})`, timestamp: new Date().toISOString() }
          ],
          riskFactors: riskObj.factors,
          aiExplanation: riskObj.explanation,
          recommendedResponse: [
            { id: `act-${Date.now()}-1`, type: 'SIMULATE_BLOCK_IP', label: `Simulate IP Blocking (${sourceIp})`, severity: riskObj.severity },
            { id: `act-${Date.now()}-2`, type: 'NOTIFY_ADMIN', label: 'Notify SOC Administrator', severity: 'ALL' }
          ],
          recommendedActions: [
            { id: `act-${Date.now()}-1`, type: 'SIMULATE_BLOCK_IP', label: `Simulate IP Blocking (${sourceIp})`, severity: riskObj.severity },
            { id: `act-${Date.now()}-2`, type: 'NOTIFY_ADMIN', label: 'Notify SOC Administrator', severity: 'ALL' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (getIsConnected()) {
          await Incident.findOneAndUpdate({ incidentId }, newIncident, { upsert: true });

          // Also record Threat in MongoDB
          await Threat.findOneAndUpdate(
            { sourceIP: sourceIp, threatType: classification.threat_type },
            {
              threatId: `THR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              threatType: classification.threat_type,
              name: `${classification.threat_type} Attack`,
              confidence: classification.confidence || 0.90,
              severity: riskObj.severity,
              sourceIP: sourceIp,
              sourceIp,
              affectedSystem: destIp,
              evidence: newIncident.evidence,
              detectedAt: new Date(),
              status: 'Active'
            },
            { upsert: true }
          );
        } else {
          memoryStore.incidents.push(newIncident);
        }
        newIncidentsCreated.push(newIncident);
      }
    }

    res.json({
      status: 'SUCCESS',
      message: 'AI Analysis complete. Isolation Forest anomaly scores and risk metrics calculated and saved to MongoDB.',
      totalEventsAnalyzed: events.length,
      anomaliesDetected: analyzedEvents.filter(e => e.isAnomaly).length,
      incidentsCreatedCount: newIncidentsCreated.length,
      sampleAnalyzed: analyzedEvents.slice(0, 10)
    });
  } catch (err) {
    console.error('AI Analysis Error:', err);
    res.status(500).json({ status: 'ERROR', message: `AI Analysis failed: ${err.message}` });
  }
};
