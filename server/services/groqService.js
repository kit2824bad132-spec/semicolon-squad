const Groq = require('groq-sdk');

class GroqService {
  constructor() {
    this.client = null;
    this.model = 'openai/gpt-oss-120b';
    this.initClient();
  }

  initClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      try {
        this.client = new Groq({ apiKey: apiKey.trim() });
        console.log('[Groq Service] Initialized successfully with defensive cybersecurity prompt profile.');
      } catch (err) {
        console.warn(`[Groq Service Warning] Initialization failed: ${err.message}`);
        this.client = null;
      }
    } else {
      console.warn('[Groq Service] GROQ_API_KEY is not set. Operating in local heuristic fallback mode.');
      this.client = null;
    }
  }

  isAvailable() {
    return !!this.client;
  }

  /**
   * Generates a security response for analyst chat or investigation queries
   * @param {string} userQuestion - The analyst's question
   * @param {object} contextData - Associated incident / events / threats context
   */
  async generateResponse(userQuestion, contextData = {}) {
    if (!this.client) {
      // Re-check in case env was loaded late
      this.initClient();
    }

    if (!this.client) {
      return {
        success: false,
        source: 'local-fallback',
        message: 'AI service unavailable. Showing rule-based security analysis.',
        text: null
      };
    }

    try {
      const systemPrompt = `You are CyberAI Assistant, a world-class defensive cybersecurity expert operating in an enterprise Security Operations Center (SOC) platform for BUILDATHON 2026.
Your primary role is:
1. Threat analysis & triage
2. Incident investigation & attack sequence reconstruction
3. Explainable risk evaluation
4. Defensive containment recommendations (STRICTLY IN SIMULATION MODE)
5. Executive audit reporting

Safety Directives:
- You operate strictly defensively. NEVER provide offensive attack payloads, exploit scripts, or instructions for unauthorized intrusion.
- Explicitly emphasize that all containment actions (IP blocking, host isolation, account lockout) run in "SIMULATION MODE".
- Use precise, analytical security terminology (MITRE ATT&CK concepts, IoCs, dwell time, lateral movement, brute force).
- Ground answers in the provided SOC context and telemetry without fabricating evidence.`;

      let contextStr = '';
      if (contextData && Object.keys(contextData).length > 0) {
        contextStr = `\n\n--- SOC TELEMETRY & INCIDENT CONTEXT ---\n${JSON.stringify(contextData, null, 2)}\n----------------------------------------\n`;
      }

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${contextStr}Analyst Question: ${userQuestion}\n\nProvide an insightful, structured defensive response.` }
        ],
        temperature: 0.2,
        max_tokens: 1024,
      });

      const responseText = completion.choices[0]?.message?.content || 'No response generated.';

      return {
        success: true,
        source: 'groq-llm',
        model: this.model,
        text: responseText
      };
    } catch (error) {
      console.warn(`[Groq Service Error] API request failed: ${error.message}`);
      return {
        success: false,
        source: 'local-fallback',
        message: `AI service unavailable (${error.message}). Showing rule-based security analysis.`,
        text: null
      };
    }
  }

  /**
   * Generates a detailed explainable security narrative for a specific incident
   * @param {object} incident - The incident document
   */
  async explainIncident(incident) {
    const question = `Explain incident ${incident.incidentId} (${incident.threatType}, ${incident.severity} severity, Risk Score: ${incident.riskScore}/100). Detail why it is classified as this risk level, examine the evidence, explain the probable attack sequence, and recommend defensive actions in SIMULATION MODE.`;
    return this.generateResponse(question, { incident });
  }
}

module.exports = new GroqService();
