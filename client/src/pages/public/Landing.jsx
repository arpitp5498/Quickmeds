import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Store,
  Pill,
  FileCheck,
  Truck,
  ArrowRight,
  ChevronDown,
  Star,
  CheckCircle2,
  PhoneCall,
  AlertTriangle,
  Layers,
  Cpu,
  RefreshCw,
  Navigation,
  Sparkles,
  Info,
  Activity,
  HeartPulse
} from 'lucide-react';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import { useLocation } from '../../context/LocationContext';
import EmergencyEssentialsSection from '../../components/emergency/EmergencyEssentialsSection';

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const { location } = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/medicines');
    }
  };

  const WORKFLOW_STEPS = [
    {
      id: 0,
      step: '01',
      title: 'Search & Basket',
      badge: 'Step 1',
      shortDesc: 'Patient adds single or multiple urgent medicines and detects GPS location.',
      details: 'Instant multi-item aggregation checks nearby inventory radius within 1-10 km of patient coordinates.',
      icon: Search,
      preview: {
        badge: 'Cart Aggregation',
        item1: 'Dolo 650mg (1 Strip) - In Stock',
        item2: 'Augmentin 625 Duo (1 Strip) - In Stock',
        status: '2 Items in Basket • Location: Connaught Place'
      }
    },
    {
      id: 1,
      step: '02',
      title: 'Smart Fulfilment Routing',
      badge: 'Step 2',
      shortDesc: 'Multi-factor routing engine evaluates candidate pharmacies and optimizes order.',
      details: 'Evaluates stock availability (40%), proximity (25%), ETA (15%), pricing (10%), and rating (10%).',
      icon: Cpu,
      preview: {
        badge: 'Routing Score: 94.8 / 100',
        item1: 'Apollo Pharmacy (0.8 km) • Score: 96.2 • Match: 100%',
        item2: 'MedPlus Chemist (1.4 km) • Score: 91.5 • Match: 100%',
        status: 'Optimal Single-Store Fulfilment Plan Generated'
      }
    },
    {
      id: 2,
      step: '03',
      title: 'Pharmacist Verification',
      badge: 'Step 3',
      shortDesc: 'Licensed registered pharmacist on duty verifies prescription and signs off.',
      details: 'Human-in-the-loop compliance ensures strict Schedule H/H1 validation and audit logging.',
      icon: ShieldCheck,
      preview: {
        badge: 'Statutory Verification',
        item1: 'Rx Hash: #RX-2026-9481 • Dr. V. Mehta (Reg #DL-4819)',
        item2: 'Status: VERIFIED by Reg. Pharmacist Rajiv K. (DL-PH-339)',
        status: 'Digital Verification Stamp Applied • Packaging Authorized'
      }
    },
    {
      id: 3,
      step: '04',
      title: 'Hyperlocal Delivery',
      badge: 'Step 4',
      shortDesc: 'Order packed in tamper-evident seal and express dispatched to patient doorstep.',
      details: 'Live GPS telemetry with real-time waypoint interpolation and 20-30 min target ETA.',
      icon: Truck,
      preview: {
        badge: 'Live GPS Telemetry',
        item1: 'Rider: Suresh Kumar (Hero Splendor DL-3S-4819)',
        item2: 'Route: Connaught Place Outer Circle ➔ Block C',
        status: 'Target ETA: ~18 Minutes • Live Telemetry Active'
      }
    }
  ];

  const WHY_CARDS = [
    {
      title: 'Zero-Inventory Model',
      desc: 'QuickMeds operates with zero capital locked in central warehouses. We digitally network and empower licensed neighbourhood retail chemists.',
      icon: Layers,
      highlight: 'Asset-Light'
    },
    {
      title: 'Live Stock Matching',
      desc: 'Real-time inventory querying across registered pharmacy shelves guarantees zero false positives and instant emergency medicine discovery.',
      icon: CheckCircle2,
      highlight: 'Zero False Stock'
    },
    {
      title: 'Smart Fulfilment Routing Engine',
      desc: 'Multi-factor algorithmic scoring optimises proximity, stock coverage, delivery velocity, and transparent pricing across candidate stores.',
      icon: Cpu,
      highlight: 'Algorithmic'
    },
    {
      title: 'Pharmacist-in-the-Loop Safety',
      desc: 'Every prescription undergoes mandatory statutory verification by a registered pharmacist before packaging, ensuring complete medical safety.',
      icon: ShieldCheck,
      highlight: '100% Compliant'
    },
    {
      title: 'Automated Fallback Routing',
      desc: 'If an assigned pharmacy does not confirm within 30 seconds, the engine automatically re-routes the order to the next optimal licensed store.',
      icon: RefreshCw,
      highlight: 'Fail-Safe'
    },
    {
      title: 'Live Real-Time Tracking',
      desc: 'Full GPS tracking from pharmacy counter to doorstep with turn-by-turn route line, rider details, and transparent target ETAs.',
      icon: Navigation,
      highlight: '20-30 Min Target'
    }
  ];

  const FAQS = [
    {
      q: 'What is QuickMeds and how does its zero-inventory model work?',
      a: 'QuickMeds is an emergency medicine logistics and discovery platform. Instead of maintaining centralized warehouses, it aggregates licensed independent neighborhood pharmacies into a high-speed hyperlocal grid.'
    },
    {
      q: 'How does the Smart Fulfilment Routing Engine select a pharmacy?',
      a: 'When an order or basket is submitted, our routing engine scores all nearby pharmacies based on 5 weighted factors: Medicine Stock Availability (40%), Proximity Distance (25%), Delivery ETA (15%), Price Competitiveness (10%), and Pharmacy Rating (10%).'
    },
    {
      q: 'What happens if a pharmacy fails to accept an emergency order in time?',
      a: 'QuickMeds has an automated Fallback Routing mechanism with a 30-second confirmation timer. If the selected pharmacy does not confirm or is busy, the order automatically shifts to the second-highest ranked pharmacy without canceling the order.'
    },
    {
      q: 'How are prescription-required (Schedule H/H1) medicines handled safely?',
      a: 'Customers securely upload their doctor prescription during checkout. Before the order can be packed or dispatched, a licensed registered pharmacist on duty must review, approve, and apply a statutory digital verification stamp.'
    },
    {
      q: 'How does QuickMeds ensure medicine availability?',
      a: 'QuickMeds connects with a vast network of verified local pharmacies, querying their real-time inventory to ensure the medicines you need are instantly found and reserved.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--primary-50) 0%, var(--bg-main) 100%)',
          padding: '3rem 0 2.5rem'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            {/* Left: Headline & Search */}
            <div>
              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-800)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: 700
                  }}
                >
                  <Pill size={14} color="var(--primary-700)" />
                  <span>QUICKMEDS — Nearest Medicine. Fastest Help.</span>
                </div>

              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 4.2vw, 3.4rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginBottom: '1rem',
                  letterSpacing: '-0.03em'
                }}
              >
                Emergency Medicine Access,{' '}
                <span style={{ color: 'var(--primary-600)' }}>Reimagined.</span>
              </h1>

              {/* Sub-headline */}
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '1.75rem',
                  maxWidth: '560px'
                }}
              >
                A zero-inventory hyperlocal emergency fulfilment platform that dynamically aggregates verified neighborhood pharmacies, runs multi-factor basket routing, and enables rapid doorstep delivery when every minute counts.
              </p>

              {/* Main Search Box */}
              <form
                onSubmit={handleSearch}
                style={{
                  display: 'flex',
                  gap: '8px',
                  maxWidth: '540px',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search Dolo 650, Augmentin, Paracetamol, Inhaler..."
                    size="lg"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" icon={Search}>
                  Find Medicine
                </Button>
              </form>

              {/* Secondary CTAs */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    const el = document.getElementById('interactive-workflow');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  View How It Works
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/pharmacy-network')}
                  icon={Store}
                >
                  Explore Pharmacy Map
                </Button>
              </div>

              {/* Three Core Benefits */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  alignItems: 'center',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--secondary-600)" />
                  <span>Hyperlocal Grid (1–5 km)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--secondary-600)" />
                  <span>100% Verified Pharmacies</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="var(--primary-600)" />
                  <span>20–30 Min Target ETA</span>
                </div>
              </div>
            </div>

            {/* Right: Live Discovery Illustration Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)',
                position: 'relative'
              }}
              className="animate-fade-in"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--secondary-500)'
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                    Live Hyperlocal Routing Engine
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary-700)',
                    backgroundColor: 'var(--primary-50)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}
                >
                  Near {location.city || 'Connaught Place'}
                </span>
              </div>

              {/* Candidate Pharmacy Cards with Score Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-50)',
                    border: '1px solid var(--primary-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-600)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Store size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Apollo Pharmacy</p>
                        <Badge variant="success" size="sm">Optimal Pick</Badge>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        0.8 km • Target ETA: 15 mins • Score: 96.2
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--secondary-700)', fontWeight: 800, display: 'block' }}>
                      In Stock (100%)
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>License Verified</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--secondary-600)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Store size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>MedPlus Chemist</p>
                        <Badge variant="info" size="sm">Fallback #1</Badge>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        1.4 km • Target ETA: 20 mins • Score: 91.5
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--secondary-700)', fontWeight: 700, display: 'block' }}>
                      In Stock (95%)
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Ready for Dispatch</span>
                  </div>
                </div>
              </div>

              {/* Live Dispatch Bar */}
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck size={18} color="var(--primary-600)" />
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                      Multi-Factor Basket Aggregator
                    </p>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      Zero-Inventory • 30s Failover • Pharmacist Audit
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={() => navigate('/medicines')}>
                  Order Now →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EMERGENCY ESSENTIALS / SOS SECTION */}
      <section className="container" style={{ scrollMarginTop: '80px' }}>
        <EmergencyEssentialsSection
          initialLimit={8}
          showViewAll={true}
          title="SOS — Emergency Essentials"
          subtitle="Quick access to commonly searched emergency essentials across QuickMeds' verified pharmacy grid."
        />
      </section>

      {/* 3. 4-STEP INTERACTIVE VISUAL WORKFLOW */}
      <section id="interactive-workflow" className="container" style={{ scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--primary-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Interactive Operational Flow
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '4px', marginBottom: '0.75rem' }}>
            4-Step Smart Fulfilment Workflow
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
            From emergency patient search to doorstep delivery in 4 automated, pharmacist-verified stages. Click any step below to explore live simulation mechanics.
          </p>
        </div>

        {/* Step Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          {WORKFLOW_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeWorkflowStep === idx;
            return (
              <div
                key={s.id}
                onClick={() => setActiveWorkflowStep(idx)}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isActive ? 'var(--primary-600)' : 'var(--bg-card)',
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  border: `2px solid ${isActive ? 'var(--primary-600)' : 'var(--border-light)'}`,
                  boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--primary-50)',
                      color: isActive ? '#ffffff' : 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, opacity: isActive ? 0.9 : 0.4 }}>
                    {s.step}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '0.75rem', opacity: isActive ? 0.9 : 0.7, lineHeight: 1.4 }}>
                  {s.shortDesc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Workflow Stage Details & Simulation Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
              <Badge variant="primary">Stage {WORKFLOW_STEPS[activeWorkflowStep].step}</Badge>
              <Badge variant="outline">{WORKFLOW_STEPS[activeWorkflowStep].badge}</Badge>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              {WORKFLOW_STEPS[activeWorkflowStep].title}
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {WORKFLOW_STEPS[activeWorkflowStep].details}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveWorkflowStep((activeWorkflowStep + 1) % WORKFLOW_STEPS.length)}
                icon={ArrowRight}
                iconPosition="right"
              >
                Next Workflow Stage
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/architecture')}
              >
                View Tech Architecture →
              </Button>
            </div>
          </div>

          {/* Interactive Stage Preview Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                Simulated Execution Telemetry
              </span>
              <span style={{ fontSize: '0.6875rem', backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {WORKFLOW_STEPS[activeWorkflowStep].preview.badge}
              </span>
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}>
              <strong>Input/Match: </strong> {WORKFLOW_STEPS[activeWorkflowStep].preview.item1}
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}>
              <strong>Execution: </strong> {WORKFLOW_STEPS[activeWorkflowStep].preview.item2}
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)', fontSize: '0.8125rem', color: 'var(--primary-900)', fontWeight: 600 }}>
              ✔ {WORKFLOW_STEPS[activeWorkflowStep].preview.status}
            </div>
          </div>
        </div>
      </section>

      {/* 3. 6 "WHY QUICKMEDS?" DIFFERENTIATION CARDS */}
      <section
        style={{
          backgroundColor: 'var(--bg-card)',
          padding: '4rem 0',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--secondary-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Key Innovations & Differentiators
            </span>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                marginTop: '4px',
                marginBottom: '0.75rem'
              }}
            >
              Why QuickMeds for Emergency Healthcare?
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
              Built specifically for acute medical urgency with zero inventory drag, statutory safety, and algorithmic resilience.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {WHY_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.75rem',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)'
                  }}
                  className="hover-card"
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-600)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--secondary-50)',
                          color: 'var(--secondary-700)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {card.highlight}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PERFORMANCE BENCHMARKS & STATS */}
      <section className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}
        >
          <div
            style={{
              padding: '2rem 1.5rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              20–30
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Minutes Target ETA
            </span>
          </div>

          <div
            style={{
              padding: '2rem 1.5rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary-600)' }}>
              100%
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Verified Licensed Chemists
            </span>
          </div>

          <div
            style={{
              padding: '2rem 1.5rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>
              30s
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Auto Fallback Failover
            </span>
          </div>

          <div
            style={{
              padding: '2rem 1.5rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#6366f1' }}>
              0 ₹
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Central Warehousing Overhead
            </span>
          </div>
        </div>
      </section>

      {/* 5. SEEDED CUSTOMER REVIEWS */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--primary-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            What Our Users Say
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', marginBottom: '0.5rem' }}>
            Trusted in Times of Urgent Need
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real reviews from emergency medicine delivery cases in Delhi NCR.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {[
            {
              name: 'Rahul Sharma',
              location: 'Connaught Place, New Delhi',
              comment:
                'Needed cardiac medicine urgently at 10 PM. QuickMeds routed to an open Apollo pharmacy 1.2km away and reached my doorstep in 18 minutes. Flawless routing.',
              rating: 5
            },
            {
              name: 'Dr. Priya Patel',
              location: 'Karol Bagh, New Delhi',
              comment:
                'Uploaded a pediatric antibiotic prescription. The pharmacist verified the dosage within 3 minutes and the order was immediately out for delivery. Exceptional safety workflow.',
              rating: 5
            },
            {
              name: 'Amit Verma',
              location: 'South Extension, New Delhi',
              comment:
                'Great multi-item basket handling. When one medicine was out of stock at store A, the smart routing engine suggested an optimal combination instantly.',
              rating: 5
            }
          ].map((rev, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem' }}>
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                    fontStyle: 'italic'
                  }}
                >
                  "{rev.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <h5 style={{ fontSize: '0.875rem', fontWeight: 700 }}>{rev.name}</h5>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {rev.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="container" style={{ maxWidth: '820px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Everything you need to know about QuickMeds architecture, safety, and routing.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform var(--transition-fast)'
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.25rem 1.25rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. PARTNER & EXPLORE CTA SECTION */}
      <section className="container" style={{ marginBottom: '1rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-950) 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
            Empowering Neighborhood Healthcare Infrastructure
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--primary-100)',
              maxWidth: '650px',
              margin: '0 auto 2rem',
              lineHeight: 1.6
            }}
          >
            Digitize local pharmacy stock, connect licensed chemists with nearby patients, and explore our technical architecture and research data.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/medicines')}
              icon={Search}
            >
              Find Medicines
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/architecture')}
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)' }}
            >
              System Architecture →
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/research')}
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)' }}
            >
              Field Research & Survey →
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
