import React, { useState, useEffect } from 'react';
import { User, Phone, Bike, ShieldCheck, Star } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const DeliveryProfile = () => {
  const { user } = useAuth();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/delivery/active');
        if (res.success && res.data) {
          setPartner(res.data.partner);
        }
      } catch (err) {
        console.warn('Delivery profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <Skeleton height="250px" />;

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        Rider Fleet Profile
      </h1>

      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bike size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{user?.name}</h3>
              <Badge variant="verified">Active Rider</Badge>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {user?.email} • {user?.phone}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Vehicle Registered</span>
            <span style={{ fontWeight: 700 }}>{partner?.vehicleType} ({partner?.vehicleNumber})</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Driving License</span>
            <span style={{ fontWeight: 700 }}>{partner?.drivingLicenseNumber || 'DL-IN-VALIDATED'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Completed Trips</span>
            <span style={{ fontWeight: 700 }}>{partner?.completedDeliveriesCount} orders</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Customer Rating</span>
            <span style={{ fontWeight: 700, color: '#f59e0b' }}>★ {partner?.rating || 4.8} / 5.0</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current Status</span>
            <Badge variant={partner?.status === 'AVAILABLE' ? 'success' : 'pending'}>
              {partner?.status}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DeliveryProfile;
