// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * Demo API Client Services
 * File: client/src/demo/demoApi.js
 */

import api from '../services/api';

export const isDemoModeEnabled = () => {
  return import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
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
