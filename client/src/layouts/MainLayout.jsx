import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import EmergencyBanner from '../components/common/EmergencyBanner';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="qm-skip">Skip to content</a>
      <EmergencyBanner />
      <Navbar />
      <main id="main-content" tabIndex={-1} style={{ flex: 1 }}>
        <React.Suspense fallback={<p className="route-loading" role="status">Loading page…</p>}><Outlet /></React.Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
