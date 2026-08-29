import React from 'react';
import { AlertTriangle, ShieldCheck, FileText, PhoneCall } from 'lucide-react';

const Disclaimer = () => {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '850px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--accent-600)',
          marginBottom: '1rem'
        }}
      >
        <AlertTriangle size={28} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Medical & Regulatory Disclaimer</h1>
      </div>

      <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Last Updated: August 2026 • Medical & Legal Disclaimer
      </p>

      <div
        style={{
          backgroundColor: 'var(--accent-50)',
          border: '1px solid var(--accent-100)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem',
          color: '#9f1239'
        }}
      >
        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem', color: '#9f1239' }}>
          Mandatory Health Notice
        </h4>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
          QuickMeds is a hyperlocal digital marketplace software. QuickMeds does not provide medical diagnoses, prescribe prescription medications,
          or independently manufacture pharmaceutical goods.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            1. Role of Licensed Retail Pharmacies
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            All medicine dispensing, verification of prescriptions, packaging, and final regulatory
            compliance remain the sole responsibility of the participating licensed independent retail
            chemist or pharmacy partner. No prescription medicine is dispensed without direct review
            and approval by a registered pharmacist holding a valid license under the Drugs and Cosmetics Act.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            2. Medical Emergencies
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            QuickMeds is not an emergency medical response service or hospital substitute. If you or a family
            member is suffering from acute trauma, severe chest pain, sudden breathlessness, poisoning, or any
            life-threatening situation, immediately dial <strong>112</strong> or <strong>102</strong> for emergency
            ambulance services, or proceed to the nearest emergency room.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            3. Prescription Verification Policy
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Orders containing Schedule H, H1, or X medications strictly require a legible doctor's prescription
            bearing the physician's registration number, patient name, and prescription date. Automated approval
            of prescription drugs is strictly prohibited on our platform.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            4. Legal Disclaimer
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            This platform represents the implementation of QuickMeds. Any deployment in a production commercial context requires all relevant statutory
            approvals and pharmacy licenses.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Disclaimer;
