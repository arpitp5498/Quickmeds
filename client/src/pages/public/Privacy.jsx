import React from 'react';

const Privacy = () => {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '850px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Privacy & Data Policy</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
        <p>
          At QuickMeds, patient medical privacy and data security are fundamental. We implement industry-grade
          encryption for all personal health information and prescription files.
        </p>
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700 }}>Data Collection & Usage</h3>
        <p>
          We collect account details (name, email, mobile phone) and geolocation exclusively to match you
          with nearby pharmacies and route deliveries. Prescription uploads are shared only with the
          participating dispensing pharmacist and are never sold to advertisers.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
