import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import EmergencyBanner from '../components/common/EmergencyBanner';

export default function DashboardLayout() {
  return (
    <>
      <a href="#main-content" className="qm-skip">Skip to content</a>
      <EmergencyBanner />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="container qm-customer-page">
        <React.Suspense fallback={<p className="route-loading" role="status">Loading page…</p>}><Outlet /></React.Suspense>
      </main>
    </>
  );
}
