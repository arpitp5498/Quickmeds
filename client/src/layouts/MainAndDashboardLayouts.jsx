import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import EmergencyBanner from '../components/common/EmergencyBanner';

export const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <EmergencyBanner />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const DashboardLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <EmergencyBanner />
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="CUSTOMER" />
        <main
          style={{
            flex: 1,
            padding: '2rem',
            backgroundColor: 'var(--bg-main)',
            maxWidth: 'calc(100vw - var(--sidebar-width))',
            overflowX: 'hidden'
          }}
          className="dashboard-content-area"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
