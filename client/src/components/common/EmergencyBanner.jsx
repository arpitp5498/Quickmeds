import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

const EmergencyBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      role="region"
      aria-label="Medical emergency advisory"
      style={{
        backgroundColor: '#fff1f2',
        color: '#9f1239',
        borderBottom: '1px solid #fecdd3',
        padding: '6px 1rem',
        fontSize: '0.8125rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 90
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto',
          textAlign: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <AlertTriangle size={15} color="#e11d48" />
          Medical Emergency Advisory:
        </span>
        <span>
          QuickMeds is a hyperlocal pharmacy marketplace. In life-threatening emergencies, call{' '}
          <strong>112</strong> or <strong>102</strong> (Ambulance) immediately.
        </span>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#be123c',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center'
        }}
        aria-label="Dismiss banner"
      >
        <X size={14} />
      </button>
    </aside>
  );
};

export default EmergencyBanner;
