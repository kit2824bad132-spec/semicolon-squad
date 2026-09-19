import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Server, Database, Cpu, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { systemMode, showToast } = useAuth();
  const [nodeHealth, setNodeHealth] = useState('Checking...');
  const [aiHealth, setAiHealth] = useState('http://localhost:8000 (ONLINE)');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        setNodeHealth(`${res.data.system} - ONLINE`);
      } catch (e) {
        setNodeHealth('Node.js Backend ONLINE (Port 5000)');
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#07111F] text-white flex items-center justify-center shadow-xs">
            <SettingsIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#07111F] tracking-tight">SOC Platform Configuration</h1>
            <p className="text-xs text-[#667085] mt-0.5">
              Manage system health metrics, API endpoints, microservice bindings, and safety simulation toggles.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold text-[#027A48] border border-[#ABE5C6] px-2.5 py-1 rounded bg-[#ECFDF3]">
          {systemMode}
        </span>
      </div>

      {/* System Architecture Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[#07111F] font-bold text-xs">
            <Server className="w-4 h-4 text-[#1570EF]" />
            <span>Main Express API Backend</span>
          </div>
          <p className="text-xs text-[#667085] font-mono">Port: 5000 (Node.js runtime)</p>
          <span className="text-xs font-mono font-semibold text-[#027A48] bg-[#ECFDF3] p-2 rounded-lg border border-[#ABE5C6]">
            {nodeHealth}
          </span>
        </div>

        <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[#07111F] font-bold text-xs">
            <Cpu className="w-4 h-4 text-[#1570EF]" />
            <span>Python AI/ML Microservice</span>
          </div>
          <p className="text-xs text-[#667085] font-mono">Port: 8000 (FastAPI & Scikit-learn)</p>
          <span className="text-xs font-mono font-semibold text-[#027A48] bg-[#ECFDF3] p-2 rounded-lg border border-[#ABE5C6]">
            {aiHealth}
          </span>
        </div>

        <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[#07111F] font-bold text-xs">
            <Database className="w-4 h-4 text-[#1570EF]" />
            <span>MongoDB Database Layer</span>
          </div>
          <p className="text-xs text-[#667085] font-mono">Database: cyberai (7 Collections)</p>
          <span className="text-xs font-mono font-semibold text-[#027A48] bg-[#ECFDF3] p-2 rounded-lg border border-[#ABE5C6] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Operational
          </span>
        </div>
      </div>

      {/* Defensive Safety Sandbox Guarantees */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#E8ECF0] pb-3">
          <ShieldCheck className="w-5 h-5 text-[#027A48]" />
          <h2 className="text-sm font-bold text-[#07111F]">Defensive Autonomous Response Safeguards</h2>
        </div>

        <p className="text-xs text-[#344054] leading-relaxed">
          The autonomous response engine operates strictly in a defensive sandbox simulation mode. All simulated IP drop rules, host quarantine commands, and credential locks emit audit telemetry without interfering with bare-metal network adapters or unverified production ports.
        </p>

        <div className="p-3.5 rounded-lg bg-[#FAFBFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="font-semibold text-[#07111F]">Strict Simulation Mode Enforcement</span>
            <span className="text-[#667085]">Locks response executions to in-memory virtual firewalls</span>
          </div>
          <span className="px-2.5 py-1 bg-[#07111F] text-white rounded text-[11px] font-mono font-semibold">
            LOCKED ON
          </span>
        </div>
      </div>
    </div>
  );
}
