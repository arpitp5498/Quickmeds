import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Clock, Droplets, Search, TestTubes, AlertCircle, Download } from 'lucide-react';
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
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    border: `1px solid ${active ? 'var(--primary-600)' : 'var(--border-medium)'}`,
    backgroundColor: active ? 'var(--primary-600)' : 'var(--bg-card)',
    color: active ? '#ffffff' : 'var(--text-main)',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  });

  const inputStyle = { width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Lab Tests at Home
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Book diagnostic tests with home sample collection.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <button type="button" style={pillStyle(activeView === 'browse')} onClick={() => setActiveView('browse')}>Browse Tests</button>
        <button type="button" style={pillStyle(activeView === 'mine')} onClick={() => setActiveView('mine')}>My Bookings</button>
      </div>

      {activeView === 'browse' && (
        <>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests..."
                style={{ ...inputStyle, padding: '8px 12px 8px 34px' }}
              />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none' }}>
              <option value="">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button key={cat} type="button" onClick={() => setActiveCategory(cat)} style={pillStyle(activeCategory === cat)}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <p>Loading lab tests...</p>
          ) : loadError ? (
            <Card style={{ padding: '2rem', textAlign: 'center' }}>
              <AlertCircle size={36} color="#ef4444" style={{ marginBottom: '8px' }} />
              <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{loadError}</p>
              <Button variant="outline" onClick={fetchTests} style={{ marginTop: '12px' }}>Retry</Button>
            </Card>
          ) : filteredTests.length === 0 ? (
            <Card style={{ padding: '2rem', textAlign: 'center' }}>
              <TestTubes size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
              <p style={{ color: 'var(--text-muted)' }}>
                {tests.length === 0 ? 'No lab tests are available at the moment.' : 'No tests match your search.'}
              </p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredTests.map((test) => (
                <Card key={test._id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {test.name}
                      {test.isTestData && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                          Staging Test
                        </span>
                      )}
                    </h3>
                    {test.description && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>{test.description}</p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                        <Droplets size={16} color="var(--primary-500)" />
                        <span>{test.sampleType || 'Blood'} Sample</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                        <Clock size={16} color="var(--primary-500)" />
                        <span>Report in {formatReportTime(test)}</span>
                      </div>
                      {(test.preparationInstructions || test.preparation) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-main)', gridColumn: '1 / -1' }}>
                          <Activity size={16} color="var(--primary-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>Preparation: {test.preparationInstructions || test.preparation}</span>
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

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: 'auto' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{test.price}</div>
                    <Button variant="primary" onClick={() => handleBook(test)}>Book Now</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeView === 'mine' && (
        bookingsLoading ? (
          <p>Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <Card style={{ padding: '2rem', textAlign: 'center' }}>
            <TestTubes size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <p style={{ color: 'var(--text-muted)' }}>You have no lab bookings yet.</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.map((b) => {
              const sc = statusColors[b.status] || { bg: '#f3f4f6', text: '#374151' };
              const canCancel = b.status === 'BOOKED';
              return (
                <Card key={b._id} style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0 }}>{(b.tests || []).map((t) => t.name).join(', ') || 'Lab Tests'}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : ''} ({b.scheduledSlot})
                        {b.bookingNumber ? ` • #${b.bookingNumber}` : ''}
                      </p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                      {(b.status || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  {b.status === 'BOOKED' && b.collectionOTP && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', margin: '10px 0 0 0' }}>
                      Sample collection OTP: <strong>{b.collectionOTP}</strong> (share only with the phlebotomist at collection)
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>₹{b.totalAmount || 0}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {b.status === 'REPORT_READY' && b.reportUrl && (
                        <a href={b.reportUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', backgroundColor: '#10b981', color: 'white', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}>
                          <Download size={14} /> Download Report
                        </a>
                      )}
                      {canCancel && (
                        <Button variant="ghost" onClick={() => cancelBooking(b._id)}>Cancel</Button>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Book {selectedTest.name}</h2>

            {(selectedTest.preparationInstructions || selectedTest.preparation) && (
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                <strong>Preparation:</strong> {selectedTest.preparationInstructions || selectedTest.preparation}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Patient Name</label>
                <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" min="0" max="120" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} style={inputStyle}>
                  <option value="">—</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Select Date</label>
                <input type="date" min={todayStr} value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Time Slot</label>
                <select value={slot} onChange={(e) => setSlot(e.target.value)} style={inputStyle}>
                  <option value="">Select a slot...</option>
                  {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Collection Address</label>
              <textarea value={street} onChange={(e) => setStreet(e.target.value)} rows={2} style={inputStyle} placeholder="House / flat, street, landmark" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} placeholder="City" />
              <input type="text" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} style={inputStyle} placeholder="Pincode" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
              <Button variant="primary" onClick={confirmBooking} disabled={submitting}>
                {submitting ? 'Booking...' : `Book - ₹${selectedTest.price}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;
