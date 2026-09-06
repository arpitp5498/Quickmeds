// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * Demo API Client Services
 * File: client/src/demo/demoApi.js
 */

import api from '../services/api';

export const isDemoModeEnabled = () => {
  // 1. URL Query parameter override (?demo=true, ?demo=1, ?demo=false, ?demo=0)
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    if (params.has('demo')) {
      const val = params.get('demo');
      if (val === 'false' || val === '0' || val === 'off') {
        try { localStorage.setItem('ENABLE_DEMO_MODE', 'false'); } catch (e) {}
        return false;
      }
      if (val === 'true' || val === '1' || val === 'on') {
        try { localStorage.setItem('ENABLE_DEMO_MODE', 'true'); } catch (e) {}
        return true;
      }
    }
    // 2. LocalStorage override
    try {
      const stored = localStorage.getItem('ENABLE_DEMO_MODE');
      if (stored === 'false') return false;
      if (stored === 'true') return true;
    } catch (e) {}
  }
  // 3. Environment variable fallback (default to enabled unless explicitly set to 'false')
  return import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false';
};

export const fetchDemoStatus = async () => {
  return await api.get('/demo/status');
};

export const fetchDemoSession = async (role = 'CUSTOMER') => {
  return await api.post('/demo/session', { role });
};

export const triggerRejectionAndReroute = async () => {
  return await api.post('/demo/reject-and-reroute');
};

export const resetDemoState = async () => {
  return await api.post('/demo/reset');
};
