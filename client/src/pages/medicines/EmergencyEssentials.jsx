import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, ShieldCheck } from 'lucide-react';
import EmergencyEssentialsSection from '../../components/emergency/EmergencyEssentialsSection';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const EmergencyEssentials = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Top Back Nav */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main Essentials Section */}
      <EmergencyEssentialsSection
        initialLimit={20}
        showViewAll={false}
        title="SOS — Emergency Essentials"
        subtitle="Curated access to commonly searched emergency medicines, first aid, and acute relief supplies across QuickMeds' verified pharmacy network."
      />
    </div>
  );
};

export default EmergencyEssentials;
