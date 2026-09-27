import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Phone, Car, HeartPulse, Stethoscope } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AmbulanceAssistance = () => {
  const [location, setLocation] = useState('Detecting location...');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
        () => setLocation('Location access denied. Please enter manually.')
      );
    }
  }, []);

  const handleRequest = async (type) => {
    setLoading(true);
    try {
      await api.post('/ambulance/request', { type, location, description });
      alert(`${type} Ambulance requested successfully. They will contact you shortly.`);
    } catch (error) {
      alert(`Mock Request Sent for ${type} Ambulance (API pending)`);
    } finally {
      setLoading(false);
    }
  };

  const directDials = [
    { number: '112', label: 'National Emergency', color: '#e11d48' },
    { number: '108', label: 'Ambulance', color: '#0284c7' },
    { number: '102', label: 'Pregnancy/Women', color: '#db2777' },
    { number: '1091', label: 'Women Helpline', color: '#9333ea' }
  ];

  const ambulanceTypes = [
    { type: 'BLS (Basic Life Support)', desc: 'For stable patients requiring basic medical monitoring during transit.', icon: Car },
    { type: 'ALS (Advanced Life Support)', desc: 'Equipped with ECG, ventilator, and trained paramedics for critical care.', icon: HeartPulse },
    { type: 'ICU Mobile', desc: 'Fully equipped mobile intensive care unit with a doctor on board.', icon: Stethoscope }
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      
      {/* Warning Header */}
      <div style={{ backgroundColor: '#fff1f2', border: '2px solid #e11d48', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#e11d48" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#be123c', marginBottom: '0.5rem' }}>MEDICAL EMERGENCY</h1>
        <p style={{ fontSize: '1.125rem', color: '#9f1239', fontWeight: 600 }}>For life-threatening emergencies, CALL 112 IMMEDIATELY.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Request Form */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Request an Ambulance</h2>
          
          <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Current Location</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                <MapPin size={18} color="var(--primary-600)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{location}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Emergency Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3} 
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} 
                placeholder="E.g., Heart attack symptoms, severe accident..."
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ambulanceTypes.map((amb, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'var(--primary-100)', borderRadius: '50%', color: 'var(--primary-600)' }}>
                      <amb.icon size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '2px' }}>{amb.type}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px' }}>{amb.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleRequest(amb.type)} disabled={loading}>Request</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Direct Dials */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Quick Dial Emergency Numbers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {directDials.map((dial, idx) => (
              <a 
                key={idx} 
                href={`tel:${dial.number}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: dial.color + '15', border: `1px solid ${dial.color}40`, borderRadius: 'var(--radius-lg)', textDecoration: 'none', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: dial.color, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: `0 4px 12px ${dial.color}40` }}>
                  <Phone size={24} />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: dial.color, marginBottom: '4px' }}>{dial.number}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>{dial.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceAssistance;
