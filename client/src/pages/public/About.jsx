import React from 'react';
import { Pill, Award, Target, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '850px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>
          About QuickMeds
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Hyperlocal Medicine Quick-Delivery Infrastructure
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
        <section>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>Our Mission</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            QuickMeds was engineered to solve the critical delay when patients need urgent medicines in their
            immediate neighbourhood. Unlike centralized e-pharmacies that take 24–48 hours from regional
            warehouses, QuickMeds taps into existing licensed neighbourhood retail pharmacies to deliver medicines
            within 15–30 minutes.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>The Technology</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Our platform features geospatial 2dsphere indexing, real-time inventory synchronization,
            Socket.IO status pipelines, automated fleet routing, and secure prescription verification.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
