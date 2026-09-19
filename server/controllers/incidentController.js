const Incident = require('../models/Incident');
const ResponseAction = require('../models/ResponseAction');
const Feedback = require('../models/Feedback');
const aiService = require('../services/aiService');
const geminiService = require('../services/geminiService');
const groqService = require('../services/groqService');
const { memoryStore, seedDemoData } = require('../utils/seedData');
const { getIsConnected } = require('../config/db');

exports.getIncidents = async (req, res) => {
  try {
    let incidents = [];
    if (getIsConnected()) {
      incidents = await Incident.find().sort({ createdAt: -1 });
    } else {
      incidents = memoryStore.incidents;
    }

    if (!incidents || incidents.length === 0) {
      await seedDemoData();
      incidents = getIsConnected() ? await Incident.find().sort({ createdAt: -1 }) : memoryStore.incidents;
    }

    res.json({
      status: 'SUCCESS',
      count: incidents.length,
      incidents
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: 'Failed to retrieve incidents.' });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    let incident = null;

    if (getIsConnected()) {
      incident = await Incident.findOne({ incidentId: id });
    } else {
      incident = memoryStore.incidents.find(i => i.incidentId === id);
    }

    if (!incident) {
      return res.status(404).json({ status: 'ERROR', message: `Incident ${id} not found.` });
    }

    res.json({
      status: 'SUCCESS',
      incident
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: `Failed to fetch incident ${req.params.id}.` });
  }
};

exports.createIncident = async (req, res) => {
  try {
    const data = req.body;
    const incidentId = data.incidentId || `INC-${1000 + (memoryStore.incidents.length || 0) + 1}`;
    
    const newInc = {
      incidentId,
      title: data.title || `${data.threatType || 'Suspicious Activity'} Incident on ${data.destinationIp || '10.0.0.1'}`,
      description: data.description || data.aiExplanation || 'Incident manually created by security analyst.',
      threatType: data.threatType || 'Unusual Network Activity',
      severity: data.severity || 'MEDIUM',
      riskScore: data.riskScore || 65,
      sourceIp: data.sourceIp || '192.168.1.100',
      destinationIp: data.destinationIp || '10.0.0.1',
      username: data.username || 'admin',
      status: data.status || 'New',
      affectedAssets: data.affectedAssets || [data.destinationIp || '10.0.0.1', data.username || 'admin'],
      evidence: data.evidence || [],
      attackTimeline: data.attackTimeline || data.timeline || [],
      timeline: data.timeline || data.attackTimeline || [],
      riskFactors: data.riskFactors || [],
      aiExplanation: data.aiExplanation || 'Incident manually created by security analyst.',
      recommendedResponse: data.recommendedResponse || data.recommendedActions || [
        { id: `act-${Date.now()}`, type: 'SIMULATE_BLOCK_IP', label: `Simulate IP Blocking (${data.sourceIp || '192.168.1.100'})`, severity: data.severity || 'MEDIUM' }
      ],
      recommendedActions: data.recommendedActions || data.recommendedResponse || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedInc = newInc;
    if (getIsConnected()) {
      savedInc = await Incident.create(newInc);
    } else {
      memoryStore.incidents.unshift(newInc);
    }

    res.status(201).json({
      status: 'SUCCESS',
      message: `Incident ${incidentId} created successfully in MongoDB.`,
      incident: savedInc
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: `Failed to create incident: ${err.message}` });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date();

    let updatedInc = null;
    if (getIsConnected()) {
      updatedInc = await Incident.findOneAndUpdate({ incidentId: id }, updates, { new: true });
    } else {
      const idx = memoryStore.incidents.findIndex(i => i.incidentId === id);
      if (idx !== -1) {
        memoryStore.incidents[idx] = { ...memoryStore.incidents[idx], ...updates };
        updatedInc = memoryStore.incidents[idx];
      }
    }

    if (!updatedInc) {
      return res.status(404).json({ status: 'ERROR', message: `Incident ${id} not found.` });
    }

    res.json({
      status: 'SUCCESS',
      message: `Incident ${id} updated successfully in MongoDB.`,
      incident: updatedInc
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: `Failed to update incident ${req.params.id}.` });
  }
};

exports.investigateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    let incident = null;

    if (getIsConnected()) {
      incident = await Incident.findOne({ incidentId: id });
    } else {
      incident = memoryStore.incidents.find(i => i.incidentId === id);
    }

    if (!incident) {
      return res.status(404).json({ status: 'ERROR', message: `Incident ${id} not found.` });
    }

    // Call Python AI Service for attack reconstruction
    const events = memoryStore.events;
    const investigationResult = await aiService.investigate(incident, events);
    const attackSequence = investigationResult.attack_sequence || [];

    // Save attack sequence back to incident
    if (getIsConnected()) {
      await Incident.findOneAndUpdate({ incidentId: id }, {
        attackTimeline: attackSequence,
        timeline: attackSequence,
        status: incident.status === 'New' ? 'Investigating' : incident.status
      });
    } else {
      incident.attackTimeline = attackSequence;
      incident.timeline = attackSequence;
      if (incident.status === 'New') incident.status = 'Investigating';
    }

    res.json({
      status: 'SUCCESS',
      incidentId: id,
      attackSequence,
      attackTimeline: attackSequence,
      correlatedEventsCount: events.length,
      aiAnalysisSummary: investigationResult.ai_summary || incident.aiExplanation
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: 'AI Investigation failed.' });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, feedbackType, analystNotes, correctClassification } = req.body;
    const finalFeedback = feedback || feedbackType;

    if (!['CONFIRMED_THREAT', 'FALSE_POSITIVE'].includes(finalFeedback)) {
      return res.status(400).json({ status: 'ERROR', message: 'Feedback type must be CONFIRMED_THREAT or FALSE_POSITIVE' });
    }

    const feedbackEntry = {
      incidentId: id,
      analyst: req.user ? req.user.email : 'admin@cyberai.com',
      submittedBy: req.user ? req.user.email : 'admin@cyberai.com',
      feedback: finalFeedback,
      feedbackType: finalFeedback,
      correctClassification: correctClassification || (finalFeedback === 'FALSE_POSITIVE' ? 'Normal Activity / False Alarm' : 'Confirmed Malicious Activity'),
      analystNotes: analystNotes || '',
      createdAt: new Date()
    };

    if (getIsConnected()) {
      await Feedback.create(feedbackEntry);
      await Incident.findOneAndUpdate({ incidentId: id }, {
        feedbackType: finalFeedback,
        status: finalFeedback === 'FALSE_POSITIVE' ? 'False Positive' : 'Investigating',
        analystNotes
      });
    } else {
      memoryStore.feedback.push(feedbackEntry);
      const inc = memoryStore.incidents.find(i => i.incidentId === id);
      if (inc) {
        inc.feedbackType = finalFeedback;
        inc.status = finalFeedback === 'FALSE_POSITIVE' ? 'False Positive' : 'Investigating';
        if (analystNotes) inc.analystNotes = analystNotes;
      }
    }

    res.json({
      status: 'SUCCESS',
      message: `Analyst feedback stored in MongoDB for ${id}: ${finalFeedback}`,
      feedback: feedbackEntry
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: 'Failed to record feedback.' });
  }
};

exports.executeResponseAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, actionType, target } = req.body;

    const rawAction = action || actionType || 'SIMULATE_BLOCK_IP';
    
    // Map to human-readable simulation action labels
    let friendlyAction = 'Simulated IP Block';
    if (rawAction.includes('LOCK') || rawAction.includes('ACCOUNT')) {
      friendlyAction = 'Simulated Account Lock';
    } else if (rawAction.includes('HOST') || rawAction.includes('ISOLATION')) {
      friendlyAction = 'Simulated Host Isolation';
    } else if (rawAction.includes('ESCALAT') || rawAction.includes('REPORT')) {
      friendlyAction = 'Simulated Incident Escalation';
    }

    const actionRecord = {
      actionId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      incidentId: id,
      action: friendlyAction,
      actionType: rawAction,
      target: target || '45.33.22.11',
      severity: 'HIGH',
      status: 'SIMULATED_SUCCESS',
      simulationMode: true,
      mode: 'SIMULATION MODE',
      executedBy: req.user ? req.user.name : 'Autonomous Response Engine',
      executedAt: new Date(),
      description: `[SIMULATION MODE] Defensive action '${friendlyAction}' for target '${target || '45.33.22.11'}' was executed in sandbox environment. No actual network interfaces were modified.`
    };

    if (getIsConnected()) {
      await ResponseAction.create(actionRecord);
      await Incident.findOneAndUpdate({ incidentId: id }, {
        $push: { responseHistory: actionRecord },
        status: 'Contained'
      });
    } else {
      memoryStore.responses.push(actionRecord);
      const inc = memoryStore.incidents.find(i => i.incidentId === id);
      if (inc) {
        if (!inc.responseHistory) inc.responseHistory = [];
        inc.responseHistory.push(actionRecord);
        inc.status = 'Contained';
      }
    }

    res.json({
      status: 'SUCCESS',
      simulationNotice: '● SYSTEM ONLINE | SIMULATION MODE',
      message: `SIMULATION MODE: Action '${friendlyAction}' Simulated Successfully for target ${target || '45.33.22.11'}`,
      actionRecord
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: 'Failed to execute response action.' });
  }
};

exports.explainWithAI = async (req, res) => {
  try {
    const { id } = req.params;
    let incident = null;

    if (getIsConnected()) {
      incident = await Incident.findOne({ incidentId: id });
    } else {
      incident = memoryStore.incidents.find(i => i.incidentId === id);
    }

    if (!incident) {
      return res.status(404).json({ status: 'ERROR', message: `Incident ${id} not found.` });
    }

    let explanation = '';
    let source = 'gemini-api';
    let model = 'Gemini 1.5 Flash';

    if (geminiService.isConfigured()) {
      const geminiResult = await geminiService.explainIncident(incident);
      if (geminiResult && geminiResult.success && geminiResult.text) {
        explanation = geminiResult.text;
        source = 'gemini-api';
        model = 'Gemini 1.5 Flash';
      }
    }

    if (!explanation) {
      const groqResult = await groqService.explainIncident(incident);
      if (groqResult && groqResult.success && groqResult.text) {
        explanation = groqResult.text;
        source = 'groq-llm';
        model = 'Llama-3.3-70B (Groq)';
      } else {
        explanation = `> [!NOTE]\n> *AI explanation generated using expert rule-based cybersecurity heuristics.*\n\n${incident.aiExplanation || 'Incident indicates elevated risk based on baseline security telemetry.'}`;
        source = 'local-fallback';
        model = 'Rule-Based Heuristics';
      }
    }

    if (getIsConnected()) {
      await Incident.findOneAndUpdate({ incidentId: id }, { aiExplanation: explanation });
    } else {
      incident.aiExplanation = explanation;
    }

    res.json({
      status: 'SUCCESS',
      incidentId: id,
      explanation,
      source,
      model
    });
  } catch (err) {
    console.error('[Explain with AI Error]', err.message);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to generate AI explanation.',
      fallback: 'AI service unavailable. Showing rule-based security analysis.'
    });
  }
};

