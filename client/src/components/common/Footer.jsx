import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill } from 'lucide-react';
import AppDownloadModal from './AppDownloadModal';

export default function Footer() {
  const [appOpen, setAppOpen] = useState(false);
  return (
    <footer className="qm-footer">
      <div className="container">
        <div className="qm-footer-top">
          <div>
            <Link to="/" className="qm-wordmark"><span className="qm-mark"><Pill size={19} /></span>QuickMeds</Link>
            <p>Medicine delivery from local pharmacies.</p>
          </div>
          <nav aria-label="Customer support">
            <Link to="/orders">Track an order</Link><Link to="/contact">Help & contact</Link>
            <Link to="/about">About us</Link><button type="button" onClick={() => setAppOpen(true)}>Get the app</button>
          </nav>
        </div>
        <div className="qm-footer-bottom">
          <span>© {new Date().getFullYear()} QuickMeds</span>
          <nav aria-label="Policies">
            <Link to="/safety">Medicine safety</Link><Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link><Link to="/security">Security</Link><Link to="/disclaimer">Disclaimer</Link>
          </nav>
        </div>
      </div>
      <AppDownloadModal isOpen={appOpen} onClose={() => setAppOpen(false)} />
    </footer>
  );
}
