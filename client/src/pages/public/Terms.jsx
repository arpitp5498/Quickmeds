import React from 'react';

const Terms = () => {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '850px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Terms of Service</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
        <p>
          By using QuickMeds, you agree to these Terms. QuickMeds serves as an intermediary communication platform
          connecting patients, licensed retail chemists, and independent delivery executives.
        </p>
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700 }}>Orders & Cancellation</h3>
        <p>
          Customers may cancel orders while in the 'PLACED' or 'PHARMACY_REVIEW' state. Once medicines are
          dispensed and verified by the pharmacist, orders cannot be cancelled to preserve pharmaceutical safety standards.
        </p>
      </div>
    </div>
  );
};

export default Terms;
