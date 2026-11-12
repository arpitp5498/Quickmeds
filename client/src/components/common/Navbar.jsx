import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Moon, Pill, ShoppingBag, Sun, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import LocationPicker from './LocationPicker';
import NotificationBell from './NotificationBell';
import { useAssistant } from './AIAssistantChat';
import './storefront.css';

const dashboards = { ADMIN: '/admin', PHARMACY: '/pharmacy', DOCTOR: '/doctor', DELIVERY_PARTNER: '/delivery' };
const careLinks = [
  ['/doctors', 'Consult a doctor'], ['/lab-tests', 'Book a lab test'],
  ['/emergency', 'First-aid essentials'], ['/period-care', 'Period care'],
  ['/pharmacies', 'Nearby pharmacies'], ['/pharmacy-network', 'Pharmacy map'],
  ['/ambulance', 'Ambulance assistance']
];
const accountLinks = [
  ['/orders', 'My orders'], ['/prescriptions', 'Prescriptions'], ['/health-records', 'Health records'],
  ['/reminders', 'Medicine reminders'], ['/cycle-tracker', 'Cycle tracker'], ['/addresses', 'Saved addresses']
];

export default function Navbar() {
  const { user, isAuthenticated, isCustomer, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const openAssistant = useAssistant();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const trigger = useRef(null);
  const canShop = !isAuthenticated || isCustomer;
  const dashboard = dashboards[user?.role] || '/dashboard';

  useEffect(() => { setOpen(false); }, [pathname, search]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = event => {
      if (!menu.current?.contains(event.target)) setOpen(false);
    };
    const onKey = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const links = entries => entries.map(([path, label]) =>
    <NavLink key={path} to={path} onClick={() => setOpen(false)}>{label}</NavLink>
  );

  return (
    <header className="qm-header">
      <div className="container qm-nav">
        <Link to="/" className="qm-wordmark" aria-label="QuickMeds home">
          <span className="qm-mark"><Pill size={21} aria-hidden="true" /></span>QuickMeds
        </Link>
        <div className="qm-delivery-area"><LocationPicker /></div>
        <nav className="qm-primary" aria-label="Primary navigation">
          <NavLink to="/medicines">Medicines</NavLink>
          {(canShop || isAdmin) && <NavLink to="/orders">My orders</NavLink>}
        </nav>
        <div className="qm-actions">
          {canShop && <Link to="/cart" className="qm-cart-link" aria-label={cart.totalItems ? `Shopping cart, ${cart.totalItems} items` : 'Shopping cart'}>
            <ShoppingBag size={20} aria-hidden="true" /><span className="qm-cart-label">Cart</span>
            {cart.totalItems > 0 && <span className="qm-count">{cart.totalItems}</span>}
          </Link>}
          <NotificationBell />
          {!isAuthenticated && <Link to="/login" className="qm-sign-in">Sign in</Link>}
          <div ref={menu} className="qm-menu">
            <button type="button" ref={trigger} className="qm-menu-button" aria-label="Menu" aria-expanded={open}
              aria-controls="qm-navigation" onClick={() => setOpen(!open)}>
              {open ? <X size={21} /> : <Menu size={21} />}<span>Menu</span>
            </button>
            {open && <nav id="qm-navigation" className="qm-popover" aria-label="More navigation">
              <div className="qm-menu-group">
                <strong>{isAuthenticated ? 'My account' : 'QuickMeds'}</strong>
                {isAuthenticated && links([[dashboard, 'Dashboard']])}
                {links([['/medicines', 'Find medicines']])}
                {(isCustomer || isAdmin) ? links(accountLinks) : !isAuthenticated && links([['/orders', 'Track an order']])}
                {(isCustomer || isAdmin) && links([['/profile', 'Account profile']])}
                {user?.role === 'DOCTOR' && links([['/doctor/profile', 'Doctor profile']])}
                {user?.role === 'PHARMACY' && links([['/pharmacy/profile', 'Pharmacy profile']])}
                {user?.role === 'DELIVERY_PARTNER' && links([['/delivery/profile', 'Rider profile']])}
              </div>
              <div className="qm-menu-group"><strong>Care services</strong>{links(careLinks)}</div>
              <div className="qm-menu-group qm-tools">
                {links([['/contact', 'Help & contact']])}
                <button type="button" onClick={() => { setOpen(false); openAssistant(trigger.current); }}>Chat with QuickMeds</button>
                <button type="button" onClick={toggleTheme}>{isDark ? <Sun size={15} /> : <Moon size={15} />}{isDark ? 'Light appearance' : 'Dark appearance'}</button>
                {isAuthenticated && <button type="button" onClick={() => { setOpen(false); logout(); navigate('/login'); }}>Sign out</button>}
              </div>
            </nav>}
          </div>
        </div>
      </div>
    </header>
  );
}
