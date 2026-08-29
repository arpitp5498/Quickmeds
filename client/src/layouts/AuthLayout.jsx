import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Pill } from 'lucide-react';
import EmergencyBanner from '../components/common/EmergencyBanner';

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <EmergencyBanner />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem'
        }}
      >
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Pill size={24} strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--primary-600)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              QuickMeds
            </span>
          </Link>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Urgent Medicines. Nearby Pharmacies. Faster Access.
          </p>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-light)'
          }}
          className="animate-fade-in"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
