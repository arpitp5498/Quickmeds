import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import LocationPicker from './LocationPicker';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isPharmacy, isDelivery, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isPharmacy) return '/pharmacy';
    if (isDelivery) return '/delivery';
    return '/dashboard';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Pill size={22} strokeWidth={2.5} />
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
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Urgent Medicines
              </span>
            </div>
          </Link>

          {/* Location Picker */}
          <div className="nav-location-desktop" style={{ display: 'flex' }}>
            <LocationPicker />
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}
          className="desktop-nav-links"
        >
          <Link
            to="/medicines"
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Search size={16} />
            <span>Search Medicines</span>
          </Link>

          <Link
            to="/emergency"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#fff1f2',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <Zap size={15} color="#e11d48" />
            <span>SOS Essentials</span>
          </Link>

          <Link
            to="/pharmacies"
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Store size={16} />
            <span>Nearby Pharmacies</span>
          </Link>

          <Link
            to="/pharmacy-network"
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Map size={16} />
            <span>Network Map</span>
          </Link>


          {isAuthenticated && isCustomer && (
            <Link
              to="/prescriptions"
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FileText size={16} />
              <span>Prescriptions</span>
            </Link>
          )}
        </nav>

        {/* Right Actions: Cart, Notifications, Theme, Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Cart Icon (Customer) */}
          {(!isAuthenticated || isCustomer) && (
            <Link
              to="/cart"
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cart.totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'var(--primary-600)',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px'
                  }}
                >
                  {cart.totalItems}
                </span>
              )}
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
                  gap: '8px',
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
                    width: '28px',
                    height: '28px',
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
                    width: '200px',
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
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {user?.name}
                    </p>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      Role: {user?.role}
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
                      color: 'var(--text-main)'
                    }}
                  >
                    <LayoutDashboard size={15} />
                    <span>Dashboard</span>
                  </Link>

                  {isCustomer && (
                    <Link
                      to="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 14px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-main)'
                      }}
                    >
                      <ShoppingBag size={15} />
                      <span>My Orders</span>
                    </Link>
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
                      color: 'var(--text-main)'
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
                      textAlign: 'left'
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
              display: 'none'
            }}
            className="mobile-hamburger-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          className="mobile-drawer"
        >
          <LocationPicker />
          <Link
            to="/medicines"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)' }}
          >
            Search Medicines
          </Link>
          <Link
            to="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px', fontSize: '0.9375rem', color: '#e11d48', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={16} />
            SOS Emergency Essentials
          </Link>
          <Link
            to="/pharmacies"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)' }}
          >
            Nearby Pharmacies
          </Link>
          <Link
            to="/pharmacy-network"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)' }}
          >
            Pharmacy Network Map
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--text-main)' }}
          >
            Shopping Cart ({cart.totalItems})
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardLink()}
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px', fontSize: '0.9375rem', color: 'var(--primary-600)' }}
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
