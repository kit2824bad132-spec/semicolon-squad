import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cyberai_token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', icon: 'check_circle' });
  const [autoResponseMode, setAutoResponseMode] = useState(false);

  const showToast = (message, icon = 'check_circle') => {
    setToast({ visible: true, message, icon });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  };

  useEffect(() => {
    const initAuth = async () => {
      // Check if arriving from Google OAuth redirect with ?code=
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        try {
          const res = await api.post('/auth/google', {
            code,
            redirectUri: window.location.origin + '/dashboard'
          });
          const { token: newToken, user: userData } = res.data;
          localStorage.setItem('cyberai_token', newToken);
          setToken(newToken);
          setUser(userData);
          window.history.replaceState({}, document.title, window.location.pathname);
          showToast(`Welcome ${userData.name}! Authenticated via Google OAuth.`, 'verified');
          setLoading(false);
          return;
        } catch (err) {
          console.error('Google code exchange failed', err);
          showToast('Google OAuth authorization code exchange failed.', 'error');
        }
      }

      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const launchGoogleRedirect = async () => {
    try {
      const res = await api.get('/auth/google/url');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      showToast('Failed to initialize Google redirect flow.', 'error');
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('cyberai_token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast(`Welcome back, ${userData.name}! SOC Session Authenticated.`, 'verified');
      return { success: true };
    } catch (err) {
      // Fallback demo login if server endpoint unreachable
      if (email === 'admin@cyberai.com' && password === 'admin123') {
        const dummyToken = 'demo_jwt_token_2026';
        const dummyUser = { name: 'SOC Chief Analyst', email: 'admin@cyberai.com', role: 'Administrator / SOC Director' };
        localStorage.setItem('cyberai_token', dummyToken);
        setToken(dummyToken);
        setUser(dummyUser);
        showToast('Authenticated via Demo Administrator Mode', 'verified');
        return { success: true };
      }
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const res = await api.post('/auth/google', { credential });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('cyberai_token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast(`Welcome ${userData.name}! Authenticated via Google OAuth.`, 'verified');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed. Please try again.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('cyberai_token');
    setToken(null);
    setUser(null);
    showToast('Logged out of SOC Platform', 'logout');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      loginWithGoogle,
      launchGoogleRedirect,
      logout,
      toast,
      showToast,
      autoResponseMode,
      setAutoResponseMode,
      systemMode: '● SYSTEM ONLINE | SIMULATION MODE'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
