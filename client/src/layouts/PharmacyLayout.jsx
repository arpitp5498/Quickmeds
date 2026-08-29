import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import EmergencyBanner from '../components/common/EmergencyBanner';

const PharmacyLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <EmergencyBanner />
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="PHARMACY" />
        <main
          style={{
            flex: 1,
            padding: '2rem',
            backgroundColor: 'var(--bg-main)',
            overflowX: 'hidden'
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PharmacyLayout;
