import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Clock,
  Video,
  Calendar,
  Filter,
  UserRound,
  Stethoscope,
  Search,
  BadgeCheck,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

const statusColors = {
  REQUESTED: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
  IN_PROGRESS: { bg: '#ede9fe', text: '#5b21b6' },
  COMPLETED: { bg: '#d1fae5', text: '#065f46' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' }
};

// Extract an array from either the new paginated shape ({ doctors: [] }) or a legacy plain array
const toArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload[key])) return payload[key];
  return [];
};

const DoctorConsultation = () => {
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState('find');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [feeFilter, setFeeFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [bookingType, setBookingType] = useState('INSTANT');
  const [scheduledTime, setScheduledTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [myConsultations, setMyConsultations] = useState([]);
  const [myLoading, setMyLoading] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const res = await api.get('/consultations/doctors?limit=100');
      setDoctors(toArray(res?.data, 'doctors'));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      setLoadError(error?.message || 'Unable to load doctors right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyConsultations = async () => {
    try {
      setMyLoading(true);
      const res = await api.get('/consultations/my?limit=50');
      setMyConsultations(toArray(res?.data, 'consultations'));
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setMyConsultations([]);
    } finally {
      setMyLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (activeView === 'mine') fetchMyConsultations();
  }, [activeView]);

  // Build the specialty list from real doctor data so filters always match backend values
  const specialties = useMemo(
    () => ['All', ...Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean))).sort()],
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((d) => {
      if (specialtyFilter !== 'All' && d.specialty !== specialtyFilter) return false;
      if (availFilter === 'AVAILABLE' && d.isAvailable === false) return false;
      if (feeFilter === 'under-500' && d.fee > 500) return false;
      if (feeFilter === '500-1000' && (d.fee < 500 || d.fee > 1000)) return false;
      if (feeFilter === 'above-1000' && d.fee < 1000) return false;
      if (!q) return true;
      return (
        (d.name || '').toLowerCase().includes(q) ||
        (d.specialty || '').toLowerCase().includes(q) ||
        (d.qualification || '').toLowerCase().includes(q)
      );
    });
  }, [doctors, specialtyFilter, search, availFilter, feeFilter]);

  const openBooking = (doc, type) => {
    setSelectedDoc(doc);
    setBookingType(type);
    setScheduledTime('');
    setShowModal(true);
  };

  const confirmBooking = async () => {
    if (!symptoms.trim()) {
      showToast('Please describe your symptoms', 'error');
      return;
    }
    if (bookingType === 'SCHEDULED') {
      if (!scheduledTime) {
        showToast('Please choose a date and time', 'error');
        return;
      }
      if (new Date(scheduledTime) <= new Date()) {
        showToast('Please choose a future date and time', 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      await api.post('/consultations/request', {
        doctorId: selectedDoc._id,
        type: bookingType,
        scheduledTime: bookingType === 'SCHEDULED' ? new Date(scheduledTime).toISOString() : undefined,
        symptoms: symptoms.trim()
      });
      showToast('Consultation requested. The doctor will confirm shortly.', 'success');
      setShowModal(false);
      setSymptoms('');
      setActiveView('mine');
    } catch (error) {
      // Never pretend a booking succeeded
      showToast(error?.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelConsultation = async (id) => {
    const reason = window.prompt('Reason for cancellation (optional):');
    if (reason === null) return;
    try {
      await api.post(`/consultations/${id}/cancel`, { reason });
      showToast('Consultation cancelled', 'success');
      fetchMyConsultations();
    } catch (error) {
      showToast(error?.message || 'Could not cancel consultation', 'error');
    }
  };

  const minDateTime = new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16);

  const tabStyle = (active) => ({
    padding: '8px 20px',
    borderRadius: 'var(--radius-full)',
    border: `1.5px solid ${active ? 'var(--primary-600)' : 'var(--border-medium)'}`,
    backgroundColor: active ? 'var(--primary-600)' : 'var(--bg-card)',
    color: active ? '#ffffff' : 'var(--text-main)',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* 1. Healthcare Trust Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
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
            <ShieldCheck size={14} color="#67e8f9" />
            <span>Verified Healthcare Professionals</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Doctor Video Consultations
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.5 }}>
            Consult board-certified specialists online from the comfort of your home. Receive valid digital prescriptions, lab test recommendations, and care guidance.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.25rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#67e8f9" />
              <span>Registered Medical Practitioners</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#67e8f9" />
              <span>Instant Video & Scheduled Slots</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#67e8f9" />
              <span>Legally Valid Digital Prescriptions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <button type="button" style={tabStyle(activeView === 'find')} onClick={() => setActiveView('find')}>
          Find a Doctor ({filteredDoctors.length})
        </button>
        <button type="button" style={tabStyle(activeView === 'mine')} onClick={() => setActiveView('mine')}>
          My Consultations {myConsultations.length > 0 && `(${myConsultations.length})`}
        </button>
      </div>

      {activeView === 'find' && (
        <>
          {/* Filter Toolbar */}
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Specialty Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
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
                <option value="All">All Specialties</option>
                {specialties.filter(s => s !== 'All').map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Fee Filter */}
            <div>
              <select
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value)}
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
                <option value="All">All Fees</option>
                <option value="under-500">Under ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="above-1000">Above ₹1000</option>
              </select>
            </div>

            {/* Availability Filter Toggle */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setAvailFilter(availFilter === 'AVAILABLE' ? 'All' : 'AVAILABLE')}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: availFilter === 'AVAILABLE' ? '1.5px solid #059669' : '1px solid var(--border-medium)',
                  backgroundColor: availFilter === 'AVAILABLE' ? '#ecfdf5' : 'transparent',
                  color: availFilter === 'AVAILABLE' ? '#047857' : 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span className="pulse-dot-green" />
                Available Now Only
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} style={{ padding: '1.5rem', minHeight: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-subtle)' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ height: '18px', width: '70%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }} />
                      <div style={{ height: '14px', width: '40%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }} />
                    </div>
                  </div>
                  <div style={{ height: '40px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }} />
                </Card>
              ))}
            </div>
          ) : loadError ? (
            <Card style={{ padding: '2.5rem', textAlign: 'center' }}>
              <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '10px' }} />
              <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem' }}>{loadError}</p>
              <Button variant="outline" onClick={fetchDoctors} style={{ marginTop: '12px' }}>Retry</Button>
            </Card>
          ) : filteredDoctors.length === 0 ? (
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <Stethoscope size={44} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 6px 0' }}>
                {doctors.length === 0 ? 'No verified doctors are available at the moment.' : 'No doctors match your filters'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 16px 0' }}>
                Try adjusting your search query, specialty filter, or fee range.
              </p>
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setSpecialtyFilter('All'); setFeeFilter('All'); setAvailFilter('All'); }}>
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredDoctors.map((doc) => (
                <Card
                  key={doc._id}
                  className="card-healthcare"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem'
                  }}
                >
                  <div>
                    {/* Top Row: Avatar & Information */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          flexShrink: 0,
                          backgroundColor: 'var(--primary-50)',
                          borderRadius: '50%',
                          border: '2px solid var(--primary-200)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary-700)',
                          position: 'relative'
                        }}
                      >
                        <UserRound size={34} />
                        {doc.isAvailable !== false && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: '#10b981',
                              border: '2px solid #ffffff'
                            }}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                          <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                            {doc.name}
                          </h3>
                          {doc.verificationStatus === 'VERIFIED' && (
                            <span title="Verified by Medical Council">
                              <BadgeCheck size={18} color="#059669" />
                            </span>
                          )}
                          {doc.isTestData && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                              Test Profile
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.875rem', color: 'var(--primary-700)', fontWeight: 700, marginBottom: '2px' }}>
                          {doc.specialty}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {doc.qualification}
                          {doc.experience ? ` • ${doc.experience} yrs exp` : ''}
                        </div>

                        {Array.isArray(doc.languages) && doc.languages.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <Globe size={12} />
                            <span>{doc.languages.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Strip */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Fee: </span>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>₹{doc.fee}</strong>
                      </div>

                      <div>
                        {doc.isAvailable !== false ? (
                          <span className="badge-available-now">
                            <span className="pulse-dot-green" /> Available Now
                          </span>
                        ) : (
                          <span className="badge-next-available">
                            Next Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Calendar}
                      onClick={() => openBooking(doc, 'SCHEDULED')}
                    >
                      Schedule
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Video}
                      disabled={doc.isAvailable === false}
                      onClick={() => openBooking(doc, 'INSTANT')}
                    >
                      Consult Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeView === 'mine' && (
        myLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <Card key={i} style={{ padding: '1.5rem', minHeight: '100px' }}>
                <div style={{ height: '20px', width: '30%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '14px', width: '50%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }} />
              </Card>
            ))}
          </div>
        ) : myConsultations.length === 0 ? (
          <Card style={{ padding: '3rem', textAlign: 'center' }}>
            <Stethoscope size={44} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 6px 0' }}>No Consultations Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 16px 0' }}>
              You haven't requested any doctor consultations yet. Find a doctor above to get started.
            </p>
            <Button variant="primary" size="sm" onClick={() => setActiveView('find')}>
              Find a Doctor
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myConsultations.map((c) => {
              const sc = statusColors[c.status] || { bg: '#f3f4f6', text: '#374151' };
              const doc = c.doctorId || {};
              const canCancel = c.status === 'REQUESTED' || c.status === 'CONFIRMED';
              return (
                <Card key={c._id} className="card-healthcare" style={{ padding: '1.5rem', borderLeft: `4px solid ${sc.text}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <UserRound size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                          {doc.name || 'Doctor'}
                        </h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--primary-700)', fontWeight: 600, margin: '2px 0 0 0' }}>
                          {doc.specialty || 'General Consultation'} • {c.type === 'SCHEDULED' ? 'Scheduled Video' : 'Instant Video'}
                        </p>
                      </div>
                    </div>

                    <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: sc.bg, color: sc.text, letterSpacing: '0.02em' }}>
                      {(c.status || '').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <Clock size={15} color="var(--text-muted)" />
                    <span>Appointment Time: <strong>{new Date(c.scheduledTime || c.createdAt).toLocaleString()}</strong></span>
                    {c.consultationNumber && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        #{c.consultationNumber}
                      </span>
                    )}
                  </div>

                  {c.symptoms && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Symptoms:</strong> {c.symptoms}
                    </div>
                  )}

                  {c.diagnosis && (
                    <div style={{ fontSize: '0.8125rem', color: '#065f46', marginTop: '8px', padding: '10px 12px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                      <strong style={{ color: '#047857' }}>Diagnosis & Clinical Advice:</strong> {c.diagnosis}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consultation Fee: </span>
                      <strong style={{ color: 'var(--primary-700)', fontSize: '1rem' }}>₹{c.fee || 0}</strong>
                    </div>

                    {canCancel && (
                      <Button variant="ghost" size="sm" onClick={() => cancelConsultation(c._id)} style={{ color: '#ef4444' }}>
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Booking Modal */}
      {showModal && selectedDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {bookingType === 'SCHEDULED' ? 'Scheduled Consultation' : 'Instant Video Call'}
                </span>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)' }}>
                  {selectedDoc.name}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '2px 0 0 0' }}>
                  {selectedDoc.specialty} • ₹{selectedDoc.fee} per consult
                </p>
              </div>
            </div>

            {bookingType === 'SCHEDULED' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 700 }}>
                  Select Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  min={minDateTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none', boxSizing: 'border-box', fontSize: '0.875rem' }}
                />
                {Array.isArray(selectedDoc.availableSlots) && selectedDoc.availableSlots.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Available slots: {selectedDoc.availableSlots.map((s) => `${s.day} (${s.startTime}-${s.endTime})`).join(', ')}
                  </p>
                )}
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 700 }}>
                Describe Symptoms / Medical Concern *
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', minHeight: '100px', fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="E.g., High fever since 2 days, sore throat and mild body ache..."
              />
            </div>

            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', marginBottom: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              🛡️ QuickMeds consultations are conducted securely. For critical or life-threatening emergencies, please dial emergency services (112) or visit the nearest emergency room.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmBooking} disabled={submitting}>
                {submitting ? 'Confirming...' : `Request & Pay ₹${selectedDoc.fee}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorConsultation;
