import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  Users,
  Eye,
  Key,
  Database,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Fingerprint,
  HardDrive,
  Scale,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const Security = () => {
  const [activeSection, setActiveSection] = useState('PRESCRIPTION_ENCRYPTION');
  const navigate = useNavigate();

  const SECTIONS = [
    { id: 'PRESCRIPTION_ENCRYPTION', label: 'Prescription Encryption & Privacy', icon: Lock },
    { id: 'DPDP_COMPLIANCE', label: 'DPDP Act 2023 Compliance', icon: Scale },
    { id: 'RBAC_MATRIX', label: 'Role-Based Access Control (RBAC)', icon: Users },
    { id: 'STATUTORY_AUDIT', label: 'Statutory Verification Audit Trail', icon: FileCheck }
  ];

  const RBAC_DATA = [
    {
      resource: 'Prescription Documents (Rx Files)',
      customer: 'Upload & View Own',
      pharmacy: 'Review Assigned Orders Only',
      delivery: 'No Access (Masked)',
      admin: 'Audit & Compliance View'
    },
    {
      resource: 'Patient PII & Contact Info',
      customer: 'Manage Own Profile',
      pharmacy: 'Masked (First Name Only)',
      delivery: 'Masked Transit Address & Call Relay',
      admin: 'Full Administrative Directory'
    },
    {
      resource: 'Drug Retail License (Form 20/21)',
      customer: 'View Verification Badge',
      pharmacy: 'Submit & Manage Own License',
      delivery: 'No Access',
      admin: 'Approve, Reject & Suspend'
    },
    {
      resource: 'Routing & Inventory Feeds',
      customer: 'Read Aggregated Matches',
      pharmacy: 'Update Own Shelf Quantities',
      delivery: 'Read Waypoints Only',
      admin: 'Full Platform Monitor'
    },
    {
      resource: 'System Audit Logs',
      customer: 'No Access',
      pharmacy: 'Own Action History',
      delivery: 'Own Shift History',
      admin: 'Full Tamper-Evident Trail'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '3rem' }}>
      {/* 1. Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '3.5rem 0',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
            <Badge variant="success">Healthcare Data Security</Badge>
            <Badge variant="primary">DPDP Act 2023 Compliance</Badge>
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
            Security, Privacy & Regulatory Compliance
          </h1>
          <p style={{ fontSize: '1.0625rem', color: '#94a3b8', maxWidth: '720px', lineHeight: 1.6 }}>
            QuickMeds enforces zero-trust data protection, end-to-end prescription encryption, patient anonymity in transit, and tamper-evident statutory audit trails.
          </p>

          {/* Core Trust Indicators */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '2.5rem'
            }}
          >
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 600 }}>Prescription Protection</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>Scoped Token & Hashing</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#4ade80', textTransform: 'uppercase', fontWeight: 600 }}>Privacy Law</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>India DPDP Act 2023</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 600 }}>Access Control</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>4-Tier Granular RBAC</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 600 }}>Drug Law Compliance</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>Schedule H/H1 Verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation Tabs */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '8px'
          }}
        >
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--primary-600)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={16} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Dynamic Section Content */}
      <section className="container">
        {/* SECTION 1: PRESCRIPTION ENCRYPTION */}
        {activeSection === 'PRESCRIPTION_ENCRYPTION' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                End-to-End Prescription Encryption & Scoped Access
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Prescription files contain sensitive diagnostic information. QuickMeds isolates prescription files using temporary signed URL tokens and cryptographic integrity verification.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Key size={18} color="var(--primary-600)" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Time-Limited Scoped Tokens</h4>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Prescription images are never publicly readable. Only the assigned licensed pharmacist receives an ephemeral, cryptographically signed token valid for 15 minutes during verification review.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Fingerprint size={18} color="var(--secondary-600)" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>SHA-256 Rx Integrity Hashing</h4>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Every uploaded prescription file is hashed on upload. The resulting hash is permanently anchored to the order record to prevent in-flight tampering or substitution.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Eye size={18} color="#f59e0b" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Rider Privacy Masking</h4>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Delivery riders never see the patient prescription, medical diagnoses, or specific drug names. They only receive a sealed package with a tamper-evident QR code and delivery address.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 2: DPDP COMPLIANCE */}
        {activeSection === 'DPDP_COMPLIANCE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Digital Personal Data Protection (DPDP) Act 2023 Compliance
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                QuickMeds incorporates key principles of India's Digital Personal Data Protection Act 2023: Purpose Limitation, Explicit Consent, and Data Minimisation.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                  <Badge variant="success" size="sm">Principle 1</Badge>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px', marginBottom: '6px', color: '#166534' }}>
                    Explicit Consent Management
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#14532d', lineHeight: 1.5 }}>
                    Patients grant explicit, affirmative consent prior to prescription upload and GPS location retrieval, with full visibility into which pharmacy receives their request.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
                  <Badge variant="primary" size="sm">Principle 2</Badge>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px', marginBottom: '6px', color: '#1e40af' }}>
                    Purpose Limitation & Retention
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                    Patient medical and location data is utilized solely for order routing and statutory verification. Prescriptions are archived in compliance with medical record retention regulations.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#faf5ff', borderRadius: 'var(--radius-md)', border: '1px solid #e9d5ff' }}>
                  <Badge variant="info" size="sm">Principle 3</Badge>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px', marginBottom: '6px', color: '#6b21a8' }}>
                    Right to Erasure & Masking
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#581c87', lineHeight: 1.5 }}>
                    Customers can request account de-identification, address removal, and personal medical history erasure directly from their account profile.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 3: RBAC MATRIX */}
        {activeSection === 'RBAC_MATRIX' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                4-Tier Role-Based Access Control (RBAC) Matrix
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Strict authorization barriers enforced at both API middleware (<code>protect</code>, <code>authorize</code>) and frontend route guards.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '12px', fontWeight: 700 }}>Data Resource</th>
                      <th style={{ padding: '12px', fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: '12px', fontWeight: 700 }}>Pharmacy Partner</th>
                      <th style={{ padding: '12px', fontWeight: 700 }}>Delivery Rider</th>
                      <th style={{ padding: '12px', fontWeight: 700 }}>Admin Auditor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RBAC_DATA.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', fontWeight: 700 }}>{row.resource}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{row.customer}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{row.pharmacy}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{row.delivery}</td>
                        <td style={{ padding: '12px', color: 'var(--primary-700)', fontWeight: 600 }}>{row.admin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 4: STATUTORY AUDIT */}
        {activeSection === 'STATUTORY_AUDIT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Statutory Pharmacy Verification & Pharmacist-in-the-Loop Audit Trail
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Under the Drugs & Cosmetics Act 1940 and Pharmacy Act 1948, pharmaceutical dispensing requires verified license credentials and licensed pharmacist sign-off.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                    1. State Drug Retail License Onboarding Verification
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    Every pharmacy submitting registration must upload Form 20 (Allopathic drugs) and Form 21 (Schedule C/C1 drugs). Administrative compliance teams audit credentials before store activation.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                    2. Pharmacist Registration Number Validation
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    Orders containing Schedule H or H1 drugs cannot transition to <code>PREPARING</code> without a licensed registered pharmacist (with State Pharmacy Council Reg Number) completing visual verification.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                    3. Tamper-Evident Audit Logging
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    Every state transition, license approval, prescription verification, and routing fallback is logged with actor ID, role, IP address, and high-precision UTC timestamp.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* 4. Statutory Regulatory Disclaimer */}
      <section className="container">
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}
        >
          <AlertTriangle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#92400e', marginBottom: '4px' }}>
              Regulatory & Compliance Notice
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#78350f', lineHeight: 1.6, margin: 0 }}>
              All security, prescription verification, and licensing workflows simulate real-world compliance architectures. Full commercial deployment requires formal statutory certification from state drug licensing authorities (SDA) and Central Drugs Standard Control Organisation (CDSCO).
            </p>
          </div>
        </div>
      </section>

      {/* 5. Bottom Navigation CTA */}
      <section className="container">
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Explore Other Presentation Modules</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Explore the system architecture diagram or view field research and patient survey datasets.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button variant="primary" size="md" onClick={() => navigate('/architecture')}>
              System Architecture →
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate('/research')}>
              Field Research Benchmarks →
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Security;
