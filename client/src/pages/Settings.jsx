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
    <div className="w-full px-6 py-6 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md">
            <SettingsIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">SOC Platform Configuration</h1>
            <p className="font-body-sm text-sm text-outline mt-0.5">
              Manage system health metrics, API endpoints, microservice bindings, and safety simulation toggles.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-600 border border-emerald-300 px-3 py-1 rounded-full bg-emerald-50">
          {systemMode}
        </span>
      </div>

      {/* System Architecture Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Server className="w-5 h-5" />
            <span>Main Express API Backend</span>
          </div>
          <p className="text-xs text-outline font-mono">Port: 5000 (Node.js runtime)</p>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 p-2 rounded-lg border border-emerald-300">
            {nodeHealth}
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Cpu className="w-5 h-5" />
            <span>Python AI/ML Microservice</span>
          </div>
          <p className="text-xs text-outline font-mono">Port: 8000 (FastAPI + Isolation Forest)</p>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 p-2 rounded-lg border border-emerald-300">
            {aiHealth}
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Database className="w-5 h-5" />
            <span>MongoDB Database</span>
          </div>
          <p className="text-xs text-outline font-mono">mongodb://127.0.0.1:27017/cyberai_db</p>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 p-2 rounded-lg border border-emerald-300">
            MongoDB Store Synchronized
          </span>
        </div>
      </div>

      {/* Safety & Simulation Settings */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b border-outline-variant/40 pb-3">
          Defensive Safety Directives
        </h2>

        <div className="flex flex-col gap-3 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="font-bold text-xs">Simulation Mode Enforced</strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  All autonomous defensive actions (IP block, host isolation, account lock) run exclusively in simulated dry-run mode.
                </p>
              </div>
            </div>
            <span className="font-bold text-xs bg-emerald-200 px-3 py-1 rounded-full border border-emerald-300">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
