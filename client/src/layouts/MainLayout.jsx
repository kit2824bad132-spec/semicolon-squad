import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CyberLogo } from '../components/common/CyberLogo';
import { 
  Shield, 
  Search, 
  Bell, 
  Command, 
  ChevronDown, 
  Menu, 
  X, 
  LogOut, 
  Radio, 
  Activity, 
  AlertTriangle, 
  BrainCircuit, 
  Cpu, 
  FileText, 
  Settings as SettingsIcon,
  Calendar,
  Layers,
  Users,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout, toast, showToast } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchVal, setSearchVal] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Last 24 Hours');

  // Command palette hotkey (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'SOC Overview', path: '/dashboard', icon: Activity },
      ]
    },
    {
      title: 'MONITOR',
      items: [
        { label: 'Events Console', path: '/threats', icon: Radio },
        { label: 'Active Alerts', path: '/incidents', icon: AlertTriangle, badge: '4' },
        { label: 'Threat Signatures', path: '/intelligence', icon: Shield },
      ]
    },
    {
      title: 'INVESTIGATE',
      items: [
        { label: 'Incidents Queue', path: '/incidents', icon: AlertTriangle },
        { label: 'Attack Timeline', path: '/investigation', icon: BrainCircuit },
        { label: 'Autonomous Response', path: '/response', icon: Cpu, badge: 'Sandbox' },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { label: 'Threat Intelligence', path: '/intelligence', icon: Layers },
        { label: 'Security Assistant', path: '/assistant', icon: BrainCircuit },
      ]
    },
    {
      title: 'REPORTING',
      items: [
        { label: 'Executive Reports', path: '/reports', icon: FileText },
        { label: 'Audit Logs', path: '/reports', icon: Clock },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Users & Access', path: '/settings', icon: Users },
        { label: 'System Settings', path: '/settings', icon: SettingsIcon },
      ]
    }
  ];

  // Derive dynamic breadcrumb & page title
  const getBreadcrumbs = () => {
    const p = location.pathname;
    if (p.includes('/threats')) return { section: 'Monitor', title: 'Events Console' };
    if (p.includes('/incidents/')) return { section: 'Investigate', title: 'Incident Detail' };
    if (p.includes('/incidents')) return { section: 'Investigate', title: 'Incidents Queue' };
    if (p.includes('/investigation')) return { section: 'Investigate', title: 'Attack Timeline & Sequence' };
    if (p.includes('/response')) return { section: 'Investigate', title: 'Autonomous Containment Playbooks' };
    if (p.includes('/intelligence')) return { section: 'Intelligence', title: 'Threat Intelligence & Risk' };
    if (p.includes('/reports')) return { section: 'Reporting', title: 'Executive Audit Reports' };
    if (p.includes('/assistant')) return { section: 'Intelligence', title: 'Security Operations Assistant' };
    if (p.includes('/settings')) return { section: 'System', title: 'System Security Settings' };
    return { section: 'Overview', title: 'Security Operations Center' };
  };

  const breadcrumb = getBreadcrumbs();

  const commandShortcuts = [
    { label: 'Go to SOC Overview', path: '/dashboard', category: 'Navigation' },
    { label: 'Investigate INC-1001: SSH Brute Force Credential Attack', path: '/incidents/INC-1001', category: 'Incidents' },
    { label: 'Investigate INC-1003: Critical Privilege Escalation', path: '/incidents/INC-1003', category: 'Incidents' },
    { label: 'Open Autonomous Response Sandbox', path: '/response', category: 'Containment' },
    { label: 'Consult Security Assistant', path: '/assistant', category: 'Intelligence' },
    { label: 'Generate Executive Audit Report', path: '/reports', category: 'Reporting' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1930] flex flex-col relative selection:bg-[#07111F] selection:text-white">
      {/* Toast Notification Container */}
      <div 
        id="toastNotification" 
        className={`fixed top-5 right-5 z-[9999] pointer-events-none transition-all duration-300 transform flex items-center gap-3 bg-[#07111F] text-white px-4 py-3 rounded-lg border border-white/10 shadow-2xl ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-[-20px] opacity-0'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-xs font-medium tracking-wide">{toast.message}</span>
      </div>

      {/* 1. GLOBAL HEADER */}
      <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-[#FFFFFF] border-b border-[#E8ECF0] px-4 lg:px-6 flex items-center justify-between shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 text-[#64748B] hover:text-[#0B1930] rounded-md hover:bg-black/5"
            title="Toggle Menu"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Breadcrumb & Title */}
          <div className="hidden sm:flex flex-col text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#667085]">
              <span>{breadcrumb.section}</span>
              <span>/</span>
              <span className="text-[#07111F] font-semibold">{breadcrumb.title}</span>
            </div>
            <h2 className="text-xs font-semibold text-[#07111F] leading-none mt-0.5">
              {breadcrumb.title}
            </h2>
          </div>
        </div>

        {/* Center: Professional Security Command Search */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between bg-[#FAFBFC] hover:bg-white border border-[#E2E8F0] rounded-md px-3 py-1.5 text-xs text-[#667085] shadow-xs transition-all hover:border-[#CBD5E1]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[#64748B] font-normal">Search events, incidents, IPs, hosts, users...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[#475569] bg-[#F1F5F9] rounded border border-[#CBD5E1]">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Period Filter, Simulation Badge & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Time Filter */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-2.5 py-1 text-xs text-[#334155]">
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
            <select 
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                showToast(`Filter: ${e.target.value}`);
              }}
              className="bg-transparent border-none outline-none text-xs font-medium text-[#0F172A] cursor-pointer"
            >
              <option value="Last 24 Hours">Last 24 Hours</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {/* System Mode Indicator */}
          <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>● SYSTEM ONLINE | SIMULATION MODE</span>
          </div>

          {/* Notifications */}
          <button 
            onClick={() => showToast('SOC Telemetry active. 0 unhandled breaches.')}
            className="relative p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
            <img 
              src={user?.avatar || user?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={user?.name || "User"}
              className="w-7 h-7 rounded-full object-cover border border-[#CBD5E1]" 
            />
            <div className="hidden lg:flex flex-col text-left leading-none">
              <span className="text-xs font-semibold text-[#07111F] truncate max-w-[110px]">{user?.name || 'SOC Analyst'}</span>
              <span className="text-[10px] text-[#64748B] truncate max-w-[110px] mt-0.5">{user?.role || 'Security Operations'}</span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-[#94A3B8] hover:text-red-600 p-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY WRAPPER: SIDEBAR + MAIN WORKSPACE */}
      <div className="flex pt-14 min-h-screen">
        {/* PERSISTENT DEEP NAVY SIDEBAR (#07111F) */}
        <aside 
          className={`fixed top-14 bottom-0 left-0 z-30 w-60 bg-[#07111F] text-white flex flex-col justify-between transition-transform duration-200 border-r border-white/10 lg:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Top: Brand & Workspace Selector */}
          <div className="p-3.5 flex flex-col gap-3">
            {/* Logo */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-2 py-1.5 cursor-pointer rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <CyberLogo size="md" variant="dark" title="CYBERAI SOC" subtitle="ENTERPRISE PLATFORM" />
            </div>

            {/* Navigation Groups */}
            <nav className="flex flex-col gap-4 mt-2 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
              {navSections.map((section, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 px-3 uppercase mb-1">
                    {section.title}
                  </span>
                  {section.items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={`${item.path}-${i}`}
                        to={item.path}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-white/10 text-white font-semibold border-l-2 border-blue-500 pl-2.5'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-white" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Sidebar Footer */}
          <div className="p-3 border-t border-white/10 bg-black/30 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
              <span className="text-[11px] font-mono text-slate-300 truncate">Production Node 01</span>
            </div>
          </div>
        </aside>

        {/* 3. MAIN WORKSPACE (Light-first white material system) */}
        <main className="flex-1 lg:ml-60 w-full min-h-[calc(100vh-56px)] bg-[#F7F8FA] p-4 lg:p-6 overflow-x-hidden flex flex-col justify-between">
          <div className="w-full flex-1 max-w-7xl mx-auto">
            <Outlet />
          </div>

          {/* Enterprise Footer */}
          <footer className="w-full py-4 mt-12 border-t border-[#E8ECF0] text-xs text-[#667085]">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#07111F]">CyberAI Platform</span>
                <span>— Security Operations Center</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
                <span>SOC-2 Type II</span>
                <span>ISO 27001</span>
                <span className="font-mono text-emerald-700">● Status: Normal</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* 4. COMMAND PALETTE MODAL (⌘K) */}
      {isCommandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/30 backdrop-blur-xs"
          onClick={() => setIsCommandPaletteOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#CBD5E1] p-3 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] pb-2.5 px-2">
              <Search className="w-4 h-4 text-[#475569]" />
              <input 
                autoFocus
                type="text"
                placeholder="Search incidents, IPs, alerts, hosts, reports..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
              />
              <kbd className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded border border-[#CBD5E1]">
                ESC
              </kbd>
            </div>

            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto py-1">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase px-2 mb-1">
                Quick Navigation & Commands
              </span>
              {commandShortcuts
                .filter(item => item.label.toLowerCase().includes(searchVal.toLowerCase()) || item.category.toLowerCase().includes(searchVal.toLowerCase()))
                .map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsCommandPaletteOpen(false);
                      navigate(item.path);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-left"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {item.category}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
