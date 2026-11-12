import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Pill } from 'lucide-react';
import EmergencyBanner from '../components/common/EmergencyBanner';
import SOSLink from '../components/common/SOSLink';
import { useAssistant } from '../components/common/AIAssistantChat';

const AuthLayout = () => {
  const openAssistant = useAssistant();
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
      <header className="qm-auth-nav"><div className="container">
        <Link to="/" className="qm-wordmark" aria-label="QuickMeds home"><span className="qm-mark"><Pill size={21} /></span>QuickMeds</Link>
        <SOSLink />
      </div></header>
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
          <React.Suspense fallback={<p className="route-loading" role="status">Loading page…</p>}><Outlet /></React.Suspense>
        </div>
        <button type="button" style={{ marginTop: '1rem', minHeight: '44px', color: 'var(--text-muted)' }}
          onClick={event => openAssistant(event.currentTarget)}>Chat with QuickMeds</button>
      </div>
    </div>
  );
};

export default AuthLayout;
