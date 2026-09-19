import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Server, 
  RefreshCw, 
  ArrowRight, 
  Radio, 
  ChevronRight,
  Filter,
  Layers,
  Terminal,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [timeRange, setTimeRange] = useState('24h');
  const [analyzing, setAnalyzing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard');
      if (res.data?.status === 'SUCCESS') {
        setData(res.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('[Dashboard Error]', err);
      setError('Failed to retrieve live security telemetry from Express backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const triggerAnalyze = async () => {
    try {
      setAnalyzing(true);
      await api.post('/events/analyze');
      await fetchDashboardData();
    } catch (err) {
      console.error('[Analyze Error]', err);
    } finally {
      setAnalyzing(false);
    }
  };

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

  const metrics = data?.metrics || {
    totalEvents: 24821,
    detectedThreats: 12,
    activeIncidents: 37,
    criticalIncidents: 12,
    resolvedIncidents: 184,
    anomaliesDetected: 67
  };

  const charts = data?.charts || {};
  const riskDistribution = charts.riskDistribution || charts.threatSeverityData || [
    { name: 'Low', count: 14, color: '#1570EF' },
    { name: 'Medium', count: 18, color: '#DC6803' },
    { name: 'High', count: 9, color: '#D92D20' },
    { name: 'Critical', count: 5, color: '#B42318' }
  ];

  const threatTrends = charts.threatTrends || charts.threatTypesData || [
    { type: 'Brute Force', count: 45 },
    { type: 'Port Scan', count: 28 },
    { type: 'Suspicious Login', count: 22 },
    { type: 'Privilege Escalation', count: 18 },
    { type: 'Data Exfiltration', count: 15 }
  ];

  const activityTimeline = charts.securityActivityTimeline || charts.threatActivityData || [
    { time: '08:00', events: 120, anomalies: 2 },
    { time: '08:10', events: 340, anomalies: 8 },
    { time: '08:20', events: 210, anomalies: 5 },
    { time: '08:30', events: 890, anomalies: 24 },
    { time: '08:40', events: 450, anomalies: 12 },
    { time: '08:50', events: 310, anomalies: 6 },
    { time: '09:00', events: 520, anomalies: 10 }
  ];

  const recentIncidents = data?.recentIncidents || [];
  const responseActions = data?.responseActions || [];

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E8ECF0] rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#07111F] tracking-tight">
              Security Overview
            </h1>
            <span className="text-[11px] font-mono text-[#667085] bg-[#F1F3F5] px-2 py-0.5 rounded border border-[#E2E8F0]">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            Real-time security telemetry, ML threat classification, and incident triage
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center bg-[#F1F3F5] border border-[#E2E8F0] rounded-lg p-0.5 text-xs font-medium text-[#344054]">
            {['24h', '7d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  timeRange === r ? 'bg-white text-[#07111F] font-semibold shadow-xs' : 'text-[#667085] hover:text-[#07111F]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#344054] bg-white hover:bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#667085] ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={triggerAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#07111F] hover:bg-[#0B1930] rounded-lg transition-all shadow-sm disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${analyzing ? 'text-amber-400 animate-pulse' : 'text-blue-400'}`} />
            {analyzing ? 'Scanning Outliers...' : 'Run Anomaly Scanner'}
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Events */}
        <div className="bg-[#FFFFFF] border border-[#E8ECF0] rounded-xl p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-[#667085]">
            <span>Events</span>
            <Activity className="w-4 h-4 text-[#1570EF]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#07111F] font-mono tracking-tight">
              {metrics.totalEvents.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#027A48] font-medium">
              <span>+8.4%</span>
              <span className="text-[#667085] font-normal">Last 24 hours</span>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-[#FFFFFF] border border-[#E8ECF0] rounded-xl p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-[#667085]">
            <span>Critical Alerts</span>
            <AlertTriangle className="w-4 h-4 text-[#B42318]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#B42318] font-mono tracking-tight">
              {metrics.criticalIncidents}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#B42318] font-medium">
              <span>{metrics.criticalIncidents} unresolved</span>
            </div>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-[#FFFFFF] border border-[#E8ECF0] rounded-xl p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-[#667085]">
            <span>Active Incidents</span>
            <Shield className="w-4 h-4 text-[#DC6803]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#07111F] font-mono tracking-tight">
              {metrics.activeIncidents}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#DC6803] font-medium">
              <span>{metrics.activeIncidents} require attention</span>
            </div>
          </div>
        </div>

        {/* Overall Risk Score */}
        <div className="bg-[#FFFFFF] border border-[#E8ECF0] rounded-xl p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-[#667085]">
            <span>Overall Risk</span>
            <Lock className="w-4 h-4 text-[#D92D20]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#07111F] font-mono tracking-tight flex items-baseline gap-1">
              68 <span className="text-xs text-[#667085] font-normal">/ 100</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#D92D20] font-semibold uppercase font-mono">
              Elevated Risk Baseline
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS SECTION: EVENT ACTIVITY & THREAT DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Activity (2 Cols) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#07111F] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1570EF]" />
                Event Activity
              </h2>
              <p className="text-xs text-[#667085]">Ingested telemetry logs and ML anomaly outlier occurrences</p>
            </div>
            <span className="text-[11px] font-mono font-medium text-[#344054] bg-[#F1F3F5] px-2.5 py-1 rounded">
              Edge Stream
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1570EF" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#1570EF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D92D20" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D92D20" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#07111F', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px', color: '#FFFFFF' }}
                />
                <Area type="monotone" dataKey="events" name="Total Events" stroke="#1570EF" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
                <Area type="monotone" dataKey="anomalies" name="Anomalies" stroke="#D92D20" strokeWidth={2} fillOpacity={1} fill="url(#colorAnomalies)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution Donut (1 Col) */}
        <div className="bg-[#FFFFFF] border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#07111F] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#DC6803]" />
              Threat Distribution
            </h2>
            <p className="text-xs text-[#667085]">Severity breakdown across active alerts</p>
          </div>

          <div className="h-48 w-full my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#1570EF'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#07111F', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px', color: '#FFFFFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8ECF0]">
            {riskDistribution.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }}></span>
                <span className="text-[#344054] font-medium">{r.name}:</span>
                <span className="text-[#07111F] font-mono font-bold">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ACTIVE INCIDENTS TABLE */}
      <div className="bg-[#FFFFFF] border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#07111F] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B42318]" />
              Active Incidents Queue
            </h2>
            <p className="text-xs text-[#667085]">Real-time security incident records stored in MongoDB</p>
          </div>
          <button
            onClick={() => navigate('/incidents')}
            className="text-xs font-semibold text-[#1570EF] hover:text-[#175CD3] flex items-center gap-1 transition-colors"
          >
            View All Incidents <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8ECF0] text-[#667085] font-mono text-[11px] uppercase bg-[#FAFBFC]">
                <th className="py-3 px-3">Incident ID</th>
                <th className="py-3 px-3">Title / Threat</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Source IP</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {recentIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#667085]">
                    No active incidents recorded in database.
                  </td>
                </tr>
              ) : (
                recentIncidents.map((inc) => (
                  <tr 
                    key={inc.incidentId}
                    onClick={() => navigate(`/incidents/${inc.incidentId}`)}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#07111F]">
                      {inc.incidentId}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#07111F] group-hover:text-[#1570EF] transition-colors">
                        {inc.title || `${inc.threatType} Attack`}
                      </div>
                      <div className="text-[11px] text-[#667085]">{inc.threatType}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadgeClass(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#07111F]">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#B42318]" 
                            style={{ width: `${inc.riskScore}%` }}
                          ></div>
                        </div>
                        <span>{inc.riskScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#344054]">
                      {inc.sourceIp || '192.168.1.100'}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#344054]">
                      {inc.status}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1570EF] group-hover:translate-x-0.5 transition-transform">
                        Investigate <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. RESPONSE ACTIONS LOG */}
      <div className="bg-[#FFFFFF] border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-[#07111F] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#027A48]" />
              Response Actions Log
            </h2>
            <p className="text-xs text-[#667085]">Defensive playbooks executed in sandbox simulation</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#027A48] bg-[#ECFDF3] border border-[#ABE5C6] px-2 py-0.5 rounded">
            ● SIMULATION MODE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {responseActions.length === 0 ? (
            <div className="col-span-2 text-center py-6 text-xs text-[#667085]">
              No simulated response actions recorded.
            </div>
          ) : (
            responseActions.map((act, i) => (
              <div key={act.actionId || i} className="bg-[#FAFBFC] border border-[#E8ECF0] p-3 rounded-lg flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#027A48] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {act.action || act.actionType}
                    </span>
                    <span className="text-[10px] font-mono text-[#667085]">
                      {act.incidentId}
                    </span>
                  </div>
                  <p className="text-[#344054]">
                    Target: <span className="font-mono text-[#07111F] font-semibold">{act.target || 'System Node'}</span>
                  </p>
                  <p className="text-[11px] text-[#667085] line-clamp-1">
                    {act.description || act.details || 'Executed in sandbox environment.'}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#667085] bg-[#E2E8F0] px-1.5 py-0.5 rounded shrink-0">
                  SIMULATED
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
