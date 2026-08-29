import React from 'react';
import { ShieldCheck, Lock, Eye, FileCheck, CheckCircle2 } from 'lucide-react';

const Safety = () => {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '850px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--secondary-50)',
            color: 'var(--secondary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}
        >
          <ShieldCheck size={28} />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Safety & Prescription Trust Protocol</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          How QuickMeds safeguards medicine quality, prescription safety, and patient data privacy.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <ShieldCheck size={24} color="var(--primary-600)" style={{ marginBottom: '8px' }} />
          <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '6px' }}>100% Verified Partners</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Every chemist on QuickMeds must submit a valid State Drug Retail License verified by our compliance team.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <Lock size={24} color="var(--primary-600)" style={{ marginBottom: '8px' }} />
          <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '6px' }}>Encrypted Document Vault</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Uploaded prescriptions are stored securely and accessible only by authorized pharmacists and patient.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <Eye size={24} color="var(--primary-600)" style={{ marginBottom: '8px' }} />
          <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '6px' }}>Human Pharmacist Audit</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            We do not use automatic script dispensing. A licensed pharmacist reviews each prescription item.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Prescription Upload Checklist</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          To ensure prompt verification and fast delivery, please ensure your uploaded prescription contains:
        </p>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Doctor's Name, Degree, and Medical Council Registration Number</li>
          <li>Patient Full Name and Age</li>
          <li>Date of Consultation (Prescription must not be expired)</li>
          <li>Clearly legible medicine name, dosage, and duration</li>
          <li>Doctor's Signature or Official Clinic Seal</li>
        </ul>
      </div>
    </div>
  );
};

export default Safety;
