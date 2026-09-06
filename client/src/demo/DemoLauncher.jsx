// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * QuickMeds Demo Role Tab Launcher Bridge
 * File: client/src/demo/DemoLauncher.jsx
 *
 * Sets the tab-isolated sessionStorage credentials for the chosen role
 * and immediately redirects to the authentic production page.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDemoSession } from './demoApi';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

const DemoLauncher = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { setDemoSession } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const launchSession = async () => {
      try {
        let backendRole = 'CUSTOMER';
        const normalized = (role || '').toLowerCase();
        if (normalized === 'pharmacy' || normalized === 'pharmacy1') {
          backendRole = 'PHARMACY_A';
        } else if (normalized === 'pharmacy2' || normalized === 'pharmacy_b') {
          backendRole = 'PHARMACY_B';
        } else if (normalized === 'rider' || normalized === 'delivery') {
          backendRole = 'RIDER';
        }

        const res = await fetchDemoSession(backendRole);
        if (res.success && res.data) {
          const { user, token, demoOrderId } = res.data;

          // Activate tab-isolated credentials
          setDemoSession(user, token);

          // Route to authentic production page
          if (backendRole === 'CUSTOMER') {
            navigate(demoOrderId ? `/orders/${demoOrderId}` : '/orders');
          } else if (backendRole === 'PHARMACY_A' || backendRole === 'PHARMACY_B') {
            navigate(demoOrderId ? `/pharmacy/orders/${demoOrderId}` : '/pharmacy/orders');
          } else if (backendRole === 'RIDER') {
            navigate('/delivery/active');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError(res.message || 'Failed to initialize demo session');
        }
      } catch (err) {
        setError(err.message || 'Error connecting to demo launcher');
      }
    };

    launchSession();
  }, [role, navigate, setDemoSession]);

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--danger-600)' }}>Demo Launcher Error</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '1.5rem',
            padding: '8px 16px',
            backgroundColor: 'var(--primary-600)',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Return to QuickMeds Home
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        gap: '16px'
      }}
    >
      <Spinner size="lg" />
      <p style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
        Initializing Scoped Demo Session for {role?.toUpperCase()}...
      </p>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        Connecting to QuickMeds authentic realtime pipeline...
      </span>
    </div>
  );
};

export default DemoLauncher;
