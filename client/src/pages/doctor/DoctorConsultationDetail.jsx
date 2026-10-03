import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, FileText, TestTubes, Calendar, CheckCircle, Save } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';

const statusColors = {
  REQUESTED: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
  IN_PROGRESS: { bg: '#ede9fe', text: '#5b21b6' },
  COMPLETED: { bg: '#d1fae5', text: '#065f46' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' }
};

const DoctorConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const toast = { success: (m) => showToast(m, 'success'), error: (m) => showToast(m, 'error') };
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    fetchConsultation();
  }, [id]);

  const fetchConsultation = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/consultations/${id}`);
      const c = res.data;
      setConsultation(c);
      setNotes(c.notes || '');
      setDiagnosis(c.diagnosis || '');
      setFollowUpDate(c.followUpDate ? new Date(c.followUpDate).toISOString().split('T')[0] : '');
    } catch (err) {
      toast.error('Failed to load consultation');
      navigate('/doctor/appointments');
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    try {
      setSaving(true);
      await api.put(`/consultations/${id}/notes`, {
        notes,
        diagnosis,
        followUpDate: followUpDate || undefined
      });
      toast.success('Notes saved successfully');
      fetchConsultation();
    } catch (err) {
      toast.error(err?.message || 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.put(`/consultations/${id}/status`, { status, notes });
      toast.success(`Consultation ${status.toLowerCase().replace('_', ' ')}`);
      fetchConsultation();
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  const issuePrescription = async () => {
    try {
      await api.post(`/consultations/${id}/prescription`, {
        medicines: [],
        instructions: `Diagnosis: ${diagnosis}\n\nNotes: ${notes}\n\nFollow-up: ${followUpDate || 'As needed'}`
      });
      toast.success('Prescription issued and consultation completed');
      fetchConsultation();
    } catch (err) {
      toast.error(err?.message || 'Failed to issue prescription');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>;
  }

  if (!consultation) return null;

  const sc = statusColors[consultation.status] || { bg: '#f3f4f6', text: '#374151' };
  const patient = consultation.patientId || {};
  const doctor = consultation.doctorId || {};

  return (
    <div style={{ padding: '24px 16px', maxWidth: '900px' }}>
      {/* Back Button */}
      <button onClick={() => navigate('/doctor/appointments')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Appointments
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Consultation {consultation.consultationNumber || ''}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {consultation.type === 'INSTANT' ? '⚡ Instant' : '📅 Scheduled'} •{' '}
            {new Date(consultation.scheduledTime || consultation.createdAt).toLocaleString()}
          </p>
        </div>
        <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
          {consultation.status.replace('_', ' ')}
        </span>
      </div>

      {/* Patient Info Card */}
      <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} /> Patient Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</span>
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{patient.name || 'N/A'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</span>
            <p style={{ color: 'var(--text-main)' }}>{patient.email || 'N/A'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</span>
            <p style={{ color: 'var(--text-main)' }}>{patient.phone || 'N/A'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fee</span>
            <p style={{ fontWeight: 600, color: 'var(--primary-600)' }}>₹{consultation.fee || 0}</p>
          </div>
        </div>
      </div>

      {/* Symptoms */}
      {consultation.symptoms && (
        <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            Symptoms Reported
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{consultation.symptoms}</p>
        </div>
      )}

      {/* Notes & Diagnosis (Editable) */}
      <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} /> Clinical Notes
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Diagnosis
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Enter diagnosis..."
            disabled={consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED'}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Consultation Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write consultation notes, instructions, recommendations..."
            rows={5}
            disabled={consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED'}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Follow-up Date
          </label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            disabled={consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED'}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }}
          />
        </div>

        {consultation.status !== 'COMPLETED' && consultation.status !== 'CANCELLED' && (
          <button onClick={saveNotes} disabled={saving} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'var(--primary-600)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Notes'}
          </button>
        )}
      </div>

      {/* Status History */}
      {consultation.statusHistory && consultation.statusHistory.length > 0 && (
        <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} /> Status Timeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {consultation.statusHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingLeft: '12px', borderLeft: '2px solid var(--primary-200)' }}>
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>{h.status}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(h.timestamp).toLocaleString()} {h.note ? `• ${h.note}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
        {consultation.status === 'REQUESTED' && (
          <>
            <button onClick={() => updateStatus('CONFIRMED')} style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              ✓ Confirm Appointment
            </button>
            <button onClick={() => updateStatus('CANCELLED')} style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              ✕ Decline
            </button>
          </>
        )}
        {consultation.status === 'CONFIRMED' && (
          <button onClick={() => updateStatus('IN_PROGRESS')} style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            ▶ Start Consultation
          </button>
        )}
        {consultation.status === 'IN_PROGRESS' && (
          <>
            <button onClick={issuePrescription} style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> Issue Prescription & Complete
            </button>
            <button onClick={() => updateStatus('COMPLETED')} style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: 'var(--primary-600)', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              Complete (No Prescription)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorConsultationDetail;
