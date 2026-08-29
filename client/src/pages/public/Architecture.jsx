import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Cpu,
  Server,
  Database,
  Radio,
  RefreshCw,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  GitBranch,
  Activity,
  Globe,
  Terminal,
  FileCode,
  Share2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const Architecture = () => {
  const [activeTab, setActiveTab] = useState('SYSTEM_OVERVIEW');
  const navigate = useNavigate();

  const TABS = [
    { id: 'SYSTEM_OVERVIEW', label: 'Full System Architecture', icon: Layers },
    { id: 'ROUTING_ALGORITHM', label: 'Routing Engine Algorithm', icon: Cpu },
    { id: 'WEBSOCKET_EVENT_BUS', label: 'WebSocket Event Bus', icon: Radio },
    { id: 'FAILOVER_FALLBACK', label: 'Failover & Fallback Protocol', icon: RefreshCw }
  ];

  const TECH_STACK = [
    { category: 'Frontend Layer', name: 'React 18 + Vite', desc: 'SPA with Client-side Routing, Context API, Lucide Icons, and Tailwind CSS.' },
    { category: 'Backend Engine', name: 'Node.js + Express', desc: 'RESTful API gateway, JWT authentication, and modular controller architecture.' },
    { category: 'Real-time Event Bus', name: 'Socket.IO v4', desc: 'Bi-directional WebSocket rooms for live GPS telemetry, orders, and timer failovers.' },
    { category: 'Database & Spatial', name: 'MongoDB + Mongoose', desc: 'Geospatial 2dsphere indexing for $nearSphere distance queries and ACID-like updates.' },
    { category: 'Security & Auth', name: 'JWT + Multer + Helmet', desc: '4-tier Role-Based Access Control (RBAC), bcrypt hashing, and sanitization.' },
    { category: 'Testing & QA', name: 'Jest + Supertest', desc: 'Unit & integration test suites covering multi-factor routing and edge cases.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '3rem' }}>
      {/* 1. Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-950) 100%)',
          color: '#ffffff',
          padding: '3.5rem 0',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
            <Badge variant="primary">System Architecture</Badge>
            <Badge variant="success">Production-Ready Blueprint</Badge>
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
            QuickMeds Technical Architecture & Systems Flow
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--primary-100)', maxWidth: '720px', lineHeight: 1.6 }}>
            A high-resilience, zero-inventory multi-tenant platform designed for sub-second geospatial querying, combinatorial basket optimization, and statutory pharmacist verification.
          </p>

          {/* Quick Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '2.5rem'
            }}
          >
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-200)', textTransform: 'uppercase', fontWeight: 600 }}>Architecture Pattern</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>Event-Driven MERN</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-200)', textTransform: 'uppercase', fontWeight: 600 }}>Routing Complexity</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>O(N log K) Multi-Store</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-200)', textTransform: 'uppercase', fontWeight: 600 }}>Geospatial Precision</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>MongoDB 2dsphere</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-200)', textTransform: 'uppercase', fontWeight: 600 }}>Failover Latency</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>30s Auto Timeout</p>
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
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Dynamic Tab Content */}
      <section className="container">
        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === 'SYSTEM_OVERVIEW' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
                Multi-Tenant Layered System Topology
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                QuickMeds decouples user interaction, spatial discovery, transactional state machines, and real-time telemetry into dedicated asynchronous subsystems.
              </p>

              {/* Layer Pipeline Diagram */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Layer 1: Client Frontends */}
                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#1e40af', fontSize: '0.9375rem' }}>1. Client Presentation Layer (SPA React 18)</strong>
                    <Badge variant="primary">4 User Personas</Badge>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#1e3a8a', margin: 0 }}>
                    Customer Web Application • Pharmacy Partner Portal • Delivery Partner Dispatch Console • Regulatory Admin Visualizer
                  </p>
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ArrowRight size={18} style={{ transform: 'rotate(90deg)', margin: '0 auto' }} />
                </div>

                {/* Layer 2: API Gateway & Security */}
                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#166534', fontSize: '0.9375rem' }}>2. API Gateway & Security Perimeter (Express / Node.js)</strong>
                    <Badge variant="success">Stateless JWT + RBAC</Badge>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#14532d', margin: 0 }}>
                    Helmet Headers • Express Rate Limiter • Multer Prescription Ingestion • Input Sanitization Middleware • Audit Logger
                  </p>
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ArrowRight size={18} style={{ transform: 'rotate(90deg)', margin: '0 auto' }} />
                </div>

                {/* Layer 3: Core Engines */}
                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#92400e', fontSize: '0.9375rem' }}>3. Core Intelligence & State Machine Layer</strong>
                    <Badge variant="warning">Algorithmic Engine</Badge>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#78350f', margin: 0 }}>
                    Smart Fulfilment Routing Engine • 30-Second Failover Timer • Pharmacist Verification Timeline • Order State Machine
                  </p>
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ArrowRight size={18} style={{ transform: 'rotate(90deg)', margin: '0 auto' }} />
                </div>

                {/* Layer 4: Real-time & Persistence */}
                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#6b21a8', fontSize: '0.9375rem' }}>4. Data Persistence & Real-time Telemetry</strong>
                    <Badge variant="info">MongoDB 2dsphere + Socket.IO</Badge>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#581c87', margin: 0 }}>
                    MongoDB Geospatial Indexing • Mongoose Schema Constraints • Socket.IO Order Rooms • Tamper-Evident Audit Trails
                  </p>
                </div>
              </div>
            </Card>

            {/* Technology Stack Grid */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
                Key Technology Components
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {TECH_STACK.map((tech, idx) => (
                  <Card key={idx}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
                      {tech.category}
                    </span>
                    <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginTop: '2px', marginBottom: '6px' }}>
                      {tech.name}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                      {tech.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROUTING ALGORITHM */}
        {activeTab === 'ROUTING_ALGORITHM' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Multi-Factor Smart Routing Engine Pipeline
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Our proprietary routing algorithm eliminates single-variable nearest-neighbour pitfalls by scoring candidate pharmacies across a composite multi-dimensional vector.
              </p>

              {/* Formula & Weighting Matrix */}
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  marginBottom: '1.5rem'
                }}
              >
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '8px' }}>
                  Composite Fulfilment Scoring Formula:
                </h4>
                <code style={{ fontSize: '0.875rem', color: 'var(--text-main)', display: 'block', backgroundColor: 'var(--bg-card)', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                  Score(P) = [ 0.40 × StockCoverage ] + [ 0.25 × ProximityScore ] + [ 0.15 × ETAScore ] + [ 0.10 × PriceScore ] + [ 0.10 × ReliabilityRating ]
                </code>
              </div>

              {/* Algorithmic Stages */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <Badge variant="primary" size="sm">Phase 1: Spatial Filter</Badge>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px', marginBottom: '6px' }}>
                    Radius Geospatial Query
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Executes <code>$nearSphere</code> query centered on patient GPS coordinates with a configurable search radius (default 5 km, extended to 10 km).
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <Badge variant="success" size="sm">Phase 2: Inventory Match</Badge>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px', marginBottom: '6px' }}>
                    Live Shelf Cross-Match
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Cross-references all requested basket medicines against verified active inventory batches, computing exact coverage ratios (e.g., 3/3 items).
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <Badge variant="warning" size="sm">Phase 3: Knapsack Solver</Badge>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px', marginBottom: '6px' }}>
                    Basket Split Optimization
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    If no single pharmacy stocks 100% of a multi-item basket, the engine solves for minimum split fulfillment points while minimizing total travel ETA.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <Badge variant="info" size="sm">Phase 4: Fallback Plan</Badge>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px', marginBottom: '6px' }}>
                    Alternative Ranking
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Pre-calculates 1st, 2nd, and 3rd rank fallback candidate stores to enable instant 30-second automated failover without customer interruption.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: WEBSOCKET EVENT BUS */}
        {activeTab === 'WEBSOCKET_EVENT_BUS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Real-Time WebSocket Event Topology
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Socket.IO event bus coordinates instant bi-directional messaging between customers, pharmacy dispensers, riders, and platform admins.
              </p>

              {/* Event Matrix Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '12px', fontWeight: 700 }}>Event Name</th>
                      <th style={{ padding: '12px', fontWeight: 700 }}>Channel / Room</th>
                      <th style={{ padding: '12px', fontWeight: 700 }}>Triggering Subsystem</th>
                      <th style={{ padding: '12px', fontWeight: 700 }}>Payload & Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-700)' }}>order_created</td>
                      <td style={{ padding: '12px' }}><code>pharmacy:&#123;id&#125;</code></td>
                      <td style={{ padding: '12px' }}>Checkout Controller</td>
                      <td style={{ padding: '12px' }}>Pushes new emergency order to assigned pharmacy dispatch queue.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--secondary-700)' }}>prescription_verified</td>
                      <td style={{ padding: '12px' }}><code>order:&#123;id&#125;</code></td>
                      <td style={{ padding: '12px' }}>Pharmacist Console</td>
                      <td style={{ padding: '12px' }}>Unlocks packaging state & emits digital pharmacist verification stamp.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#dc2626' }}>pharmacy_timeout_fallback</td>
                      <td style={{ padding: '12px' }}><code>order:&#123;id&#125;, admin_feed</code></td>
                      <td style={{ padding: '12px' }}>Failover Engine</td>
                      <td style={{ padding: '12px' }}>Auto re-routes order to alternative pharmacy after 30s confirmation lapse.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>rider_telemetry_update</td>
                      <td style={{ padding: '12px' }}><code>order:&#123;id&#125;</code></td>
                      <td style={{ padding: '12px' }}>Delivery Partner App</td>
                      <td style={{ padding: '12px' }}>Streams live GPS waypoint coordinates and remaining ETA countdown.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: FAILOVER & FALLBACK */}
        {activeTab === 'FAILOVER_FALLBACK' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Offline Fallback & Automated Failover Protocol
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                In emergency healthcare, a non-responsive pharmacy counter cannot stall patient care. QuickMeds implements a multi-tier fallback circuit breaker.
              </p>

              {/* Visual Failover Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Order Dispatched to Top-Ranked Pharmacy</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Routing engine assigns order to Store #1 (highest composite score) and starts a 30-second confirmation timer.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Confirmation Timer Countdown (T = 30s)</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Audio-visual alert triggered at pharmacy terminal. If store is offline or pharmacist is busy, timer ticks down.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dc2626', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Automated Failover Trigger</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      On timeout, order status updates to <code>ROUTING_FALLBACK</code>, an audit log event is recorded, and the order shifts to Store #2 instantly.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    4
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Patient Notification & Live Re-centering</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Patient is transparently notified of the reassigned store and updated ETA without losing order or payment integrity.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* 4. Bottom Navigation CTA */}
      <section className="container">
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
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
            <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Explore Related System Documents</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Review security protocols, regulatory compliance mechanisms, and empirical research survey benchmarks.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button variant="primary" size="md" onClick={() => navigate('/security')}>
              Security & Compliance →
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate('/research')}>
              Research & Survey Data →
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Architecture;
