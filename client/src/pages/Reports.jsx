import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function Reports() {
  const [incidentId, setIncidentId] = useState('INC-1001');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useAuth();

  const handleGenerateReport = async (incId = incidentId) => {
    setLoading(true);
    showToast(`Generating structured executive audit report for ${incId}...`);
    try {
      const res = await api.post('/reports', { incidentId: incId });
      if (res.data.report) {
        setReport(res.data.report);
        showToast(`Report ${res.data.report.reportId} generated!`);
      }
    } catch (err) {
      console.warn('Report generation fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport('INC-1001');
  }, []);

  const handlePrintDownload = () => {
    showToast('Triggering print dialog for PDF export...');
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#07111F] text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#07111F] tracking-tight">Structured Executive Audit Reports</h1>
              <span className="text-xs font-mono font-semibold bg-[#F1F3F5] text-[#344054] px-2.5 py-0.5 rounded border border-[#E2E8F0]">
                PDF / Audit Export
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Generates compliance-ready executive incident reports detailing evidence, risk factors, and containment actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={incidentId}
            onChange={(e) => {
              setIncidentId(e.target.value);
              handleGenerateReport(e.target.value);
            }}
            className="bg-[#FAFBFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#07111F] outline-none cursor-pointer"
          >
            <option value="INC-1001">INC-1001 (Brute Force)</option>
            <option value="INC-1002">INC-1002 (Port Scan)</option>
            <option value="INC-1003">INC-1003 (Privilege Escalation)</option>
            <option value="INC-1004">INC-1004 (Unusual Data Transfer)</option>
            <option value="INC-1005">INC-1005 (False Positive Alert)</option>
          </select>

          <button
            onClick={handlePrintDownload}
            className="flex items-center gap-1.5 bg-[#07111F] hover:bg-[#0B1930] text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Printable Report Paper Layout */}
      {report && (
        <div className="bg-white border border-[#E8ECF0] rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-8 max-w-4xl mx-auto w-full space-y-6 print:shadow-none print:border-none print:p-0">
          {/* Document Header */}
          <div className="flex items-center justify-between border-b border-[#07111F] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#07111F] text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#07111F]">CyberAI Security Incident Executive Report</h2>
                <span className="text-xs text-[#667085] font-mono">Report ID: {report.reportId}</span>
              </div>
            </div>

            <div className="text-right text-xs font-mono">
              <div className="font-bold text-[#027A48]">● SYSTEM ONLINE | SIMULATION MODE</div>
              <div className="text-[#667085]">{new Date(report.date || report.generatedAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Incident Meta Summary Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#FAFBFC] border border-[#E8ECF0] text-xs">
            <div>
              <span className="text-[#667085] uppercase text-[10px] font-mono font-bold">Incident ID</span>
              <div className="font-mono font-bold text-[#07111F] mt-0.5">{report.incidentId}</div>
            </div>
            <div>
              <span className="text-[#667085] uppercase text-[10px] font-mono font-bold">Threat Category</span>
              <div className="font-bold text-[#07111F] mt-0.5">{report.threatType}</div>
            </div>
            <div>
              <span className="text-[#667085] uppercase text-[10px] font-mono font-bold">Severity Level</span>
              <div className="font-mono font-bold text-[#D92D20] mt-0.5">{report.severity}</div>
            </div>
            <div>
              <span className="text-[#667085] uppercase text-[10px] font-mono font-bold">Risk Score</span>
              <div className="font-mono font-bold text-[#07111F] mt-0.5">{report.riskScore} / 100</div>
            </div>
          </div>

          {/* AI Narrative Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-[#667085] uppercase tracking-wider">
              Forensic Risk Assessment & Impact
            </h3>
            <p className="text-xs text-[#344054] leading-relaxed bg-[#FAFBFC] p-4 rounded-lg border border-[#E8ECF0]">
              {report.summary || report.aiAnalysis || 'Incident indicates elevated risk based on verified security event telemetry.'}
            </p>
          </div>

          {/* Attack Sequence Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-[#667085] uppercase tracking-wider">
              Correlated Attack Sequence Timeline
            </h3>
            <div className="space-y-2">
              {report.attackSequence && report.attackSequence.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#FAFBFC] p-3 rounded-lg border border-[#E8ECF0] text-xs font-mono">
                  <span>Step {step.step || idx+1}: <strong className="text-[#07111F] font-sans">{step.stage}</strong> — {step.description}</span>
                  <span className="text-[#667085]">{step.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Response History */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-[#667085] uppercase tracking-wider">
              Defensive Response Actions
            </h3>
            <div className="p-3 bg-[#ECFDF3] border border-[#ABE5C6] rounded-lg text-xs font-mono text-[#027A48] flex items-center justify-between">
              <span>SIMULATION MODE: Containment playbook executed for {report.sourceIp || '45.33.22.11'}</span>
              <span className="font-bold">STATUS: CONTAINED</span>
            </div>
          </div>

          {/* Sign-off Footer */}
          <div className="pt-6 border-t border-[#E8ECF0] flex items-center justify-between text-xs text-[#667085] font-mono">
            <div>Generated by: <strong>CyberAI Platform Engine</strong></div>
            <div>Approved by: <strong>SOC Lead Analyst</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
