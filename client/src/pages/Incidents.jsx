import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Filter, Search, ArrowRight, Eye, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents');
      if (res.data.incidents) {
        setIncidents(res.data.incidents);
      }
    } catch (err) {
      console.warn('Fetch incidents fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await api.put(`/incidents/${incidentId}`, { status: newStatus });
      showToast(`Incident ${incidentId} status updated to '${newStatus}'`);
      fetchIncidents();
    } catch (err) {
      showToast('Failed to update incident status.');
    }
  };

  const statusOptions = ['All', 'New', 'Investigating', 'Contained', 'Resolved', 'False Positive'];

  const filteredIncidents = incidents.filter(inc => {
    const matchesStatus = activeStatus === 'All' || inc.status === activeStatus;
    const matchesQuery = searchQuery === '' || 
      inc.incidentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.threatType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.sourceIp && inc.sourceIp.includes(searchQuery)) ||
      (inc.username && inc.username.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

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

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#07111F] text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#07111F] tracking-tight">
                Incident Triage Queue
              </h1>
              <span className="text-xs font-mono font-semibold bg-[#F1F3F5] text-[#344054] px-2.5 py-0.5 rounded border border-[#E2E8F0]">
                {filteredIncidents.length} Active Records
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Correlated security incidents sorted by explainable risk scores and kill chain status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#ECFDF3] border border-[#ABE5C6] px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-[#027A48]">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          ● SYSTEM ONLINE | SIMULATION MODE
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-[#E8ECF0] rounded-xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeStatus === status
                  ? 'bg-[#07111F] text-white font-semibold'
                  : 'text-[#667085] hover:bg-[#F8FAFC] hover:text-[#07111F]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-72 flex items-center bg-[#FAFBFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 gap-2">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search incident ID, threat, IP, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-[#07111F] placeholder:text-[#94A3B8]"
          />
        </div>
      </div>

      {/* Incidents Dense Table */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-5">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8ECF0] text-[#667085] font-mono text-[11px] uppercase bg-[#FAFBFC]">
                <th className="py-3 px-3">Incident ID</th>
                <th className="py-3 px-3">Threat Classification</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Explainable Risk</th>
                <th className="py-3 px-3">Source IP</th>
                <th className="py-3 px-3">Target User</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#667085]">
                    No incidents match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr 
                    key={inc.incidentId}
                    onClick={() => navigate(`/incidents/${inc.incidentId}`)}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-3 font-mono font-bold text-[#07111F]">
                      {inc.incidentId}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#07111F] group-hover:text-[#1570EF] transition-colors">
                        {inc.threatType}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadgeClass(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#07111F]">
                      <div className="flex items-center gap-2">
                        <span>{inc.riskScore}/100</span>
                        <div className="w-16 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#B42318]" 
                            style={{ width: `${inc.riskScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#344054]">{inc.sourceIp}</td>
                    <td className="py-3.5 px-3 font-medium text-[#344054]">{inc.username || 'admin'}</td>
                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={inc.status}
                        onChange={(e) => handleStatusChange(inc.incidentId, e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded bg-[#F1F3F5] border border-[#E2E8F0] text-[#07111F] outline-none cursor-pointer"
                      >
                        <option value="New">New</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Contained">Contained</option>
                        <option value="Resolved">Resolved</option>
                        <option value="False Positive">False Positive</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/incidents/${inc.incidentId}`);
                        }}
                        className="px-3 py-1 bg-[#07111F] hover:bg-[#0B1930] text-white text-xs font-semibold rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
