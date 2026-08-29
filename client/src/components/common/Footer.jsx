import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, ShieldCheck, HeartHandshake, PhoneCall, AlertCircle, Cpu, Lock, BarChart3, Map } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-light)',
        paddingTop: '3.5rem',
        paddingBottom: '2rem',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}
        >
          {/* Column 1: Brand & Philosophy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Pill size={18} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                QuickMeds
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Zero-inventory emergency medicine aggregation platform connecting patients with nearby verified, licensed retail pharmacies for rapid discovery and express fulfilment.
            </p>

          </div>

          {/* Column 2: Hyperlocal Services */}
          <div>
            <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Hyperlocal Services
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/medicines" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Search Medicines
                </Link>
              </li>
              <li>
                <Link to="/pharmacies" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Nearby Pharmacies
                </Link>
              </li>
              <li>
                <Link to="/pharmacy-network" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Pharmacy Network Map
                </Link>
              </li>
              <li>
                <Link to="/prescriptions" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Upload Prescription
                </Link>
              </li>
              <li>
                <Link to="/orders" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Track Active Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Presentation & Tech */}
          <div>
            <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              System & Research
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/security" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Security & DPDP Compliance
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  About QuickMeds Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Legal */}
          <div>
            <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Compliance & Safety
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/safety" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Pharmacist Verification Code
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Medical & Legal Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/terms" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Privacy & Data Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Support & Helpdesk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Healthcare Disclaimer Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2rem',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="var(--primary-600)" style={{ minWidth: '18px', marginTop: '2px' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong>Healthcare Marketplace Notice:</strong> QuickMeds is a technology platform connecting customers with licensed independent retail pharmacies. QuickMeds does not prescribe, manufacture, or independently dispense regulated pharmaceutical drugs. Prescription medications require mandatory verification by a licensed registered pharmacist prior to fulfillment. In case of life-threatening acute emergencies, immediately contact hospital emergency services or dial 112/102.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1.5rem'
          }}
        >
          <span>
            © 2026 QuickMeds. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/security" style={{ color: 'var(--text-muted)' }}>Security</Link>
            <Link to="/disclaimer" style={{ color: 'var(--text-muted)' }}>Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
