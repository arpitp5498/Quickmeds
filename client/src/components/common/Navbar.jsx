import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  Sun,
  Moon,
  Menu,
  X,
  FileText,
  Search,
  Store,
  Map,
  Pill,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Cpu,
  ShieldCheck,
  BarChart3,
  Zap,
  Smartphone,
  Stethoscope,
  TestTubes,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import LocationPicker from './LocationPicker';
import NotificationBell from './NotificationBell';
import AppDownloadModal from './AppDownloadModal';



const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isPharmacy, isDelivery, isAdmin, isDoctor, logout } = useAuth();
  const { cart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isDoctor) return '/doctor';
    if (isPharmacy) return '/pharmacy';
    if (isDelivery) return '/delivery';
    return '/dashboard';
  };

  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkStyle = (path) => {
    const active = isLinkActive(path);
    return {
      fontSize: '0.875rem',
      fontWeight: active ? 600 : 500,
      color: active ? 'var(--primary-600)' : 'var(--text-main)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 10px',
      borderRadius: 'var(--radius-md)',
      backgroundColor: active ? 'var(--primary-50)' : 'transparent',
      textDecoration: 'none',
      transition: 'all var(--transition-fast)'
    };
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--navbar-height)',
          gap: '1rem'
        }}
      >
        {/* Brand Logo & Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              flexShrink: 0
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Pill size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--primary-600)',
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1
                }}
              >
                QuickMeds
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Healthcare Marketplace
              </span>
            </div>
          </Link>

          {/* Location Picker */}
          <div className="nav-location-desktop" style={{ display: 'flex' }}>
            <LocationPicker />
          </div>
        </div>

        {/* Center Primary Healthcare Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          className="desktop-nav-links"
        >
          <Link to="/medicines" style={navLinkStyle('/medicines')}>
            <Search size={15} />
            <span>Medicines</span>
          </Link>

          <Link to="/doctors" style={navLinkStyle('/doctors')}>
            <Stethoscope size={15} />
            <span>Consult Doctor</span>
          </Link>

          <Link to="/lab-tests" style={navLinkStyle('/lab-tests')}>
            <TestTubes size={15} />
            <span>Lab Tests</span>
          </Link>

          <Link to="/pharmacies" style={navLinkStyle('/pharmacies')}>
            <Store size={15} />
            <span>Pharmacies</span>
          </Link>

          <Link
            to="/emergency"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#e11d48',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Zap size={14} color="#e11d48" />
            <span>SOS</span>
          </Link>

          {isAuthenticated && isCustomer && (
            <Link to="/health-records" style={navLinkStyle('/health-records')}>
              <ClipboardList size={15} />
              <span>Records</span>
            </Link>
          )}
        </nav>

        {/* Right Actions: Cart, Notifications, Theme, Auth */}
        <div className="navbar-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>

          {/* Download App Button */}
          <button
            type="button"
            onClick={() => setAppModalOpen(true)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-main)',
              fontSize: '0.75rem',
              fontWeight: 700,
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="desktop-only-btn"
            title="Download QuickMeds Mobile App"
          >
            <Smartphone size={14} color="var(--primary-600)" />
            <span>App</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '7px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-subtle)'
            }}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Cart Button (Customer) */}
          {(!isAuthenticated || isCustomer) && (
            <Link
              to="/cart"
              style={{
                position: 'relative',
                padding: '7px',
                borderRadius: 'var(--radius-full)',
                color: cart.totalItems > 0 ? 'var(--primary-700)' : 'var(--text-muted)',
                backgroundColor: cart.totalItems > 0 ? 'var(--primary-50)' : 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)'
              }}
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShoppingBag size={18} />
                {cart.totalItems > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
                      backgroundColor: 'var(--primary-600)',
                      color: '#ffffff',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      lineHeight: 1
                    }}
                  >
                    {cart.totalItems}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile Dropdown or Login CTA */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-600)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }} className="desktop-username">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '210px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-light)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}
                  className="animate-fade-in"
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-subtle)'
                    }}
                  >
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {user?.name}
                    </p>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary-700)', textTransform: 'capitalize' }}>
                      {user?.role?.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>

                  <Link
                    to={getDashboardLink()}
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      fontSize: '0.8125rem',
                      color: 'var(--text-main)',
                      fontWeight: 500
                    }}
                  >
                    <LayoutDashboard size={15} />
                    <span>Dashboard</span>
                  </Link>

                  {isCustomer && (
                    <>
                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          fontSize: '0.8125rem',
                          color: 'var(--text-main)',
                          fontWeight: 500
                        }}
                      >
                        <ShoppingBag size={15} />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/health-records"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          fontSize: '0.8125rem',
                          color: 'var(--text-main)',
                          fontWeight: 500
                        }}
                      >
                        <ClipboardList size={15} />
                        <span>Health Records</span>
                      </Link>

                      <Link
                        to="/prescriptions"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          fontSize: '0.8125rem',
                          color: 'var(--text-main)',
                          fontWeight: 500
                        }}
                      >
                        <FileText size={15} />
                        <span>Prescriptions</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      fontSize: '0.8125rem',
                      color: 'var(--text-main)',
                      fontWeight: 500
                    }}
                  >
                    <User size={15} />
                    <span>Profile Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      fontSize: '0.8125rem',
                      color: 'var(--accent-600)',
                      borderTop: '1px solid var(--border-light)',
                      textAlign: 'left',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={15} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/login"
                className="nav-login-btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--primary-600)',
                  border: '1px solid var(--primary-600)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                Log In
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            className="mobile-hamburger-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Categorized Healthcare Navigation) */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: 'calc(100vh - var(--navbar-height))',
            overflowY: 'auto'
          }}
          className="mobile-drawer animate-fade-in"
        >
          <LocationPicker />

          {/* Clinical Care Section */}
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              Clinical Healthcare
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link
                to="/doctors"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
              >
                <Stethoscope size={17} color="var(--primary-600)" />
                <span>Consult Doctor</span>
              </Link>
              <Link
                to="/lab-tests"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
              >
                <TestTubes size={17} color="var(--primary-600)" />
                <span>Diagnostic Lab Tests</span>
              </Link>
              {isAuthenticated && isCustomer && (
                <Link
                  to="/health-records"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
                >
                  <ClipboardList size={17} color="var(--primary-600)" />
                  <span>My Health Records</span>
                </Link>
              )}
            </div>
          </div>

          {/* Pharmacy & Emergency Section */}
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              Pharmacy &amp; Medicines
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link
                to="/medicines"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
              >
                <Search size={17} />
                <span>Search Medicines</span>
              </Link>
              <Link
                to="/emergency"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px', fontSize: '0.9375rem', color: '#e11d48', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
              >
                <Zap size={17} />
                <span>SOS Emergency Essentials</span>
              </Link>
              <Link
                to="/pharmacies"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
              >
                <Store size={17} />
                <span>Nearby Pharmacies</span>
              </Link>
              <Link
                to="/pharmacy-network"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
              >
                <Map size={17} />
                <span>Pharmacy Network Map</span>
              </Link>
            </div>
          </div>

          {/* Account & Orders */}
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              My Account
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
              >
                <ShoppingBag size={17} />
                <span>Shopping Cart ({cart.totalItems})</span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--primary-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                  >
                    <LayoutDashboard size={17} />
                    <span>Go to Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--accent-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <LogOut size={17} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}
                >
                  Sign In to QuickMeds
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Download App Button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setAppModalOpen(true);
            }}
            style={{
              padding: '10px 14px',
              fontSize: '0.875rem',
              color: 'var(--primary-700)',
              fontWeight: 700,
              backgroundColor: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <Smartphone size={16} color="var(--primary-600)" />
            <span>Download QuickMeds App</span>
          </button>
        </div>
      )}

      {/* Download App Modal */}
      <AppDownloadModal
        isOpen={appModalOpen}
        onClose={() => setAppModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;
