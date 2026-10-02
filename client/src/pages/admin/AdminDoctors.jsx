import React, { useState, useEffect } from 'react';
import { Stethoscope, Search, CheckCircle, Clock, XCircle, AlertTriangle, Shield } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';

const statusFilters = ['ALL', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'];
const statusColors = {
  VERIFIED: { bg: '#d1fae5', text: '#065f46', icon: CheckCircle },
  PENDING: { bg: '#fef3c7', text: '#92400e', icon: Clock },
  REJECTED: { bg: '#fee2e2', text: '#991b1b', icon: XCircle },
  SUSPENDED: { bg: '#fee2e2', text: '#991b1b', icon: AlertTriangle }
};

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, [activeFilter, pagination.page]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagination.page, limit: 20 });
      if (activeFilter !== 'ALL') params.append('status', activeFilter);
      if (search.trim()) params.append('search', search.trim());
      const res = await api.get(`/admin/doctors?${params}`);
      setDoctors(res.data?.doctors || []);
      setPagination(prev => ({ ...prev, ...(res.data?.pagination || {}) }));
    } catch (err) {
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doctorId, status) => {
    const notesInput = status === 'REJECTED' || status === 'SUSPENDED'
      ? prompt(`Enter reason for ${status.toLowerCase()}:`)
      : '';
    if ((status === 'REJECTED' || status === 'SUSPENDED') && notesInput === null) return;

    try {
      setActionLoading(doctorId);
      await api.patch(`/admin/doctors/${doctorId}/verify`, { status, notes: notesInput || '' });
      toast.success(`Doctor ${status.toLowerCase()} successfully`);
      fetchDoctors();
    } catch (err) {
      toast.error(err?.message || `Failed to ${status.toLowerCase()} doctor`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchDoctors();
  };

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Stethoscope size={24} /> Manage Doctors
        </h1>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {pagination.total} doctor{pagination.total !== 1 ? 's' : ''} registered
        </span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or registration number..."
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.875rem', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'var(--primary-600)', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {statusFilters.map(filter => (
          <button
            key={filter}
            onClick={() => { setActiveFilter(filter); setPagination(p => ({ ...p, page: 1 })); }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: activeFilter === filter ? 'var(--primary-600)' : 'var(--border-light)',
              backgroundColor: activeFilter === filter ? 'var(--primary-600)' : 'var(--bg-card)',
              color: activeFilter === filter ? 'white' : 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Doctor List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <Stethoscope size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No doctors found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {doctors.map(doc => {
            const sc = statusColors[doc.verificationStatus] || statusColors.PENDING;
            const StatusIcon = sc.icon;
            return (
              <div key={doc._id} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>Dr. {doc.name}</p>
                      <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <StatusIcon size={12} />
                        {doc.verificationStatus || 'PENDING'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {doc.specialty} • {doc.qualification}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span><Shield size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{doc.registrationNumber}</span>
                      <span>₹{doc.fee}/consultation</span>
                      <span>{doc.experience || 0} yrs exp</span>
                      {doc.email && <span>{doc.email}</span>}
                      {doc.phone && <span>{doc.phone}</span>}
                    </div>
                    {doc.verificationNotes && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                        Admin note: {doc.verificationNotes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {doc.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerify(doc._id, 'VERIFIED')}
                        disabled={actionLoading === doc._id}
                        style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === doc._id ? 0.6 : 1 }}
                      >
                        ✓ Verify
                      </button>
                    )}
                    {doc.verificationStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleVerify(doc._id, 'REJECTED')}
                        disabled={actionLoading === doc._id}
                        style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === doc._id ? 0.6 : 1 }}
                      >
                        ✕ Reject
                      </button>
                    )}
                    {doc.verificationStatus === 'VERIFIED' && (
                      <button
                        onClick={() => handleVerify(doc._id, 'SUSPENDED')}
                        disabled={actionLoading === doc._id}
                        style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === doc._id ? 0.6 : 1 }}
                      >
                        ⏸ Suspend
                      </button>
                    )}
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

export default AdminDoctors;
