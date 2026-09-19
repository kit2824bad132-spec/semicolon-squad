const axios = require('axios');

/**
 * Gemini AI Service for Contextual Cybersecurity Assistant & Incident Forensics.
 * Kept completely separate from MongoDB and database layers.
 */
class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = 'gemini-1.5-flash';
  }

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  }

  async generateResponse(prompt, context = {}) {
    if (!this.isConfigured()) {
      return { success: false, reason: 'GEMINI_API_KEY not configured' };
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;

      const systemPrompt = `You are CyberAI Assistant, a Tier-3 Senior SOC Analyst and Incident Response AI for an enterprise cybersecurity platform.
SYSTEM STATUS: ● SYSTEM ONLINE | SIMULATION MODE.
All autonomous responses and defensive playbooks operate in dry-run simulation mode to ensure system safety.
Base your responses on verified evidence and security context. Be precise, defensive, and provide actionable investigative guidance.`;

      let contextStr = '';
      if (context.referencedIncident) {
        const inc = context.referencedIncident;
        contextStr += `\nReferenced Incident: ${inc.incidentId} | Type: ${inc.threatType} | Severity: ${inc.severity} | Risk Score: ${inc.riskScore}/100 | Source IP: ${inc.sourceIp} | Status: ${inc.status}\nAI Assessment: ${inc.aiExplanation}\n`;
      }
      if (context.activeIncidentsSummary && context.activeIncidentsSummary.length > 0) {
        contextStr += `\nActive Incidents Summary:\n` + context.activeIncidentsSummary.map(i => `- ${i.id}: ${i.threatType} (${i.severity}, Risk ${i.riskScore}) from ${i.sourceIp}`).join('\n');
      }

      const fullPrompt = `${systemPrompt}\n\nSecurity Context:\n${contextStr}\n\nAnalyst Question:\n${prompt}`;

      const payload = {
        contents: [
          {
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000
        }
      };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { success: true, text, source: 'gemini-api', model: this.model };
      }
      return { success: false, reason: 'Empty response from Gemini API' };
    } catch (err) {
      console.warn(`[Gemini Service Warning] Gemini API call failed (${err.message}). Falling back to secondary engine.`);
      return { success: false, reason: err.message };
    }
  }

  async explainIncident(incident) {
    if (!this.isConfigured()) {
      return { success: false, reason: 'GEMINI_API_KEY not configured' };
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;

      const prompt = `Provide an explainable, non-overconfident cybersecurity incident analysis for the following event in 3-4 concise paragraphs:
Incident ID: ${incident.incidentId}
Threat Type: ${incident.threatType}
Severity: ${incident.severity}
Risk Score: ${incident.riskScore}/100
Source IP: ${incident.sourceIp}
Destination: ${incident.destinationIp}
Evidence: ${JSON.stringify(incident.evidence)}

State clearly:
1. Observed Attack Vector & Causal Progression
2. Key Risk Drivers (why the risk score is ${incident.riskScore})
3. Recommended Containment Actions in SIMULATION MODE`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
      };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { success: true, text, source: 'gemini-api' };
      }
      return { success: false, reason: 'Empty response from Gemini API' };
    } catch (err) {
      console.warn(`[Gemini Service Warning] Gemini explainIncident failed (${err.message}).`);
      return { success: false, reason: err.message };
    }
  }
}

module.exports = new GeminiService();
