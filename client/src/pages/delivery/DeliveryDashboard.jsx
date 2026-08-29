import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  Navigation,
  CheckCircle2,
  DollarSign,
  Power,
  Store,
  MapPin,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

const DeliveryDashboard = () => {
  const [partner, setPartner] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const { socket } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery/active');
      if (res.success && res.data) {
        setPartner(res.data.partner);
        setActiveOrder(res.data.activeOrder);
      }
    } catch (err) {
      console.warn('Error loading delivery dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();

    if (socket) {
      const handleTask = () => {
        showToast('🛵 New delivery task assigned!', 'success');
        fetchDeliveryData();
      };
      socket.on('notification', handleTask);
      return () => socket.off('notification', handleTask);
    }
  }, [socket]);

  const toggleAvailability = async () => {
    try {
      setToggling(true);
      const res = await api.put('/delivery/availability');
      if (res.success && res.data) {
        setPartner(res.data.partner);
        showToast(`Status updated to ${res.data.partner.status}`, 'info');
      }
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    } finally {
      setToggling(false);
    }
  };

  const isOnline = partner?.status !== 'OFFLINE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Online/Offline Duty Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Delivery Fleet Portal</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Vehicle: <strong>{partner?.vehicleNumber}</strong> ({partner?.vehicleType})
          </p>
        </div>

        <Button
          variant={isOnline ? 'secondary' : 'ghost'}
          icon={Power}
          loading={toggling}
          onClick={toggleAvailability}
          style={{
            border: `1px solid ${isOnline ? 'var(--secondary-600)' : 'var(--border-medium)'}`
          }}
        >
          {isOnline ? '● You are Online (Available)' : '○ You are Offline'}
        </Button>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <StatCard
          title="Deliveries Completed"
          value={partner?.completedDeliveriesCount || 0}
          icon={CheckCircle2}
          color="var(--primary-600)"
          bg="var(--primary-50)"
        />

        <StatCard
          title="Total Earnings"
          value={`₹${partner?.totalEarnings || 0}`}
          icon={DollarSign}
          color="var(--secondary-600)"
          bg="var(--secondary-50)"
        />

        <StatCard
          title="Rider Rating"
          value={`★ ${partner?.rating || 4.8}`}
          icon={Bike}
          color="#f59e0b"
          bg="#fef3c7"
        />
      </div>

      {/* Active Delivery Card */}
      {activeOrder ? (
        <Card
          style={{
            backgroundColor: 'var(--primary-50)',
            border: '2px solid var(--primary-300)',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                ACTIVE TASK: {activeOrder.orderId}
              </span>
              <Badge variant="primary">
                {activeOrder.orderStatus.replace(/_/g, ' ')}
              </Badge>
            </div>

            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-800)' }}>
              Payout: ₹40
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                1. PICKUP AT PHARMACY:
              </span>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', marginTop: '2px' }}>
                {activeOrder.pharmacyId?.name}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {activeOrder.pharmacyId?.address?.fullAddress || activeOrder.pharmacyId?.address?.street}
              </span>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-600)' }}>
                2. DELIVER TO CUSTOMER:
              </span>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', marginTop: '2px' }}>
                {activeOrder.customerId?.name} ({activeOrder.customerId?.phone})
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {activeOrder.deliveryAddress?.fullAddress}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={Navigation}
            onClick={() => navigate('/delivery/active')}
          >
            Open Live Route & Complete Task →
          </Button>
        </Card>
      ) : (
        <Card style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Bike size={44} color="var(--primary-600)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
            {isOnline ? 'Waiting for Nearby Dispatch...' : 'You are Currently Offline'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {isOnline
              ? 'Stay near licensed pharmacies to receive automatic priority delivery dispatches.'
              : 'Switch your duty status to Online to begin receiving delivery tasks.'}
          </p>

          {!isOnline && (
            <Button variant="secondary" onClick={toggleAvailability}>
              Go Online Now
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default DeliveryDashboard;
