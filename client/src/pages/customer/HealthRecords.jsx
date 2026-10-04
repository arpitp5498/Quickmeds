import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  TestTubes,
  FileText,
  ShoppingBag,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const tabs = [
  { key: 'consultations', label: 'Doctor Consultations', icon: Stethoscope },
  { key: 'lab-reports', label: 'Diagnostic Lab Reports', icon: TestTubes },
  { key: 'prescriptions', label: 'Medical Prescriptions', icon: FileText },
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
  const navigate = useNavigate();
  const { showToast } = useToast();

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.map(c => {
        const sc = getSC(c.status);
        const doctor = c.doctorId || {};
        return (
          <Card key={c._id} className="card-healthcare" style={{ padding: '1.5rem', borderLeft: `4px solid ${sc.text}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Dr. {doctor.name || 'Specialist Consultation'}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--primary-700)', fontWeight: 600, margin: '2px 0 0 0' }}>
                    {doctor.specialty || 'General Care'} • {c.type === 'SCHEDULED' ? 'Scheduled Video' : 'Instant Video'}
                  </p>
                </div>
              </div>
              <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: sc.bg, color: sc.text }}>
                {(c.status || '').replace(/_/g, ' ')}
              </span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="var(--text-muted)" />
                {new Date(c.scheduledTime || c.createdAt).toLocaleString()}
              </span>
              {c.consultationNumber && (
                <span style={{ color: 'var(--text-muted)' }}>Ref: #{c.consultationNumber}</span>
              )}
            </div>

            {c.symptoms && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                <strong>Symptoms:</strong> {c.symptoms}
              </div>
            )}

            {c.diagnosis && (
              <div style={{ fontSize: '0.8125rem', color: '#065f46', padding: '8px 12px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                <strong>Clinical Diagnosis:</strong> {c.diagnosis}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consultation Fee: </span>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.9375rem' }}>₹{c.fee || 0}</strong>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/doctors')}>
                View in Consultations
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderLabReports = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.map(b => {
        const sc = getSC(b.status);
        return (
          <Card key={b._id} className="card-healthcare" style={{ padding: '1.5rem', borderLeft: `4px solid ${sc.text}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TestTubes size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {(b.tests || []).map(t => t.name).join(', ') || 'Diagnostic Tests'}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Home Sample Collection • Slot: {b.scheduledSlot}
                  </p>
                </div>
              </div>
              <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: sc.bg, color: sc.text }}>
                {(b.status || '').replace(/_/g, ' ')}
              </span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="var(--text-muted)" />
                {new Date(b.scheduledDate).toLocaleDateString()} ({b.scheduledSlot})
              </span>
              {b.bookingNumber && (
                <span style={{ color: 'var(--text-muted)' }}>Booking #{b.bookingNumber}</span>
              )}
            </div>

            {b.status === 'BOOKED' && b.collectionOTP && (
              <div style={{ fontSize: '0.8125rem', color: '#065f46', backgroundColor: '#ecfdf5', padding: '8px 12px', borderRadius: 'var(--radius-md)', margin: '8px 0', border: '1px solid #a7f3d0' }}>
                Phlebotomist Verification OTP: <strong>{b.collectionOTP}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount: </span>
                <strong style={{ color: '#059669', fontSize: '1rem' }}>₹{b.totalAmount || 0}</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {b.status === 'REPORT_READY' && b.reportUrl ? (
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
                ) : (
                  <Button variant="outline" size="sm" onClick={() => navigate('/lab-tests')}>
                    View Booking
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderPrescriptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.map(p => {
        const sc = getSC(p.status);
        return (
          <Card key={p._id} className="card-healthcare" style={{ padding: '1.5rem', borderLeft: `4px solid ${sc.text}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--accent-50)', color: 'var(--accent-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {p.type === 'DIGITAL' ? 'Doctor E-Prescription' : 'Uploaded Prescription Rx'}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    {p.doctorName ? `Prescribed by Dr. ${p.doctorName} • ` : ''}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: sc.bg, color: sc.text }}>
                {(p.status || '').replace(/_/g, ' ')}
              </span>
            </div>

            {Array.isArray(p.medicines) && p.medicines.length > 0 && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', margin: '8px 0' }}>
                <strong>Medicines:</strong> {p.medicines.map(m => m.name || m).join(', ')}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
              <Button variant="outline" size="sm" onClick={() => navigate('/prescriptions')}>
                View Prescription
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderOrders = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.map(o => {
        const sc = getSC(o.orderStatus || o.status);
        return (
          <Card key={o._id} className="card-healthcare" style={{ padding: '1.5rem', borderLeft: `4px solid ${sc.text}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Order #{o.orderId}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    {(o.items || []).length} items • ₹{o.total || 0} • {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: sc.bg, color: sc.text }}>
                {(o.orderStatus || o.status || '').replace(/_/g, ' ')}
              </span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {(o.items || []).slice(0, 3).map(item => item.name).join(', ')}
              {(o.items || []).length > 3 && ` +${o.items.length - 3} more`}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
              <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${o._id}`)}>
                Track Order
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const getEmptyStateConfig = () => {
    switch (activeTab) {
      case 'consultations':
        return {
          icon: Stethoscope,
          title: 'No Doctor Consultations Yet',
          description: 'You have not scheduled any doctor consultations. Connect with verified specialists online in minutes.',
          actionLabel: 'Find a Doctor',
          onAction: () => navigate('/doctors')
        };
      case 'lab-reports':
        return {
          icon: TestTubes,
          title: 'No Diagnostic Reports Found',
          description: 'You have not scheduled any laboratory tests. Book routine checkups with doorstep sample collection.',
          actionLabel: 'Browse Lab Tests',
          onAction: () => navigate('/lab-tests')
        };
      case 'prescriptions':
        return {
          icon: FileText,
          title: 'No Prescriptions on Record',
          description: 'Upload a prescription for pharmacist verification, or receive digital prescriptions directly from your doctor.',
          actionLabel: 'Upload Prescription',
          onAction: () => navigate('/prescriptions/upload')
        };
      case 'orders':
        return {
          icon: ShoppingBag,
          title: 'No Medicine Orders Found',
          description: 'You have not placed any medicine orders. Search our catalog of 100+ medicines with live inventory.',
          actionLabel: 'Search Medicines',
          onAction: () => navigate('/medicines')
        };
      default:
        return {
          icon: FileText,
          title: 'No Records Found',
          description: 'There are no records to display.',
          actionLabel: 'Go to Dashboard',
          onAction: () => navigate('/dashboard')
        };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner size="lg" />
        </div>
      );
    }
    if (data.length === 0) {
      const config = getEmptyStateConfig();
      return (
        <EmptyState
          icon={config.icon}
          title={config.title}
          description={config.description}
          actionLabel={config.actionLabel}
          onAction={config.onAction}
        />
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
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Healthcare Trust Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
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
            <ShieldCheck size={14} color="#93c5fd" />
            <span>Encrypted Health Vault • HIPAA Compliant Storage</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            My Health Records
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>
            Your complete medical history in one secure place. Review online doctor consultations, download diagnostic lab reports, access legal e-prescriptions, and track medicine orders.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '2rem',
          borderBottom: '2px solid var(--border-light)',
          scrollbarWidth: 'none'
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2.5px solid var(--primary-600)' : '2.5px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.key ? 'var(--primary-700)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: 'pointer',
              marginBottom: '-2px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <tab.icon size={17} color={activeTab === tab.key ? 'var(--primary-600)' : 'var(--text-muted)'} />
            {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
};

export default HealthRecords;
