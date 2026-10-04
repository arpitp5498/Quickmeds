import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Clock,
  Droplets,
  Search,
  TestTubes,
  AlertCircle,
  Download,
  ShieldCheck,
  CheckCircle2,
  Home,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  BOOKED: { bg: '#dbeafe', text: '#1e40af' },
  SAMPLE_COLLECTED: { bg: '#ede9fe', text: '#5b21b6' },
  PROCESSING: { bg: '#ffedd5', text: '#9a3412' },
  REPORT_READY: { bg: '#d1fae5', text: '#065f46' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' }
};

const SLOTS = [
  { value: '6-8 AM', label: '6:00 AM - 8:00 AM' },
  { value: '8-10 AM', label: '8:00 AM - 10:00 AM' },
  { value: '10-12 PM', label: '10:00 AM - 12:00 PM' }
];

// Extract an array from either the new paginated shape ({ tests: [] }) or a legacy plain array
const toArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload[key])) return payload[key];
  return [];
};

const formatReportTime = (test) => {
  if (test.reportTimeHours) return `${test.reportTimeHours} hours`;
  if (test.reportTime) return test.reportTime;
  return '—';
};

const LabTests = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('browse');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const res = await api.get('/lab-tests?limit=100');
      setTests(toArray(res?.data, 'tests'));
    } catch (error) {
      console.error('Error fetching tests:', error);
      setTests([]);
      setLoadError(error?.message || 'Unable to load lab tests right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await api.get('/lab-tests/bookings/my?limit=50');
      setBookings(toArray(res?.data, 'bookings'));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (activeView === 'mine') fetchBookings();
  }, [activeView]);

  // Categories come from real catalog data so tabs always match backend values
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(tests.map((t) => t.category).filter(Boolean))).sort()],
    [tests]
  );

  const filteredTests = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = tests.filter((t) => {
      if (activeCategory !== 'All' && t.category !== activeCategory) return false;
      if (!q) return true;
      return (t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    });
    if (sortBy === 'price_asc') list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === 'price_desc') list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    return list;
  }, [tests, activeCategory, search, sortBy]);

  const handleBook = (test) => {
    setSelectedTest(test);
    setDate('');
    setSlot('');
    setPatientName(user?.name || '');
    setShowModal(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const confirmBooking = async () => {
    if (!date || !slot) {
      showToast('Please select a date and time slot', 'error');
      return;
    }
    if (date < todayStr) {
      showToast('Please select today or a future date', 'error');
      return;
    }
    if (!street.trim() || !city.trim() || !/^\d{6}$/.test(pincode.trim())) {
      showToast('Please enter a complete address with a valid 6-digit pincode', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/lab-tests/bookings', {
        tests: [{ testId: selectedTest._id }],
        scheduledDate: date,
        scheduledSlot: slot,
        address: { label: 'Home', street: street.trim(), city: city.trim(), pincode: pincode.trim() },
        patientDetails: {
          name: patientName.trim() || user?.name || '',
          age: patientAge ? Number(patientAge) : undefined,
          gender: patientGender
        }
      });
      const bookingNumber = res?.data?.bookingNumber;
      showToast(bookingNumber ? `Lab test booked. Booking #${bookingNumber}` : 'Lab test booked successfully', 'success');
      setShowModal(false);
      setActiveView('mine');
    } catch (error) {
      // Never pretend a booking succeeded
      showToast(error?.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async (id) => {
    const reason = window.prompt('Reason for cancellation (optional):');
    if (reason === null) return;
    try {
      await api.post(`/lab-tests/bookings/${id}/cancel`, { reason });
      showToast('Lab booking cancelled', 'success');
      fetchBookings();
    } catch (error) {
      showToast(error?.message || 'Could not cancel booking', 'error');
    }
  };

  const pillStyle = (active) => ({
    padding: '8px 20px',
    borderRadius: 'var(--radius-full)',
    border: `1.5px solid ${active ? '#059669' : 'var(--border-medium)'}`,
    backgroundColor: active ? '#059669' : 'var(--bg-card)',
    color: active ? '#ffffff' : 'var(--text-main)',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
  });

  const categoryPillStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    border: `1px solid ${active ? '#059669' : 'var(--border-medium)'}`,
    backgroundColor: active ? '#ecfdf5' : 'var(--bg-card)',
    color: active ? '#065f46' : 'var(--text-secondary)',
    fontWeight: active ? 700 : 500,
    fontSize: '0.8125rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  });

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '0.875rem' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 700 };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* 1. Healthcare Diagnostic Trust Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 1.75rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              backdropFilter: 'blur(4px)'
            }}
          >
            <ShieldCheck size={14} color="#a7f3d0" />
            <span>NABL Certified Diagnostic Partners</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Diagnostic & Blood Tests at Home
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.5 }}>
            Book clinical lab checkups with doorstep sample collection by vaccinated, certified phlebotomists. 100% verified digital reports delivered securely in 24–48 hours.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.25rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#a7f3d0" />
              <span>Free Doorstep Collection</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#a7f3d0" />
              <span>Certified Phlebotomists</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#a7f3d0" />
              <span>Accurate Digital Pathology Reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <button type="button" style={pillStyle(activeView === 'browse')} onClick={() => setActiveView('browse')}>
          Browse Tests ({filteredTests.length})
        </button>
        <button type="button" style={pillStyle(activeView === 'mine')} onClick={() => setActiveView('mine')}>
          My Bookings {bookings.length > 0 && `(${bookings.length})`}
        </button>
      </div>

      {activeView === 'browse' && (
        <>
          {/* Search & Sort Bar */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blood tests, thyroid, lipid, diabetes..."
                style={{ ...inputStyle, padding: '9px 12px 9px 36px' }}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              <option value="">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '1.5rem',
              scrollbarWidth: 'none'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={categoryPillStyle(activeCategory === cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} style={{ padding: '1.5rem', minHeight: '220px' }}>
                  <div style={{ height: '22px', width: '60%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '10px' }} />
                  <div style={{ height: '14px', width: '90%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ height: '14px', width: '40%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }} />
                </Card>
              ))}
            </div>
          ) : loadError ? (
            <Card style={{ padding: '2.5rem', textAlign: 'center' }}>
              <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '10px' }} />
              <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem' }}>{loadError}</p>
              <Button variant="outline" onClick={fetchTests} style={{ marginTop: '12px' }}>Retry</Button>
            </Card>
          ) : filteredTests.length === 0 ? (
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <TestTubes size={44} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 6px 0' }}>
                {tests.length === 0 ? 'No diagnostic tests are available at the moment.' : 'No tests match your search'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 16px 0' }}>
                Try searching for CBC, Thyroid, Blood Glucose, or reset your category filter.
              </p>
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setActiveCategory('All'); setSortBy(''); }}>
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredTests.map((test) => (
                <Card
                  key={test._id}
                  className="card-healthcare"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%'
                  }}
                >
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        {test.name}
                      </h3>
                      {test.isTestData && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', flexShrink: 0 }}>
                          Staging Test
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Home size={12} /> Home Collection
                      </span>
                      {test.category && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                          {test.category}
                        </span>
                      )}
                    </div>

                    {test.description && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                        {test.description}
                      </p>
                    )}

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '16px',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                        <Droplets size={14} color="#059669" />
                        <span><strong>{test.sampleType || 'Blood'}</strong> Sample</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                        <Clock size={14} color="#059669" />
                        <span>Report in <strong>{formatReportTime(test)}</strong></span>
                      </div>
                      {(test.preparationInstructions || test.preparation) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.75rem', color: '#92400e', gridColumn: '1 / -1', marginTop: '2px' }}>
                          <Activity size={14} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
                          <span><strong>Prep:</strong> {test.preparationInstructions || test.preparation}</span>
                        </div>
                      )}
                    </div>

                    {Array.isArray(test.parametersIncluded) && test.parametersIncluded.length > 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Includes: {test.parametersIncluded.slice(0, 5).join(', ')}
                        {test.parametersIncluded.length > 5 ? ` +${test.parametersIncluded.length - 5} more` : ''}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Test Price: </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{test.price}</span>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => handleBook(test)}>
                      Book Test
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeView === 'mine' && (
        bookingsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <Card key={i} style={{ padding: '1.5rem', minHeight: '100px' }}>
                <div style={{ height: '20px', width: '30%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '14px', width: '50%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }} />
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card style={{ padding: '3rem', textAlign: 'center' }}>
            <TestTubes size={44} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 6px 0' }}>No Lab Bookings Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 16px 0' }}>
              You haven't scheduled any diagnostic tests yet. Browse tests to book a sample collection.
            </p>
            <Button variant="primary" size="sm" onClick={() => setActiveView('browse')}>
              Browse Tests
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map((b) => {
              const sc = statusColors[b.status] || { bg: '#f3f4f6', text: '#374151' };
              const canCancel = b.status === 'BOOKED';
              return (
                <Card key={b._id} className="card-healthcare" style={{ padding: '1.5rem', borderLeft: `4px solid ${sc.text}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        {(b.tests || []).map((t) => t.name).join(', ') || 'Diagnostic Lab Test'}
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        Scheduled for: <strong>{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : ''} ({b.scheduledSlot})</strong>
                        {b.bookingNumber ? ` • Booking #${b.bookingNumber}` : ''}
                      </p>
                    </div>
                    <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: sc.bg, color: sc.text }}>
                      {(b.status || '').replace(/_/g, ' ')}
                    </span>
                  </div>

                  {b.status === 'BOOKED' && b.collectionOTP && (
                    <div style={{ fontSize: '0.8125rem', color: '#065f46', backgroundColor: '#ecfdf5', padding: '8px 12px', borderRadius: 'var(--radius-md)', margin: '10px 0', border: '1px solid #a7f3d0' }}>
                      🔑 Phlebotomist Collection OTP: <strong style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>{b.collectionOTP}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                        Provide this OTP to the health technician only when they arrive at your home.
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount: </span>
                      <strong style={{ color: '#059669', fontSize: '1.0625rem' }}>₹{b.totalAmount || 0}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {b.status === 'REPORT_READY' && b.reportUrl && (
                        <a
                          href={b.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.8125rem',
                            fontWeight: 700
                          }}
                        >
                          <Download size={14} /> Download Verified Report
                        </a>
                      )}
                      {canCancel && (
                        <Button variant="ghost" size="sm" onClick={() => cancelBooking(b._id)} style={{ color: '#ef4444' }}>
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Booking Modal */}
      {showModal && selectedTest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-light)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Diagnostic Home Collection
              </span>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)' }}>
                {selectedTest.name}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '2px 0 0 0' }}>
                {selectedTest.sampleType || 'Blood'} sample • Report in {formatReportTime(selectedTest)} • ₹{selectedTest.price}
              </p>
            </div>

            {(selectedTest.preparationInstructions || selectedTest.preparation) && (
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.8125rem', marginBottom: '1.25rem', border: '1px solid #fde68a' }}>
                <strong>⚠️ Preparation Required:</strong> {selectedTest.preparationInstructions || selectedTest.preparation}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Patient Name</label>
                <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={inputStyle} placeholder="Full name" />
              </div>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" min="0" max="120" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} style={inputStyle} placeholder="Years" />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} style={inputStyle}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Select Collection Date</label>
                <input type="date" min={todayStr} value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Preferred Time Slot</label>
                <select value={slot} onChange={(e) => setSlot(e.target.value)} style={inputStyle}>
                  <option value="">Select slot...</option>
                  {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Doorstep Collection Address</label>
              <textarea value={street} onChange={(e) => setStreet(e.target.value)} rows={2} style={inputStyle} placeholder="House / Flat / Floor, Building name, Street, Landmark" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} placeholder="E.g. New Delhi" />
              </div>
              <div>
                <label style={labelStyle}>Pincode</label>
                <input type="text" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} style={inputStyle} placeholder="6-digit pincode" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmBooking} disabled={submitting}>
                {submitting ? 'Booking Collection...' : `Confirm Home Collection — ₹${selectedTest.price}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;
