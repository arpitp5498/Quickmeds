import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token (checks tab-isolated demo token first)
api.interceptors.request.use(
  (config) => {
    // SIH DEMO MODE ONLY: Support tab-isolated demo sessions without collisions
    const demoToken = sessionStorage.getItem('quickmeds_demo_token');
    const token = demoToken || localStorage.getItem('quickmeds_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract response data and handle 401 token expiry
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // If 401 Unauthorized and not already on /login, purge stale token
      if (error.response.status === 401) {
        // Clear demo session if active in this tab
        sessionStorage.removeItem('quickmeds_demo_token');
        sessionStorage.removeItem('quickmeds_demo_user');

        const isAuthRoute =
          window.location.pathname === '/login' || window.location.pathname === '/register';
        if (!isAuthRoute && localStorage.getItem('quickmeds_token')) {
          localStorage.removeItem('quickmeds_token');
          localStorage.removeItem('quickmeds_user');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data || { message: error.message });
    }
    return Promise.reject({ message: 'Network error or server unreachable.' });
  }
);

export default api;
