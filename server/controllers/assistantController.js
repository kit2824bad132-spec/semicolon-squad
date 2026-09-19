const { memoryStore } = require('../utils/seedData');
const Incident = require('../models/Incident');
const { getIsConnected } = require('../config/db');
const geminiService = require('../services/geminiService');
const groqService = require('../services/groqService');

exports.queryAssistant = async (req, res) => {
  try {
    const question = req.body.question || req.body.prompt;
    const { incidentId } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Please provide a question for CyberAI Assistant.'
      });
    }

    const cleanQuestion = question.toLowerCase();
    let referencedIncident = null;

    // Detect incident ID in prompt or parameters
    const incMatch = question.match(/INC-\d{4}/i);
    const targetIncId = incidentId || (incMatch ? incMatch[0].toUpperCase() : null);

    if (targetIncId) {
      if (getIsConnected()) {
        try {
          referencedIncident = await Incident.findOne({ incidentId: targetIncId }).lean();
        } catch (e) {}
      }
      if (!referencedIncident) {
        referencedIncident = memoryStore.incidents.find(i => i.incidentId === targetIncId);
      }
    }

    // Build context object for LLM
    const context = {
      systemMode: '● SYSTEM ONLINE | SIMULATION MODE',
      activeIncidentsSummary: memoryStore.incidents.map(i => ({
        id: i.incidentId,
        threatType: i.threatType,
        severity: i.severity,
        riskScore: i.riskScore,
        sourceIp: i.sourceIp,
        status: i.status
      })),
      referencedIncident: referencedIncident || null
    };

    let answerText = '';
    let responseSource = 'gemini-api';
    let modelName = 'Gemini 1.5 Flash';
    let suggestedActions = [];

    // Priority 1: Gemini API
    let geminiResult = null;
    if (geminiService.isConfigured()) {
      geminiResult = await geminiService.generateResponse(question, context);
    }

    if (geminiResult && geminiResult.success && geminiResult.text) {
      answerText = geminiResult.text;
      responseSource = 'gemini-api';
      modelName = 'Gemini 1.5 Flash (Google AI)';
      suggestedActions = referencedIncident 
        ? [`Why is ${referencedIncident.incidentId} high risk?`, `Show evidence for ${referencedIncident.incidentId}`, 'Summarize today\'s threats']
        : ['What happened in INC-1001?', 'Why is INC-1003 critical risk?', 'Summarize today\'s threats'];
    } else {
      // Priority 2: Secondary LLM (Groq)
      const groqResult = await groqService.generateResponse(question, context);
      if (groqResult && groqResult.success && groqResult.text) {
        answerText = groqResult.text;
        responseSource = 'groq-llm';
        modelName = 'Llama-3.3-70B (Groq)';
        suggestedActions = referencedIncident 
          ? [`Why is ${referencedIncident.incidentId} high risk?`, `Show evidence for ${referencedIncident.incidentId}`, 'Summarize today\'s threats']
          : ['What happened in INC-1001?', 'Why is INC-1003 critical risk?', 'Summarize today\'s threats'];
      } else {
        // Priority 3: Local Rule-Based Heuristics
        const fallbackNotice = '> [!NOTE]\n> *AI service operating in offline mode. Showing rule-based security analysis.*\n\n';
        responseSource = 'local-fallback';
        modelName = 'Rule-Based Heuristics';

        if (cleanQuestion.includes('summarize today') || cleanQuestion.includes('overview') || cleanQuestion.includes('threat summary')) {
          const totalEvents = memoryStore.events.length || 12458;
          const activeThreats = memoryStore.incidents.filter(i => i.status !== 'Resolved' && i.status !== 'False Positive').length;
          const criticalIncidents = memoryStore.incidents.filter(i => i.severity === 'CRITICAL').length;
          
          answerText = `${fallbackNotice}**CyberAI Threat Summary Report**:
• **Total Logs Monitored**: ${totalEvents.toLocaleString()} events across edge firewalls
• **Active Threats**: ${activeThreats} active investigations
• **Critical Severity**: ${criticalIncidents} critical alert (INC-1003 Privilege Escalation)
• **Anomalies Detected**: 67 Isolation Forest outlier flags

**Top Attack Vector**: SSH Brute Force credential attacks originating from 45.33.22.11. All defensive playbooks operating in **SIMULATION MODE**.`;
          suggestedActions = ['Investigate INC-1003', 'Simulate IP Block for 45.33.22.11', 'View INC-1001 Evidence'];
        } else if (referencedIncident) {
          const inc = referencedIncident;
          answerText = `${fallbackNotice}**Incident Analysis for ${inc.incidentId} (${inc.threatType})**:
• **Severity**: ${inc.severity} (Explainable Risk: ${inc.riskScore}/100)
• **Source IP**: ${inc.sourceIp} | **Target**: ${inc.username} on ${inc.destinationIp || '10.0.0.1'}
• **Status**: ${inc.status}

**AI Assessment**: ${inc.aiExplanation}

**Evidence Highlights**:
${inc.evidence ? inc.evidence.map(e => `• ${e.key}: ${e.value}`).join('\n') : 'Baseline outlier detected.'}

**Recommended Action (SIMULATION MODE)**:
${inc.recommendedActions ? inc.recommendedActions.map((a, i) => `${i + 1}. ${a.label}`).join('\n') : 'Simulate IP Block.'}`;
          suggestedActions = [`Why is ${inc.incidentId} high risk?`, `Execute response for ${inc.incidentId}`, 'Summarize today\'s threats'];
        } else {
          answerText = `${fallbackNotice}I am monitoring **${memoryStore.incidents.length} active incidents** in the SOC. You can ask:
• *"What happened in INC-1001?"*
• *"Why is INC-1003 critical risk?"*
• *"What evidence indicates a brute-force attack?"*
• *"Summarize today's threats."*`;
          suggestedActions = ['Summarize today\'s threats', 'What happened in INC-1001?', 'Why is INC-1003 critical risk?'];
        }
      }
    }

    res.json({
      status: 'SUCCESS',
      question,
      answer: answerText,
      response: answerText,
      source: responseSource,
      model: modelName,
      incidentContext: referencedIncident ? {
        incidentId: referencedIncident.incidentId,
        threatType: referencedIncident.threatType,
        severity: referencedIncident.severity,
        riskScore: referencedIncident.riskScore,
        sourceIp: referencedIncident.sourceIp,
        status: referencedIncident.status
      } : null,
      riskLevel: referencedIncident ? referencedIncident.severity : null,
      evidence: referencedIncident ? referencedIncident.evidence : null,
      recommendedDefensiveAction: referencedIncident?.recommendedActions?.[0]?.label || 'Simulate Defensive Monitoring',
      suggestedActions,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[Assistant Controller Error]', err.message);
    res.status(500).json({
      status: 'ERROR',
      message: 'CyberAI Assistant processing failed.',
      fallback: 'AI service unavailable. Showing rule-based security analysis.'
    });
  }
};
