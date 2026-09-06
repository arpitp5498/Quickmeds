import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // SIH DEMO MODE ONLY: Check tab-isolated demo session user
    const demoUser = sessionStorage.getItem('quickmeds_demo_user');
    if (demoUser) {
      try {
        return JSON.parse(demoUser);
      } catch (e) {
        // Fallback to localStorage
      }
    }
    const saved = localStorage.getItem('quickmeds_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    // SIH DEMO MODE ONLY: Check tab-isolated demo session token
    return sessionStorage.getItem('quickmeds_demo_token') || localStorage.getItem('quickmeds_token') || null;
  });
  const [loading, setLoading] = useState(true);

  // Validate active token on initial load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data.user) {
            setUser(res.data.user);
            if (sessionStorage.getItem('quickmeds_demo_token')) {
              sessionStorage.setItem('quickmeds_demo_user', JSON.stringify(res.data.user));
            } else {
              localStorage.setItem('quickmeds_user', JSON.stringify(res.data.user));
            }
          }
        } catch (error) {
          console.warn('Session verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { user: userData, token: jwtToken } = res.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('quickmeds_token', jwtToken);
      localStorage.setItem('quickmeds_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success && res.data) {
      const { user: userData, token: jwtToken } = res.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('quickmeds_token', jwtToken);
      localStorage.setItem('quickmeds_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('quickmeds_demo_token');
    sessionStorage.removeItem('quickmeds_demo_user');
    localStorage.removeItem('quickmeds_token');
    localStorage.removeItem('quickmeds_user');
  };

  // SIH DEMO MODE ONLY: Directly activate tab-scoped demo credentials
  const setDemoSession = (demoUserData, demoJwtToken) => {
    sessionStorage.setItem('quickmeds_demo_user', JSON.stringify(demoUserData));
    sessionStorage.setItem('quickmeds_demo_token', demoJwtToken);
    setUser(demoUserData);
    setToken(demoJwtToken);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('quickmeds_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.message || 'Update failed');
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isPharmacy = user?.role === 'PHARMACY';
  const isDelivery = user?.role === 'DELIVERY_PARTNER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role || 'GUEST',
        isCustomer,
        isPharmacy,
        isDelivery,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        setDemoSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
