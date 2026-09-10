import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import EmergencyBanner from '../components/common/EmergencyBanner';

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: '100%' }}>
      <EmergencyBanner />
      <Navbar />
      <div style={{ display: 'flex', flex: 1, width: '100%', minWidth: 0 }}>
        <Sidebar
          role="CUSTOMER"
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            backgroundColor: 'var(--bg-main)'
          }}
          className="dashboard-main-area"
        >
          {/* Mobile Portal Navigation Bar */}
          <div className="dashboard-mobile-bar">
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>👤</span>
              <span>Customer Portal</span>
            </span>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-700)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid var(--primary-200)',
                cursor: 'pointer'
              }}
            >
              <span>Menu</span>
              <span style={{ fontSize: '1rem' }}>☰</span>
            </button>
          </div>

          <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', minWidth: 0 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
