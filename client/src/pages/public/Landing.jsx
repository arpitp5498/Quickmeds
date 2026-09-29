import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Store,
  Pill,
  Truck,
  Star,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Navigation,
  ChevronDown,
  Smartphone,
  Download,
  QrCode
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import { useLocation } from '../../context/LocationContext';
import EmergencyEssentialsSection from '../../components/emergency/EmergencyEssentialsSection';
import AppDownloadModal from '../../components/common/AppDownloadModal';

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [appDownloadModalOpen, setAppDownloadModalOpen] = useState(false);
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

  const WHY_CARDS = [
    {
      title: 'Neighborhood Pharmacy Network',
      desc: 'QuickMeds partners directly with trusted, licensed chemists in your neighborhood for faster pickup and genuine medicine dispatch.',
      icon: Store,
      highlight: 'Local Chemists'
    },
    {
      title: 'Live Shelf-Stock Verification',
      desc: 'Real-time inventory checks across partner pharmacy shelves ensure that medicines shown as available can be fulfilled immediately.',
      icon: CheckCircle2,
      highlight: 'Real-Time Stock'
    },
    {
      title: 'Fast Hyperlocal Fulfillment',
      desc: 'Intelligent routing selects the closest verified chemist with complete stock to minimize transit time and dispatch rapidly.',
      icon: Clock,
      highlight: 'Fastest Route'
    },
    {
      title: 'Pharmacist-Verified Safety',
      desc: 'Every prescription undergoes mandatory verification by a licensed pharmacist before packing, ensuring patient safety.',
      icon: ShieldCheck,
      highlight: '100% Compliant'
    },
    {
      title: 'Guaranteed Order Continuity',
      desc: 'If an assigned pharmacy is temporarily unavailable, your order automatically reroutes to the next closest partner pharmacy.',
      icon: RefreshCw,
      highlight: 'Zero Delays'
    },
    {
      title: 'Live Real-Time Tracking',
      desc: 'Full GPS tracking from pharmacy counter to doorstep with rider updates, route status, and transparent target delivery ETAs.',
      icon: Navigation,
      highlight: '20-30 Min Target'
    }
  ];

  const FAQS = [
    {
      q: 'What is QuickMeds and how does it deliver so quickly?',
      a: 'QuickMeds is an emergency healthcare logistics platform connecting patients directly with licensed retail pharmacies in their neighborhood for verified, rapid doorstep delivery.'
    },
    {
      q: 'How does QuickMeds find the best pharmacy for my medicines?',
      a: 'When you place an order, QuickMeds matches you with the nearest licensed pharmacy having 100% genuine stock available, ensuring immediate dispatch and fast delivery.'
    },
    {
      q: 'What happens if a partner pharmacy is temporarily unavailable?',
      a: 'Our fulfillment system automatically shifts your order to the next closest verified pharmacy so your emergency delivery is never halted or delayed.'
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
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
                  onClick={() => navigate('/emergency')}
                  icon={AlertTriangle}
                >
                  SOS Essentials
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
                      Express Doorstep Delivery
                    </p>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      Verified Chemists • Fast Dispatch • Pharmacist Verified
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
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
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              24/7
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Emergency Fulfillment
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
              Genuine Medicines
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
            Everything you need to know about QuickMeds delivery, safety, and order fulfillment.
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

      {/* 6.5 MOBILE APP DOWNLOAD SHOWCASE */}
      <section className="container" id="mobile-app" style={{ scrollMarginTop: '80px', marginBottom: '3rem' }}>
        <div
          className="mobile-app-showcase-card"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decorative glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              transform: 'translate(20%, -20%)',
              background: 'radial-gradient(circle, rgba(2, 132, 199, 0.35) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Left: Heading, Value Props & Actions */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px' }}>
                <Smartphone size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#e0f2fe' }}>
                  Mobile App & Instant PWA
                </span>
              </div>

              <h2 style={{ fontSize: '2.125rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '1rem' }}>
                Get QuickMeds on Your Phone
              </h2>

              <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.75rem', maxWidth: '520px' }}>
                Order emergency medicines in seconds, receive audible 10-second dispatch alerts, track rider GPS in real time, and verify handovers securely with 4-digit OTP.
              </p>

              {/* 4 Feature Bullet Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginBottom: '2rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#f1f5f9' }}>1-Tap Instant Install (0 MB)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#f1f5f9' }}>Audible 10s Sound Alarms</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#f1f5f9' }}>Live Rider GPS Tracking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#f1f5f9' }}>Works Offline & On Low Network</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="primary"
                  size="lg"
                  icon={Download}
                  onClick={() => setAppDownloadModalOpen(true)}
                  style={{
                    backgroundColor: '#0284c7',
                    boxShadow: '0 4px 16px rgba(2, 132, 199, 0.5)',
                    fontWeight: 700
                  }}
                >
                  Download / Install App
                </Button>

                <button
                  type="button"
                  onClick={() => setAppDownloadModalOpen(true)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>🍏 iPhone (Add to Home)</span>
                </button>
              </div>
            </div>

            {/* Right: QR Scan Card */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '20px',
                  padding: '24px',
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  maxWidth: '280px',
                  width: '100%',
                  border: '3px solid rgba(255, 255, 255, 0.9)'
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0f9ff', color: '#0284c7', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
                  <QrCode size={14} />
                  <span>Scan to Open App</span>
                </div>

                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'inline-block',
                    marginBottom: '12px'
                  }}
                >
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fquickmedss.vercel.app&color=0284c7"
                    alt="Scan QuickMeds App"
                    width={160}
                    height={160}
                    style={{ display: 'block', borderRadius: '6px' }}
                  />
                </div>

                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                  Point your camera here
                </p>
                <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: 0 }}>
                  Instantly open or install QuickMeds on any smartphone
                </p>
              </div>
            </div>
          </div>
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
            Empowering neighborhood pharmacies, connecting licensed chemists with nearby patients, and delivering verified medicines in minutes.
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
              onClick={() => navigate('/pharmacy-network')}
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)' }}
            >
              Explore Partner Pharmacies →
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/emergency')}
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)' }}
            >
              Emergency Care SOS →
            </Button>
          </div>
        </div>
      </section>

      {/* Mobile App Download Modal */}
      <AppDownloadModal
        isOpen={appDownloadModalOpen}
        onClose={() => setAppDownloadModalOpen(false)}
      />
    </div>
  );
};

export default Landing;
