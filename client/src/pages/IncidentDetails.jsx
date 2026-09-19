import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, ArrowLeft, Cpu, Activity, Clock, CheckCircle2, 
  XCircle, AlertOctagon, FileText, Play, Bot, AlertTriangle, Shield,
  ChevronRight, ExternalLink, Terminal, Eye, SlidersHorizontal, Lock, X
} from 'lucide-react';

export default function IncidentDetails() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analystNotes, setAnalystNotes] = useState('');
  const [executingAction, setExecutingAction] = useState(false);
  const [explainingWithAI, setExplainingWithAI] = useState(false);
  const [aiModelUsed, setAiModelUsed] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/incidents/${id}`);
      if (res.data?.incident) {
        setIncident(res.data.incident);
        setAnalystNotes(res.data.incident.analystNotes || '');
      } else {
        throw new Error('No incident returned');
      }
    } catch (err) {
      console.warn('Fetch details fallback');
      const fallbackInc = {
        incidentId: id || 'INC-1001',
        title: 'SSH Brute Force Credential Attack on Edge Gateway',
        description: 'Multiple automated login failures followed by privileged session initialization.',
        threatType: 'Brute Force',
        severity: 'HIGH',
        riskScore: 88,
        sourceIp: '45.33.22.11',
        destinationIp: '10.0.0.1',
        username: 'root',
        status: 'Investigating',
        affectedAssets: ['10.0.0.1', 'root'],
        evidence: [
          { key: 'Source IP Reputation', value: '45.33.22.11 (External Unverified ASN)' },
          { key: 'Authentication Attempt Rate', value: '24 failed SSH logins within 60s' },
          { key: 'Target Privilege Level', value: 'Administrative Root Account' },
          { key: 'Target Protocol', value: 'SSH / Port 22' }
        ],
        attackTimeline: [
          { step: 1, stage: 'Authentication Probe', description: '24 automated SSH failed logins logged from 45.33.22.11', timestamp: '2026-09-19T08:02:40Z' },
          { step: 2, stage: 'Credential Match', description: 'Successful SSH session established for root user', timestamp: '2026-09-19T08:03:25Z' },
          { step: 3, stage: 'Shell Elevation', description: 'sudo su subshell elevated without secondary 2FA', timestamp: '2026-09-19T08:03:30Z' }
        ],
        riskFactors: [
          { factor: 'Extreme failed login frequency', points: 30 },
          { factor: 'Isolation Forest Anomaly Score (0.91)', points: 25 },
          { factor: 'Privileged root account involvement', points: 20 },
          { factor: 'External unverified IP block', points: 13 }
        ],
        aiExplanation: 'This incident is classified as HIGH risk (88/100) because multiple failed authentication attempts were followed by a successful SSH login and privileged activity from an unusual source.',
        recommendedResponse: [
          { id: 'act-1', type: 'SIMULATE_BLOCK_IP', label: 'Simulate IP Blocking (45.33.22.11)', severity: 'HIGH' },
          { id: 'act-2', type: 'SIMULATE_HOST_ISOLATION', label: 'Simulate Host Isolation (10.0.0.1)', severity: 'CRITICAL' }
        ],
        responseHistory: [],
        analystNotes: 'Initial triage complete. Operating in sandbox simulation mode.',
        createdAt: new Date()
      };
      setIncident(fallbackInc);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleExplainWithAI = async () => {
    setExplainingWithAI(true);
    showToast('Consulting AI Service for Forensic Explanation...');
    try {
      const res = await api.post(`/incidents/${id}/explain-ai`);
      if (res.data?.explanation) {
        setIncident(prev => ({ ...prev, aiExplanation: res.data.explanation }));
        setAiModelUsed(res.data.model || 'Gemini 1.5 Flash');
        showToast('Forensic assessment updated successfully!');
      }
    } catch (err) {
      showToast('AI service unavailable. Showing rule-based security analysis.');
    } finally {
      setExplainingWithAI(false);
    }
  };

  const handleSimulatedResponse = async (actionType, target) => {
    setExecutingAction(true);
    showToast(`SIMULATION MODE: Executing '${actionType}'...`);
    try {
      const res = await api.post(`/incidents/${id}/response`, { actionType, target });
      showToast(res.data.message || `SIMULATION MODE: Action Simulated Successfully`);
      fetchDetails();
    } catch (err) {
      showToast('Failed to execute response action.');
    } finally {
      setExecutingAction(false);
    }
  };

  const handleFeedback = async (feedbackType) => {
    try {
      await api.post(`/incidents/${id}/feedback`, {
        feedback: feedbackType,
        feedbackType,
        analystNotes
      });
      showToast(`Analyst Review Saved: ${feedbackType}`);
      fetchDetails();
    } catch (err) {
      showToast('Failed to save review.');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.put(`/incidents/${id}`, { status: newStatus, analystNotes });
      showToast(`Incident marked as '${newStatus}'`);
      fetchDetails();
    } catch (err) {
      showToast('Failed to update status.');
    }
  };

  if (loading || !incident) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-[#1570EF] animate-spin" />
      </div>
    );
  }

  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]';
      case 'HIGH':
        return 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]';
      case 'MEDIUM':
        return 'bg-[#FFFAEB] text-[#DC6803] border-[#FEDF89]';
      case 'LOW':
      default:
        return 'bg-[#EFF8FF] text-[#1570EF] border-[#B2DDFF]';
    }
  };

  const timelineNodes = incident.attackTimeline || incident.timeline || [
    { step: 1, stage: 'Authentication', description: 'Initial login request initiated', timestamp: '10:32:00' },
    { step: 2, stage: 'Credential Anomaly', description: 'Multiple failed authentication probes', timestamp: '10:34:15' },
    { step: 3, stage: 'Privilege Escalation', description: 'sudo subshell elevated to root context', timestamp: '10:37:30' },
    { step: 4, stage: 'Network Connection', description: 'Outbound connection opened to remote node', timestamp: '10:39:45' },
    { step: 5, stage: 'Data Access', description: 'High payload archive transmission', timestamp: '10:42:10' }
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/incidents')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#07111F] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Incidents Queue
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/reports')}
            className="px-3 py-1.5 bg-white border border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#344054] text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Export Executive Report
          </button>
        </div>
      </div>

      {/* Incident Fact Header Banner */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-mono font-bold text-[#07111F] bg-[#F1F3F5] px-2.5 py-0.5 rounded border border-[#E2E8F0]">
                {incident.incidentId}
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${getSeverityBadgeClass(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="text-xs font-mono font-semibold text-[#344054] bg-[#F8FAFC] px-2.5 py-0.5 rounded border border-[#E2E8F0]">
                Risk Score: {incident.riskScore}/100
              </span>
              <span className="text-xs font-medium text-[#07111F] bg-[#ECFDF3] text-[#027A48] px-2.5 py-0.5 rounded border border-[#ABE5C6]">
                Status: {incident.status}
              </span>
            </div>

            <h1 className="text-xl font-bold text-[#07111F] tracking-tight mt-2">
              {incident.title || `${incident.threatType} Incident`}
            </h1>
            <p className="text-xs text-[#667085] mt-1">
              {incident.description || 'Verified security alert with correlated event telemetry.'}
            </p>
          </div>

          {/* Quick Status Select */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[10px] font-mono text-[#667085] uppercase">Update Incident Status</span>
            <select
              value={incident.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F1F3F5] border border-[#CBD5E1] text-[#07111F] outline-none cursor-pointer"
            >
              <option value="New">New</option>
              <option value="Investigating">Investigating</option>
              <option value="Contained">Contained</option>
              <option value="Resolved">Resolved</option>
              <option value="False Positive">False Positive</option>
            </select>
          </div>
        </div>

        {/* Fact Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E8ECF0] text-xs">
          <div>
            <span className="text-[#667085] block font-mono text-[11px] uppercase">Source IP</span>
            <span className="font-mono font-bold text-[#07111F] mt-0.5 block">{incident.sourceIp || '192.168.1.100'}</span>
          </div>
          <div>
            <span className="text-[#667085] block font-mono text-[11px] uppercase">Destination Asset</span>
            <span className="font-mono font-bold text-[#07111F] mt-0.5 block">{incident.destinationIp || '10.0.0.1'}</span>
          </div>
          <div>
            <span className="text-[#667085] block font-mono text-[11px] uppercase">Target User</span>
            <span className="font-medium text-[#07111F] mt-0.5 block">{incident.username || 'admin'}</span>
          </div>
          <div>
            <span className="text-[#667085] block font-mono text-[11px] uppercase">First Detected</span>
            <span className="font-mono text-[#344054] mt-0.5 block">
              {incident.createdAt ? new Date(incident.createdAt).toLocaleTimeString() : 'Recent'}
            </span>
          </div>
        </div>
      </div>

      {/* Attack Sequence Timeline Visualization */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#07111F] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1570EF]" />
              Attack Sequence Timeline
            </h2>
            <p className="text-xs text-[#667085]">Sequential causal progression across incident stages. Click any node to inspect details.</p>
          </div>
        </div>

        <div className="relative py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
            {timelineNodes.map((node, index) => (
              <div 
                key={index}
                onClick={() => {
                  setSelectedNode(node);
                  setDrawerOpen(true);
                }}
                className="bg-[#FAFBFC] hover:bg-[#F1F5F9] border border-[#E8ECF0] hover:border-[#1570EF] p-3 rounded-lg cursor-pointer transition-all group relative"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#1570EF] bg-[#EFF8FF] px-2 py-0.5 rounded border border-[#B2DDFF]">
                    Stage {node.step || index + 1}
                  </span>
                  <span className="text-[10px] font-mono text-[#667085]">
                    {node.timestamp || `T+0${index}m`}
                  </span>
                </div>
                <div className="font-bold text-xs text-[#07111F] group-hover:text-[#1570EF] transition-colors">
                  {node.stage || node.name || 'Detection Node'}
                </div>
                <p className="text-[11px] text-[#667085] mt-1 line-clamp-2">
                  {node.description || 'Observed telemetry event'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Supporting Evidence & Risk Factors Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supporting Evidence */}
        <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#07111F] flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-[#344054]" />
              Supporting Evidence
            </h2>
            <p className="text-xs text-[#667085] mb-3">Concrete technical facts supporting threat assessment</p>

            <div className="space-y-2">
              {incident.evidence && incident.evidence.length > 0 ? (
                incident.evidence.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#FAFBFC] border border-[#E8ECF0] px-3 py-2 rounded-lg text-xs">
                    <span className="font-medium text-[#344054]">{ev.key || ev.name || 'Fact'}:</span>
                    <span className="font-mono font-semibold text-[#07111F]">{ev.value || ev.detail}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#667085] py-4 text-center">
                  Baseline anomaly outlier evidence recorded.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8ECF0] mt-4 flex items-center justify-between">
            <span className="text-xs text-[#667085]">Trace: Fact → Evidence → Event Log</span>
            <button 
              onClick={() => navigate('/threats')}
              className="text-xs font-semibold text-[#1570EF] hover:underline flex items-center gap-1"
            >
              Inspect Raw Logs <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Explainable Risk Factors */}
        <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#07111F] flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-[#D92D20]" />
              Explainable Risk Factor Breakdown
            </h2>
            <p className="text-xs text-[#667085] mb-3">Additive mathematical points contributing to risk score ({incident.riskScore}/100)</p>

            <div className="space-y-2.5">
              {incident.riskFactors && incident.riskFactors.length > 0 ? (
                incident.riskFactors.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#344054]">{f.factor}</span>
                      <span className="font-mono font-bold text-[#D92D20]">+{f.points} pts</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#D92D20]" 
                        style={{ width: `${Math.min(100, (f.points / 30) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#667085] py-4 text-center">
                  Standard risk factors evaluated.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8ECF0] mt-4 flex items-center justify-between">
            <span className="text-xs text-[#667085]">Transparent Point Accumulation Engine</span>
            <span className="text-xs font-mono font-bold text-[#07111F]">Total: {incident.riskScore}/100</span>
          </div>
        </div>
      </div>

      {/* Forensic Threat Assessment / AI Analysis */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#07111F] flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#1570EF]" />
            Forensic Threat Assessment
          </h2>
          <button
            onClick={handleExplainWithAI}
            disabled={explainingWithAI}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#07111F] hover:bg-[#0B1930] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${explainingWithAI ? 'animate-spin' : ''}`} />
            {explainingWithAI ? 'Generating Analysis...' : 'Re-generate Assessment'}
          </button>
        </div>

        <div className="bg-[#FAFBFC] border border-[#E8ECF0] p-4 rounded-lg text-xs text-[#344054] leading-relaxed font-sans whitespace-pre-line">
          {incident.aiExplanation || 'Incident indicates elevated risk based on baseline security telemetry.'}
        </div>

        {aiModelUsed && (
          <div className="text-[11px] font-mono text-[#667085] text-right">
            Engine: <span className="font-semibold text-[#07111F]">{aiModelUsed}</span>
          </div>
        )}
      </div>

      {/* Autonomous Containment Playbooks (Simulation Mode) */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#07111F] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#027A48]" />
              Recommended Containment Actions
            </h2>
            <p className="text-xs text-[#667085]">All response playbooks execute inside a dry-run sandbox</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#027A48] bg-[#ECFDF3] border border-[#ABE5C6] px-2 py-0.5 rounded">
            ● SIMULATION MODE GUARANTEE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleSimulatedResponse('SIMULATE_BLOCK_IP', incident.sourceIp || '45.33.22.11')}
            disabled={executingAction}
            className="flex items-center justify-between p-3.5 bg-[#FAFBFC] hover:bg-[#F1F5F9] border border-[#E8ECF0] hover:border-[#1570EF] rounded-lg transition-all group text-left cursor-pointer disabled:opacity-50"
          >
            <div>
              <div className="font-bold text-xs text-[#07111F] group-hover:text-[#1570EF] transition-colors">
                Simulated IP Block
              </div>
              <div className="text-[11px] text-[#667085] mt-0.5">
                Target: {incident.sourceIp || '45.33.22.11'}
              </div>
            </div>
            <Play className="w-4 h-4 text-[#1570EF] shrink-0" />
          </button>

          <button
            onClick={() => handleSimulatedResponse('SIMULATE_HOST_ISOLATION', incident.destinationIp || '10.0.0.1')}
            disabled={executingAction}
            className="flex items-center justify-between p-3.5 bg-[#FAFBFC] hover:bg-[#F1F5F9] border border-[#E8ECF0] hover:border-[#D92D20] rounded-lg transition-all group text-left cursor-pointer disabled:opacity-50"
          >
            <div>
              <div className="font-bold text-xs text-[#07111F] group-hover:text-[#D92D20] transition-colors">
                Simulated Host Isolation
              </div>
              <div className="text-[11px] text-[#667085] mt-0.5">
                Target: {incident.destinationIp || '10.0.0.1'}
              </div>
            </div>
            <Play className="w-4 h-4 text-[#D92D20] shrink-0" />
          </button>

          <button
            onClick={() => handleSimulatedResponse('SIMULATE_ACCOUNT_LOCK', incident.username || 'root')}
            disabled={executingAction}
            className="flex items-center justify-between p-3.5 bg-[#FAFBFC] hover:bg-[#F1F5F9] border border-[#E8ECF0] hover:border-[#DC6803] rounded-lg transition-all group text-left cursor-pointer disabled:opacity-50"
          >
            <div>
              <div className="font-bold text-xs text-[#07111F] group-hover:text-[#DC6803] transition-colors">
                Simulated Account Lock
              </div>
              <div className="text-[11px] text-[#667085] mt-0.5">
                Target: {incident.username || 'root'}
              </div>
            </div>
            <Play className="w-4 h-4 text-[#DC6803] shrink-0" />
          </button>
        </div>
      </div>

      {/* Analyst Feedback Review (Active Learning Feed) */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-3">
        <h2 className="text-sm font-bold text-[#07111F]">Analyst Classification Review</h2>
        <p className="text-xs text-[#667085]">
          Submitting feedback recalibrates model contamination rates in MongoDB.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Add analyst notes or investigation comments..."
            value={analystNotes}
            onChange={(e) => setAnalystNotes(e.target.value)}
            className="flex-1 bg-[#FAFBFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#07111F] placeholder:text-[#94A3B8] outline-none focus:border-[#07111F]"
          />
          <button
            onClick={() => handleFeedback('CONFIRMED_THREAT')}
            className="px-4 py-2 bg-[#D92D20] hover:bg-[#B42318] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Confirm Threat
          </button>
          <button
            onClick={() => handleFeedback('FALSE_POSITIVE')}
            className="px-4 py-2 bg-[#F1F3F5] hover:bg-[#E2E8F0] text-[#344054] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Mark False Positive
          </button>
        </div>
      </div>

      {/* Event Details Drawer Overlay */}
      {drawerOpen && selectedNode && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs"
          onClick={() => setDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8ECF0] pb-3">
                <h3 className="text-sm font-bold text-[#07111F]">Stage Evidence Details</h3>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-[#667085] hover:text-[#07111F]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">Stage Name</span>
                  <span className="font-bold text-[#07111F]">{selectedNode.stage || selectedNode.name}</span>
                </div>
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">Timestamp</span>
                  <span className="font-mono text-[#344054]">{selectedNode.timestamp}</span>
                </div>
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">Description</span>
                  <p className="text-[#344054] bg-[#FAFBFC] p-3 rounded-lg border border-[#E8ECF0] mt-1">
                    {selectedNode.description}
                  </p>
                </div>
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">Target Asset</span>
                  <span className="font-mono font-bold text-[#07111F]">{incident.destinationIp || '10.0.0.1'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full py-2 bg-[#07111F] text-white text-xs font-semibold rounded-lg mt-6"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
