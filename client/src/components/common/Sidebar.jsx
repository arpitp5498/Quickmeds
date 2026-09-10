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
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role = 'CUSTOMER', mobileOpen = false, onClose = () => {} }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
          { to: '/admin/pharmacies', label: 'Verify Pharmacies', icon: Store },
          { to: '/admin/users', label: 'User Directory', icon: Users },
          { to: '/admin/orders', label: 'Order Monitor', icon: ShoppingBag },
          { to: '/admin/prescriptions', label: 'Prescription Queue', icon: FileText },
          { to: '/admin/analytics', label: 'Analytics & Trends', icon: BarChart3 },
          { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText }
        ];
      case 'PHARMACY':
        return [
          { to: '/pharmacy', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/pharmacy/orders', label: 'Live Orders', icon: ShoppingBag },
          { to: '/pharmacy/prescriptions', label: 'Prescription Review', icon: FileText },
          { to: '/pharmacy/inventory', label: 'Stock & Pricing', icon: Boxes },
          { to: '/pharmacy/profile', label: 'Pharmacy Profile', icon: Store }
        ];
      case 'DELIVERY_PARTNER':
        return [
          { to: '/delivery', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/delivery/active', label: 'Active Delivery', icon: Bike },
          { to: '/delivery/history', label: 'Delivery History', icon: ScrollText },
          { to: '/delivery/profile', label: 'Rider Profile', icon: UserCheck }
        ];
      case 'CUSTOMER':
      default:
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/emergency', label: 'Emergency Essentials', icon: Zap },
          { to: '/orders', label: 'My Orders', icon: ShoppingBag },
          { to: '/reminders', label: 'Medicine Reminders', icon: Pill },
          { to: '/cycle-tracker', label: 'Cycle Tracker & SOS', icon: Heart },
          { to: '/prescriptions', label: 'My Prescriptions', icon: FileText },
          { to: '/addresses', label: 'Saved Addresses', icon: MapPin },
          { to: '/profile', label: 'Account Profile', icon: Settings }
        ];
    }
  };

  const links = getLinks();

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
          padding: '1.5rem 1rem'
        }}
        className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div>
          <div style={{ padding: '0 0.5rem 1.25rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {links.map((link) => {
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
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                    color: isActive ? 'var(--primary-700)' : 'var(--text-main)',
                    transition: 'all var(--transition-fast)'
                  })}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span className="sidebar-link-text">{link.label}</span>
                </NavLink>
              );
            })}
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
