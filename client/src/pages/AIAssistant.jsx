import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, User, Shield, AlertTriangle, ShieldAlert, CheckCircle2, Cpu, FileText, Terminal, RefreshCw } from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello Analyst! I am **CyberAI Security Assistant**, powered by **Gemini API** and defensive security intelligence.\n\nI can analyze live event telemetry stored in MongoDB, explain incident risk scores (+30 failed logins, +25 ML anomaly), reconstruct causal attack sequences, and guide simulated containment playbooks.\n\nHow can I assist your investigation today?`,
      source: 'gemini-api',
      model: 'Gemini 1.5 Flash',
      suggestedActions: [
        "Why is INC-1001 considered a high risk incident?",
        "What evidence indicates a brute-force attack?",
        "What happened in INC-1003?",
        "Summarize today's threats."
      ],
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { showToast } = useAuth();

  const handleSend = async (questionText = input) => {
    if (!questionText.trim()) return;

    setErrorMessage(null);
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant', {
        question: questionText,
        prompt: questionText
      });

      const data = res.data;
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: data.answer || data.response || 'Investigation complete.',
        source: data.source || 'gemini-api',
        model: data.model || 'Gemini 1.5 Flash',
        incidentContext: data.incidentContext || null,
        riskLevel: data.riskLevel || null,
        evidence: data.evidence || null,
        recommendedDefensiveAction: data.recommendedDefensiveAction || null,
        suggestedActions: data.suggestedActions || [],
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Assistant error:', err);
      const errMsg = err.response?.data?.message || 'Error communicating with assistant API.';
      setErrorMessage(errMsg);

      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: `> [!NOTE]\n> *AI service operating in offline fallback mode. Showing rule-based security telemetry.*\n\n**CyberAI Telemetry Summary**:\n• Monitoring active incidents INC-1001 (SSH Brute Force) and INC-1003 (Privilege Escalation).\n• All automated response playbooks operate strictly in **SIMULATION MODE**.`,
        source: 'local-fallback',
        model: 'Rule-Based Security Heuristics',
        suggestedActions: ["Why is INC-1001 considered a high risk incident?", "Summarize today's threats."],
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#07111F] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#07111F] tracking-tight">Security Operations Assistant</h1>
              <span className="text-xs font-mono font-semibold bg-[#F1F3F5] text-[#344054] px-2.5 py-0.5 rounded border border-[#E2E8F0]">
                Gemini API Intelligence
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Grounded SOC assistant providing forensic analysis, risk factor breakdowns, and containment guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#ECFDF3] border border-[#ABE5C6] px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-[#027A48]">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          ● SYSTEM ONLINE | SIMULATION MODE
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-5 min-h-[480px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 text-xs ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                msg.sender === 'user' ? 'bg-[#1570EF]' : 'bg-[#07111F]'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
              </div>

              <div className={`max-w-2xl rounded-xl p-4 space-y-2 border shadow-xs ${
                msg.sender === 'user' 
                  ? 'bg-[#EFF8FF] text-[#07111F] border-[#B2DDFF]' 
                  : 'bg-[#FAFBFC] text-[#07111F] border-[#E8ECF0]'
              }`}>
                <div className="flex items-center justify-between gap-4 border-b border-[#E8ECF0] pb-2 text-[11px] font-mono text-[#667085]">
                  <span className="font-bold">{msg.sender === 'user' ? 'Security Analyst' : 'CyberAI Intelligence'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-line leading-relaxed text-xs text-[#344054]">
                  {msg.text}
                </div>

                {msg.model && (
                  <div className="text-[10px] font-mono text-[#667085] pt-1">
                    Engine: <span className="font-semibold text-[#07111F]">{msg.model}</span>
                  </div>
                )}

                {/* Suggested Follow-up Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-[#E8ECF0] flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((actionText, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(actionText)}
                        className="text-[11px] font-medium text-[#1570EF] bg-white hover:bg-[#EFF8FF] border border-[#B2DDFF] px-2.5 py-1 rounded transition-colors cursor-pointer text-left"
                      >
                        {actionText}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-[#667085] p-3 bg-[#FAFBFC] border border-[#E8ECF0] rounded-xl w-fit">
              <RefreshCw className="w-4 h-4 text-[#1570EF] animate-spin" />
              <span>Analyzing telemetry and generating forensic assessment...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-3 border-t border-[#E8ECF0]"
        >
          <input
            type="text"
            placeholder="Ask CyberAI Assistant about threats, incidents, IPs, or risk factors..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#FAFBFC] border border-[#E2E8F0] focus:border-[#07111F] rounded-lg px-3.5 py-2 text-xs text-[#07111F] placeholder:text-[#94A3B8] outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-[#07111F] hover:bg-[#0B1930] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
