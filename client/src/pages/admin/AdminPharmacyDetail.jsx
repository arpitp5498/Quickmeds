import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, ShieldCheck, CheckCircle2, XCircle, ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

const AdminPharmacyDetail = () => {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchPharmacy = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pharmacies/${id}`);
      if (res.success && res.data) {
        setPharmacy(res.data.pharmacy);
      }
    } catch (err) {
      showToast('Could not load pharmacy details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacy();
  }, [id]);

  const handleUpdateStatus = async (status) => {
    try {
      await api.put(`/admin/pharmacies/${id}/status`, { status });
      showToast(`Pharmacy status updated to ${status}`, 'success');
      fetchPharmacy();
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  if (loading) return <Skeleton height="300px" />;
  if (!pharmacy) return <p>Pharmacy not found</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate('/admin/pharmacies')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} /> Back to Pharmacies List
      </button>

      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Store size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{pharmacy.name}</h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Owner Account: {pharmacy.ownerId?.name} ({pharmacy.ownerId?.email})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {pharmacy.verificationStatus !== 'VERIFIED' && (
              <Button
                variant="secondary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleUpdateStatus('VERIFIED')}
              >
                Approve License
              </Button>
            )}
            {pharmacy.verificationStatus !== 'SUSPENDED' && (
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => handleUpdateStatus('SUSPENDED')}
              >
                Suspend Partner
              </Button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Drug Retail License</span>
            <p style={{ fontWeight: 700 }}>{pharmacy.licenseNumber}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Phone Contact</span>
            <p style={{ fontWeight: 700 }}>{pharmacy.phone}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Operating Hours</span>
            <p style={{ fontWeight: 700 }}>{pharmacy.operatingHours?.open} - {pharmacy.operatingHours?.close}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Full Address</span>
            <p style={{ fontWeight: 700 }}>{pharmacy.address?.fullAddress}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminPharmacyDetail;
