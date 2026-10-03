import React, { useState, useEffect, useMemo } from 'react';
import { Star, Clock, Video, Calendar, Filter, UserRound, Stethoscope, Search, BadgeCheck, AlertCircle } from 'lucide-react';
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
      if (!q) return true;
      return (
        (d.name || '').toLowerCase().includes(q) ||
        (d.specialty || '').toLowerCase().includes(q) ||
        (d.qualification || '').toLowerCase().includes(q)
      );
    });
  }, [doctors, specialtyFilter, search]);

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
    padding: '8px 18px',
    borderRadius: 'var(--radius-full)',
    border: `1px solid ${active ? 'var(--primary-600)' : 'var(--border-medium)'}`,
    backgroundColor: active ? 'var(--primary-600)' : 'var(--bg-card)',
    color: active ? '#ffffff' : 'var(--text-main)',
    fontWeight: 600,
    cursor: 'pointer'
  });

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Online Doctor Consultation
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Consult registered doctors online. Prescriptions are issued only by the consulting doctor.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <button type="button" style={tabStyle(activeView === 'find')} onClick={() => setActiveView('find')}>Find a Doctor</button>
        <button type="button" style={tabStyle(activeView === 'mine')} onClick={() => setActiveView('mine')}>My Consultations</button>
      </div>

      {activeView === 'find' && (
        <>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={20} color="var(--text-muted)" />
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none' }}
              >
                {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading doctors...</p>
          ) : loadError ? (
            <Card style={{ padding: '2rem', textAlign: 'center' }}>
              <AlertCircle size={36} color="#ef4444" style={{ marginBottom: '8px' }} />
              <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{loadError}</p>
              <Button variant="outline" onClick={fetchDoctors} style={{ marginTop: '12px' }}>Retry</Button>
            </Card>
          ) : filteredDoctors.length === 0 ? (
            <Card style={{ padding: '2rem', textAlign: 'center' }}>
              <Stethoscope size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
              <p style={{ color: 'var(--text-muted)' }}>
                {doctors.length === 0 ? 'No verified doctors are available at the moment.' : 'No doctors match your search.'}
              </p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredDoctors.map((doc) => (
                <Card key={doc._id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', flexShrink: 0, backgroundColor: 'var(--primary-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)' }}>
                      <UserRound size={32} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {doc.name}
                        {doc.verificationStatus === 'VERIFIED' && <BadgeCheck size={18} color="#10b981" aria-label="Verified doctor" />}
                        {doc.isTestData && (
                          <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                            Test Profile
                          </span>
                        )}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--primary-600)', fontWeight: 600, margin: '0 0 4px 0' }}>{doc.specialty}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        {doc.qualification}
                        {doc.experience ? ` • ${doc.experience} yrs experience` : ''}
                      </p>
                      {Array.isArray(doc.languages) && doc.languages.length > 0 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                          Speaks: {doc.languages.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={16} color="#f59e0b" fill="#f59e0b" />
                      <span>{doc.rating ?? '—'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Stethoscope size={16} />
                      <span>₹{doc.fee}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={16} />
                      <span>{doc.isAvailable === false ? 'Unavailable' : 'Available'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" fullWidth icon={Calendar} onClick={() => openBooking(doc, 'SCHEDULED')}>Schedule</Button>
                    <Button variant="primary" fullWidth icon={Video} disabled={doc.isAvailable === false} onClick={() => openBooking(doc, 'INSTANT')}>Consult Now</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeView === 'mine' && (
        myLoading ? (
          <p>Loading your consultations...</p>
        ) : myConsultations.length === 0 ? (
          <Card style={{ padding: '2rem', textAlign: 'center' }}>
            <Stethoscope size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <p style={{ color: 'var(--text-muted)' }}>You have no consultations yet.</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myConsultations.map((c) => {
              const sc = statusColors[c.status] || { bg: '#f3f4f6', text: '#374151' };
              const doc = c.doctorId || {};
              const canCancel = c.status === 'REQUESTED' || c.status === 'CONFIRMED';
              return (
                <Card key={c._id} style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0 }}>{doc.name || 'Doctor'}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        {doc.specialty || ''} • {c.type === 'SCHEDULED' ? 'Scheduled' : 'Instant'} •{' '}
                        {new Date(c.scheduledTime || c.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                      {(c.status || '').replace('_', ' ')}
                    </span>
                  </div>
                  {c.symptoms && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '10px 0 0 0' }}>
                      <strong>Symptoms:</strong> {c.symptoms}
                    </p>
                  )}
                  {c.diagnosis && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', margin: '6px 0 0 0' }}>
                      <strong>Diagnosis:</strong> {c.diagnosis}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>₹{c.fee || 0}</span>
                    {canCancel && (
                      <Button variant="ghost" onClick={() => cancelConsultation(c._id)}>Cancel</Button>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {bookingType === 'SCHEDULED' ? 'Schedule Consultation' : 'Consult Now'}
            </h2>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>With {selectedDoc.name} ({selectedDoc.specialty})</p>

            {bookingType === 'SCHEDULED' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Preferred date & time</label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  min={minDateTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none', boxSizing: 'border-box' }}
                />
                {Array.isArray(selectedDoc.availableSlots) && selectedDoc.availableSlots.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Usual hours: {selectedDoc.availableSlots.map((s) => `${s.day} ${s.startTime}-${s.endTime}`).join(', ')}
                  </p>
                )}
              </div>
            )}

            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Please describe your symptoms</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', minHeight: '100px', marginBottom: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
              placeholder="E.g., Fever and headache since yesterday..."
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              For medical emergencies, call 112 or visit the nearest hospital. Online consultation is not a substitute for emergency care.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
              <Button variant="primary" onClick={confirmBooking} disabled={submitting}>
                {submitting ? 'Requesting...' : `Request Consultation - ₹${selectedDoc.fee}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorConsultation;
