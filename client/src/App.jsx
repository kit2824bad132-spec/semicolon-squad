import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ThreatDetection from './pages/ThreatDetection';
import Incidents from './pages/Incidents';
import IncidentDetails from './pages/IncidentDetails';
import AIInvestigation from './pages/AIInvestigation';
import AutonomousResponse from './pages/AutonomousResponse';
import SecurityIntelligence from './pages/SecurityIntelligence';
import Reports from './pages/Reports';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">cyclone</span>
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="threats" element={<ThreatDetection />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="incidents/:id" element={<IncidentDetails />} />
            <Route path="investigation" element={<AIInvestigation />} />
            <Route path="response" element={<AutonomousResponse />} />
            <Route path="intelligence" element={<SecurityIntelligence />} />
            <Route path="reports" element={<Reports />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}
