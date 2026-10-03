import React, { useState, useEffect } from 'react';
import { Stethoscope, TestTubes, FileText, ShoppingBag, Download, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';

const tabs = [
  { key: 'consultations', label: 'Consultations', icon: Stethoscope },
  { key: 'lab-reports', label: 'Lab Reports', icon: TestTubes },
  { key: 'prescriptions', label: 'Prescriptions', icon: FileText },
  { key: 'orders', label: 'Medicine Orders', icon: ShoppingBag }
];

const statusColors = {
  REQUESTED: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
  IN_PROGRESS: { bg: '#ede9fe', text: '#5b21b6' },
  COMPLETED: { bg: '#d1fae5', text: '#065f46' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
  BOOKED: { bg: '#dbeafe', text: '#1e40af' },
  SAMPLE_COLLECTED: { bg: '#ede9fe', text: '#5b21b6' },
  PROCESSING: { bg: '#fef3c7', text: '#92400e' },
  REPORT_READY: { bg: '#d1fae5', text: '#065f46' },
  PLACED: { bg: '#dbeafe', text: '#1e40af' },
  DELIVERED: { bg: '#d1fae5', text: '#065f46' },
  APPROVED: { bg: '#d1fae5', text: '#065f46' },
  UNDER_REVIEW: { bg: '#fef3c7', text: '#92400e' },
  REJECTED: { bg: '#fee2e2', text: '#991b1b' }
};

const HealthRecords = () => {
  const [activeTab, setActiveTab] = useState('consultations');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const toast = { success: (m) => showToast(m, 'success'), error: (m) => showToast(m, 'error') };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let res;
      switch (activeTab) {
        case 'consultations':
          res = await api.get('/consultations/my?limit=50');
          setData(Array.isArray(res.data?.consultations) ? res.data.consultations : []);
          break;
        case 'lab-reports':
          res = await api.get('/lab-tests/bookings/my?limit=50');
          setData(Array.isArray(res.data?.bookings) ? res.data.bookings : []);
          break;
        case 'prescriptions':
          res = await api.get('/prescriptions?limit=50');
          setData(Array.isArray(res.data?.prescriptions) ? res.data.prescriptions : Array.isArray(res.data) ? res.data : []);
          break;
        case 'orders':
          res = await api.get('/orders?limit=50');
          setData(Array.isArray(res.data?.orders) ? res.data.orders : Array.isArray(res.data) ? res.data : []);
          break;
        default:
          setData([]);
      }
    } catch (err) {
      console.error('Failed to fetch health records:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getSC = (status) => statusColors[status] || { bg: '#f3f4f6', text: '#374151' };

  const renderConsultations = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map(c => {
        const sc = getSC(c.status);
        const doctor = c.doctorId || {};
        return (
          <div key={c._id} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Dr. {doctor.name || 'Doctor'}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{doctor.specialty || ''} • ₹{c.fee || 0}</p>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                {c.status?.replace('_', ' ')}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{new Date(c.scheduledTime || c.createdAt).toLocaleDateString()}</span>
              {c.diagnosis && <span><strong>Diagnosis:</strong> {c.diagnosis}</span>}
              {c.consultationNumber && <span>#{c.consultationNumber}</span>}
            </div>
            {c.notes && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px', padding: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '6px' }}>
                <strong>Notes:</strong> {c.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderLabReports = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map(b => {
        const sc = getSC(b.status);
        return (
          <div key={b._id} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {(b.tests || []).map(t => t.name).join(', ') || 'Lab Tests'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  ₹{b.totalAmount || 0} • {new Date(b.scheduledDate).toLocaleDateString()} ({b.scheduledSlot})
                </p>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                {b.status?.replace('_', ' ')}
              </span>
            </div>
            {b.bookingNumber && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Booking #{b.bookingNumber}</p>
            )}
            {b.status === 'REPORT_READY' && b.reportUrl && (
              <a href={b.reportUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '8px 16px', borderRadius: '6px', backgroundColor: '#10b981', color: 'white', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}>
                <Download size={14} /> Download Report
              </a>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPrescriptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map(p => {
        const sc = getSC(p.status);
        return (
          <div key={p._id} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {p.type === 'DIGITAL' ? '💊 Digital Prescription' : '📄 Uploaded Prescription'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {p.doctorName && `By Dr. ${p.doctorName} • `}
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                {p.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderOrders = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map(o => {
        const sc = getSC(o.orderStatus || o.status);
        return (
          <div key={o._id} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Order #{o.orderId}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {(o.items || []).length} items • ₹{o.total || 0} • {new Date(o.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                {(o.orderStatus || o.status || '').replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {(o.items || []).slice(0, 3).map(item => item.name).join(', ')}
              {(o.items || []).length > 3 && ` +${o.items.length - 3} more`}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>;
    }
    if (data.length === 0) {
      const ActiveIcon = tabs.find(t => t.key === activeTab)?.icon || FileText;
      return (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <ActiveIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No records found</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'consultations': return renderConsultations();
      case 'lab-reports': return renderLabReports();
      case 'prescriptions': return renderPrescriptions();
      case 'orders': return renderOrders();
      default: return null;
    }
  };

  return (
    <div style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
        My Health Records 📋
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
        View your complete medical history — consultations, lab reports, prescriptions, and medicine orders
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '24px', borderBottom: '2px solid var(--border-light)', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary-600)' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.key ? 'var(--primary-600)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
};

export default HealthRecords;
