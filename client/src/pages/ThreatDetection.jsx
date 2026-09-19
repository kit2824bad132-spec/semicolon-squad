import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Radar, Upload, Cpu, AlertTriangle, FileText, CheckCircle2, ShieldAlert, X, Search, Filter } from 'lucide-react';

export default function ThreatDetection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState(null);
  const [filter, setFilter] = useState('anomalies'); // 'all' | 'anomalies'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { showToast } = useAuth();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      if (res.data.events) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.warn('Events fetch fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a CSV file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    showToast('Uploading CSV log dataset...');
    try {
      const res = await api.post('/events/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message || 'CSV log events uploaded successfully!');
      fetchEvents();
    } catch (err) {
      showToast(err.response?.data?.message || 'CSV upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    showToast('Running Python Isolation Forest & Risk Analysis engine...');
    try {
      const res = await api.post('/events/analyze');
      showToast(`Analysis Complete! ${res.data.anomaliesDetected} anomalies detected.`);
      fetchEvents();
    } catch (err) {
      showToast(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const displayedEvents = filter === 'anomalies' 
    ? events.filter(e => e.isAnomaly || e.anomalyScore > 0.65)
    : events;

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
            <Radar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#07111F] tracking-tight">Security Events Console</h1>
              <span className="text-xs font-mono font-semibold bg-[#F1F3F5] text-[#344054] px-2.5 py-0.5 rounded border border-[#E2E8F0]">
                Isolation Forest ML
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              High-density security event telemetry, outlier inspection, and raw CSV log ingestion
            </p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 bg-[#07111F] hover:bg-[#0B1930] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <Cpu className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin text-amber-400' : 'text-blue-400'}`} />
          <span>{analyzing ? 'Scanning Outliers...' : 'Run Anomaly Scanner'}</span>
        </button>
      </div>

      {/* CSV Ingestion Panel */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <form onSubmit={handleFileUpload} className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <FileText className="w-5 h-5 text-[#667085]" />
            <div>
              <span className="text-xs font-bold text-[#07111F] block">Upload CSV Security Log Dataset</span>
              <span className="text-[11px] text-[#667085]">Standard schema: timestamp, source_ip, destination_ip, protocol, failed_logins, bytes_sent</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-xs text-[#667085] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#07111F] file:text-white hover:file:bg-[#0B1930] cursor-pointer"
            />
            <button
              type="submit"
              disabled={loading || !file}
              className="px-4 py-1.5 bg-white border border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#344054] rounded-md text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              Upload CSV
            </button>
          </div>
        </form>
      </div>

      {/* Events Console Table Section */}
      <div className="bg-white border border-[#E8ECF0] rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8ECF0] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#07111F]">Recorded Telemetry Events</h2>
            <span className="text-xs text-[#667085]">
              Showing {displayedEvents.length} events (Outliers flagged with Isolation Forest score &gt; 0.65)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F1F3F5] p-1 rounded-lg border border-[#E2E8F0]">
            <button
              onClick={() => setFilter('anomalies')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'anomalies' ? 'bg-white text-[#07111F] shadow-xs' : 'text-[#667085] hover:text-[#07111F]'
              }`}
            >
              Anomalies Only ({events.filter(e => e.isAnomaly || e.anomalyScore > 0.65).length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white text-[#07111F] shadow-xs' : 'text-[#667085] hover:text-[#07111F]'
              }`}
            >
              All Events ({events.length})
            </button>
          </div>
        </div>

        {/* Dense Table View */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8ECF0] text-[#667085] font-mono text-[11px] uppercase bg-[#FAFBFC]">
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Source IP</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Risk / Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {displayedEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#667085]">
                    No security events recorded. Click "Run Anomaly Scanner" or upload a log CSV.
                  </td>
                </tr>
              ) : (
                displayedEvents.map((ev, idx) => {
                  const score = ev.anomalyScore || 0.85;
                  const severity = ev.severity || 'HIGH';
                  const threatType = ev.threatType || ev.eventType || 'Suspicious Traffic';

                  return (
                    <tr 
                      key={ev.eventId || idx} 
                      onClick={() => {
                        setSelectedEvent(ev);
                        setDrawerOpen(true);
                      }}
                      className="hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3 font-mono text-[#667085]">
                        {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : '10:42:18'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadgeClass(severity)}`}>
                          {severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#07111F]">
                        {ev.sourceIP || ev.sourceIp || '192.168.1.100'}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#07111F] group-hover:text-[#1570EF] transition-colors">
                        {threatType}
                      </td>
                      <td className="py-3 px-3 text-[#344054]">
                        {ev.username || 'anonymous'}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#07111F]">
                        <div className="flex items-center gap-2">
                          <span>{score.toFixed(2)}</span>
                          <div className="w-14 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#D92D20]" 
                              style={{ width: `${score * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Drawer Overlay */}
      {drawerOpen && selectedEvent && (
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
                <div>
                  <h3 className="text-sm font-bold text-[#07111F]">Event Details Console</h3>
                  <span className="text-[11px] font-mono text-[#667085]">{selectedEvent.eventId || 'EVT-84721'}</span>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-[#667085] hover:text-[#07111F]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">Timestamp</span>
                  <span className="font-mono text-[#344054]">
                    {selectedEvent.timestamp ? new Date(selectedEvent.timestamp).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">Source IP</span>
                  <span className="font-mono font-bold text-[#07111F]">{selectedEvent.sourceIP || selectedEvent.sourceIp || '192.168.1.100'}</span>
                </div>
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">Destination IP</span>
                  <span className="font-mono font-bold text-[#07111F]">{selectedEvent.destinationIP || selectedEvent.destinationIp || '10.0.0.1'}</span>
                </div>
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">Event Type</span>
                  <span className="font-semibold text-[#07111F]">{selectedEvent.eventType || selectedEvent.threatType || 'Network Traffic'}</span>
                </div>
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">ML Anomaly Score</span>
                  <span className="font-mono font-bold text-[#D92D20]">{(selectedEvent.anomalyScore || 0.85).toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[#667085] font-mono text-[11px] block uppercase">Raw Telemetry Event Data</span>
                  <pre className="text-[11px] font-mono text-[#344054] bg-[#FAFBFC] p-3 rounded-lg border border-[#E8ECF0] mt-1 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full py-2 bg-[#07111F] text-white text-xs font-semibold rounded-lg mt-6"
            >
              Close Event Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
