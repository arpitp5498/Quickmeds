import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, CheckCircle, XCircle, PlayCircle, Filter } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';

const statusTabs = [
  { key: '', label: 'All' },
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' }
];

const statusColors = {
  REQUESTED: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
  IN_PROGRESS: { bg: '#ede9fe', text: '#5b21b6' },
  COMPLETED: { bg: '#d1fae5', text: '#065f46' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' }
};

const DoctorAppointments = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const { showToast } = useToast();
  const toast = { success: (m) => showToast(m, 'success'), error: (m) => showToast(m, 'error') };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab, pagination.page]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagination.page, limit: 20 });
      if (activeTab) params.append('status', activeTab);
      const res = await api.get(`/consultations/doctor/appointments?${params}`);
      setConsultations(res.data?.consultations || []);
      setPagination(prev => ({ ...prev, ...(res.data?.pagination || {}) }));
    } catch (err) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/consultations/${id}/status`, { status });
      toast.success(`Consultation ${status.toLowerCase().replace('_', ' ')}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
        My Appointments
      </h1>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPagination(p => ({ ...p, page: 1 })); }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: activeTab === tab.key ? 'var(--primary-600)' : 'var(--border-light)',
              backgroundColor: activeTab === tab.key ? 'var(--primary-600)' : 'var(--bg-card)',
              color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : consultations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <CalendarCheck size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No appointments found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {consultations.map(c => {
            const sc = statusColors[c.status] || { bg: '#f3f4f6', text: '#374151' };
            return (
              <div key={c._id} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <Link to={`/doctor/appointments/${c._id}`} style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', textDecoration: 'none' }}>
                      {c.patientId?.name || 'Patient'}
                    </Link>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {c.type === 'INSTANT' ? '⚡ Instant' : '📅 Scheduled'} •{' '}
                      {new Date(c.scheduledTime || c.createdAt).toLocaleDateString()} at{' '}
                      {new Date(c.scheduledTime || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                {c.symptoms && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px', padding: '8px 12px', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
                    <strong>Symptoms:</strong> {c.symptoms}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-600)' }}>
                    ₹{c.fee || 0}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {c.status === 'REQUESTED' && (
                      <>
                        <button onClick={() => updateStatus(c._id, 'CONFIRMED')} style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                          ✓ Confirm
                        </button>
                        <button onClick={() => updateStatus(c._id, 'CANCELLED')} style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                          ✕ Decline
                        </button>
                      </>
                    )}
                    {c.status === 'CONFIRMED' && (
                      <button onClick={() => updateStatus(c._id, 'IN_PROGRESS')} style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                        ▶ Start Consultation
                      </button>
                    )}
                    {c.status === 'IN_PROGRESS' && (
                      <Link to={`/doctor/appointments/${c._id}`} style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: 'var(--primary-600)', color: 'white', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}>
                        📝 Add Notes & Complete
                      </Link>
                    )}
                    <Link to={`/doctor/appointments/${c._id}`} style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid var(--border-light)' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: pagination.page === i + 1 ? 'var(--primary-600)' : 'var(--border-light)',
                backgroundColor: pagination.page === i + 1 ? 'var(--primary-600)' : 'var(--bg-card)',
                color: pagination.page === i + 1 ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
