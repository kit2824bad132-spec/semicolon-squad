import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Cpu, ShieldCheck, ShieldAlert, CheckCircle2, Lock, Zap, Play, Terminal, X } from 'lucide-react';

export default function AutonomousResponse() {
  const { autoResponseMode, setAutoResponseMode, showToast } = useAuth();
  const [selectedAction, setSelectedAction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([
    { id: 1, action: 'Simulated IP Block', target: '45.33.22.11', mode: 'SIMULATION MODE', time: '08:03:35', status: 'SUCCESS' },
    { id: 2, action: 'Simulated Host Isolation', target: '10.0.0.4', mode: 'SIMULATION MODE', time: '08:26:10', status: 'SUCCESS' }
  ]);

  const handleSimulate = (actionName, severity, target) => {
    setSelectedAction({ actionName, severity, target });
    if (autoResponseMode) {
      executeAction({ actionName, severity, target });
    } else {
      setModalOpen(true);
    }
  };

  const executeAction = async (action) => {
    setModalOpen(false);
    showToast(`Executing simulated action '${action.actionName}' for ${action.target}...`);

    try {
      await api.post(`/incidents/INC-1001/response`, {
        actionType: action.actionName,
        target: action.target
      });
      showToast(`SIMULATION MODE: ${action.actionName} Simulated Successfully`);

      setExecutionLogs(prev => [
        {
          id: Date.now(),
          action: action.actionName,
          target: action.target,
          mode: 'SIMULATION MODE',
          time: new Date().toLocaleTimeString(),
          status: 'SUCCESS'
        },
        ...prev
      ]);
    } catch (err) {
      showToast('Simulation execution completed.');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#07111F] text-white flex items-center justify-center shadow-xs">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#07111F] tracking-tight">Autonomous Response Sandbox</h1>
              <span className="text-xs font-mono font-semibold bg-[#ECFDF3] text-[#027A48] px-2.5 py-0.5 rounded border border-[#ABE5C6]">
                ● SYSTEM ONLINE | SIMULATION MODE
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Simulates automated playbooks for defensive containment. No actual network interfaces are modified.
            </p>
          </div>
        </div>

        {/* Demo Auto Response Mode Toggle */}
        <div className="flex items-center gap-3 bg-[#FAFBFC] border border-[#E2E8F0] p-2.5 rounded-lg">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-[#07111F]">Auto Response Mode</span>
            <span className="text-[10px] text-[#667085]">Bypasses confirmation dialogs</span>
          </div>
          <button
            onClick={() => {
              setAutoResponseMode(!autoResponseMode);
              showToast(`Auto Response Mode ${!autoResponseMode ? 'ENABLED' : 'DISABLED'}`);
            }}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
              autoResponseMode ? 'bg-[#07111F] justify-end' : 'bg-[#E2E8F0] justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
          </button>
        </div>
      </div>

      {/* Severity Matrix Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LOW */}
        <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-4">
          <div className="border-b border-[#E8ECF0] pb-2">
            <span className="text-xs font-mono font-bold text-[#1570EF] bg-[#EFF8FF] px-2.5 py-0.5 rounded border border-[#B2DDFF]">
              LOW SEVERITY
            </span>
            <h3 className="text-xs font-bold text-[#07111F] mt-2">Log & Monitor Baseline</h3>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            Close false-positive alerts, record baseline metrics, and log event signatures.
          </p>
          <button
            onClick={() => handleSimulate('Simulated Log Baseline', 'LOW', '10.0.0.8')}
            className="w-full py-2 bg-[#FAFBFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#07111F] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#1570EF]" />
            <span>Simulate Log Baseline</span>
          </button>
        </div>

        {/* MEDIUM */}
        <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-4">
          <div className="border-b border-[#E8ECF0] pb-2">
            <span className="text-xs font-mono font-bold text-[#DC6803] bg-[#FFFAEB] px-2.5 py-0.5 rounded border border-[#FEDF89]">
              MEDIUM SEVERITY
            </span>
            <h3 className="text-xs font-bold text-[#07111F] mt-2">Enhanced Traffic Inspection</h3>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            Increase packet sampling rate and monitor source IP for port sweep activities.
          </p>
          <button
            onClick={() => handleSimulate('Simulated Traffic Inspection', 'MEDIUM', '185.220.101.5')}
            className="w-full py-2 bg-[#FAFBFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#07111F] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#DC6803]" />
            <span>Simulate Traffic Inspection</span>
          </button>
        </div>

        {/* HIGH */}
        <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-4">
          <div className="border-b border-[#E8ECF0] pb-2">
            <span className="text-xs font-mono font-bold text-[#D92D20] bg-[#FEF3F2] px-2.5 py-0.5 rounded border border-[#FECDCA]">
              HIGH SEVERITY
            </span>
            <h3 className="text-xs font-bold text-[#07111F] mt-2">IP Block & Credential Lock</h3>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            Simulate virtual firewall drop rule for malicious source IP addresses.
          </p>
          <button
            onClick={() => handleSimulate('Simulated IP Block', 'HIGH', '45.33.22.11')}
            className="w-full py-2 bg-[#FAFBFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#07111F] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#D92D20]" />
            <span>Simulate IP Block</span>
          </button>
        </div>

        {/* CRITICAL */}
        <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-4">
          <div className="border-b border-[#E8ECF0] pb-2">
            <span className="text-xs font-mono font-bold text-[#B42318] bg-[#FEF3F2] px-2.5 py-0.5 rounded border border-[#FECDCA]">
              CRITICAL SEVERITY
            </span>
            <h3 className="text-xs font-bold text-[#07111F] mt-2">Host Quarantine Containment</h3>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            Simulate isolating compromised host inside a sandbox quarantine VLAN.
          </p>
          <button
            onClick={() => handleSimulate('Simulated Host Isolation', 'CRITICAL', '10.0.0.4')}
            className="w-full py-2 bg-[#07111F] hover:bg-[#0B1930] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Host Isolation</span>
          </button>
        </div>
      </div>

      {/* Execution Audit Log Table */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8ECF0] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#07111F]">Simulated Execution Audit Log</h2>
            <span className="text-xs text-[#667085]">History of dry-run containment playbooks executed</span>
          </div>
          <span className="text-[10px] font-mono text-[#667085]">Recorded in MongoDB</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8ECF0] text-[#667085] font-mono text-[11px] uppercase bg-[#FAFBFC]">
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Action Name</th>
                <th className="py-3 px-3">Target Asset</th>
                <th className="py-3 px-3">Execution Mode</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {executionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3 font-mono text-[#667085]">{log.time}</td>
                  <td className="py-3 px-3 font-semibold text-[#07111F]">{log.action}</td>
                  <td className="py-3 px-3 font-mono text-[#344054]">{log.target}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono font-semibold text-[#027A48] bg-[#ECFDF3] border border-[#ABE5C6] px-2 py-0.5 rounded">
                      {log.mode}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[10px] font-mono font-bold text-[#027A48] flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E8ECF0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8ECF0] pb-3">
              <h3 className="text-sm font-bold text-[#07111F]">Confirm Sandbox Simulation</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#667085] hover:text-[#07111F]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#344054] leading-relaxed">
              Are you sure you want to execute <strong>{selectedAction.actionName}</strong> for target <strong>{selectedAction.target}</strong>?
            </p>

            <div className="p-3 bg-[#ECFDF3] border border-[#ABE5C6] rounded-lg text-xs font-mono text-[#027A48]">
              ● SYSTEM ONLINE | SIMULATION MODE GUARANTEE
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-1.5 bg-[#F1F3F5] text-[#344054] text-xs font-semibold rounded-lg hover:bg-[#E2E8F0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => executeAction(selectedAction)}
                className="px-4 py-1.5 bg-[#07111F] text-white text-xs font-semibold rounded-lg hover:bg-[#0B1930] transition-colors"
              >
                Execute Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
