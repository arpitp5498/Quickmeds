import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  FileText,
  Boxes,
  Users,
  BarChart3,
  ScrollText,
  MapPin,
  Bike,
  LogOut,
  UserCheck,
  Activity,
  Settings,
  Pill,
  Heart,
  Zap,
  X,
  Stethoscope,
  TestTubes,
  ClipboardList,
  CalendarCheck,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role = 'CUSTOMER', mobileOpen = false, onClose = () => {} }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getGroupedLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          {
            section: 'Platform Overview',
            items: [
              { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
              { to: '/admin/analytics', label: 'Analytics & Trends', icon: BarChart3 }
            ]
          },
          {
            section: 'Healthcare & Partners',
            items: [
              { to: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
              { to: '/admin/pharmacies', label: 'Verify Pharmacies', icon: Store },
              { to: '/admin/users', label: 'User Directory', icon: Users }
            ]
          },
          {
            section: 'Operations & Audit',
            items: [
              { to: '/admin/orders', label: 'Order Monitor', icon: ShoppingBag },
              { to: '/admin/prescriptions', label: 'Prescription Queue', icon: FileText },
              { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText }
            ]
          }
        ];
      case 'DOCTOR':
        return [
          {
            section: 'Practice Portal',
            items: [
              { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, end: true },
              { to: '/doctor/appointments', label: 'My Appointments', icon: CalendarCheck },
              { to: '/doctor/patients', label: 'My Patients', icon: Users },
              { to: '/doctor/profile', label: 'Doctor Profile', icon: UserCircle }
            ]
          }
        ];
      case 'PHARMACY':
        return [
          {
            section: 'Fulfillment Portal',
            items: [
              { to: '/pharmacy', label: 'Dashboard', icon: LayoutDashboard, end: true },
              { to: '/pharmacy/orders', label: 'Live Orders', icon: ShoppingBag },
              { to: '/pharmacy/prescriptions', label: 'Prescription Review', icon: FileText },
              { to: '/pharmacy/inventory', label: 'Stock & Pricing', icon: Boxes },
              { to: '/pharmacy/profile', label: 'Pharmacy Profile', icon: Store }
            ]
          }
        ];
      case 'DELIVERY_PARTNER':
        return [
          {
            section: 'Rider Portal',
            items: [
              { to: '/delivery', label: 'Dashboard', icon: LayoutDashboard, end: true },
              { to: '/delivery/active', label: 'Active Delivery', icon: Bike },
              { to: '/delivery/history', label: 'Delivery History', icon: ScrollText },
              { to: '/delivery/profile', label: 'Rider Profile', icon: UserCheck }
            ]
          }
        ];
      case 'CUSTOMER':
      default:
        return [
          {
            section: 'Overview',
            items: [
              { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }
            ]
          },
          {
            section: 'Clinical Care',
            items: [
              { to: '/doctors', label: 'Consult Doctor', icon: Stethoscope },
              { to: '/lab-tests', label: 'Lab Tests at Home', icon: TestTubes },
              { to: '/health-records', label: 'Health Records', icon: ClipboardList },
              { to: '/prescriptions', label: 'My Prescriptions', icon: FileText }
            ]
          },
          {
            section: 'Orders & Essentials',
            items: [
              { to: '/orders', label: 'My Orders', icon: ShoppingBag },
              { to: '/emergency', label: 'SOS Essentials', icon: Zap },
              { to: '/reminders', label: 'Medicine Reminders', icon: Pill },
              { to: '/cycle-tracker', label: 'Cycle Tracker & SOS', icon: Heart }
            ]
          },
          {
            section: 'Settings',
            items: [
              { to: '/addresses', label: 'Saved Addresses', icon: MapPin },
              { to: '/profile', label: 'Account Profile', icon: Settings }
            ]
          }
        ];
    }
  };

  const linkGroups = getGroupedLinks();

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRight: '1px solid var(--border-light)',
          minHeight: 'calc(100vh - var(--navbar-height))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem 0.75rem'
        }}
        className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div>
          <div style={{ padding: '0 0.5rem 1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {role.replace('_', ' ')} PORTAL
              </span>
              {mobileOpen && (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '4px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  aria-label="Close sidebar"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <p className="sidebar-user-info" style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {user?.name}
            </p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {linkGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ marginBottom: '4px' }}>
                {group.section && (
                  <span
                    className="sidebar-link-text"
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'block',
                      padding: '4px 10px 4px'
                    }}
                  >
                    {group.section}
                  </span>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {group.items.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        title={link.label}
                        onClick={onClose}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.84rem',
                          fontWeight: isActive ? 600 : 500,
                          backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                          color: isActive ? 'var(--primary-700)' : 'var(--text-main)',
                          borderLeft: isActive ? '3px solid var(--primary-600)' : '3px solid transparent',
                          textDecoration: 'none',
                          transition: 'all var(--transition-fast)'
                        })}
                      >
                        <Icon size={17} style={{ flexShrink: 0 }} />
                        <span className="sidebar-link-text">{link.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--accent-600)',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <span className="sidebar-link-text">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
