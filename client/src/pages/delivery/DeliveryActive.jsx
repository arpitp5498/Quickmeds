import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  Store,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import MapView from '../../components/common/MapView';
import Skeleton from '../../components/ui/Skeleton';

const DeliveryActive = () => {
  const [partner, setPartner] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { socket } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchActive = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery/active');
      if (res.success && res.data) {
        setPartner(res.data.partner);
        setActiveOrder(res.data.activeOrder);
      }
    } catch (err) {
      console.warn('Active delivery fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();

    if (socket) {
      const handleStatusChange = () => fetchActive();
      const handleNewDelivery = () => fetchActive();

      socket.on('order_status_changed', handleStatusChange);
      socket.on('new_delivery_assigned', handleNewDelivery);

      return () => {
        socket.off('order_status_changed', handleStatusChange);
        socket.off('new_delivery_assigned', handleNewDelivery);
      };
    }
  }, [socket]);

  const handleUpdateDelivery = async (status, note = '') => {
    if (!activeOrder) return;
    try {
      setUpdating(true);
      const res = await api.post('/delivery/status', {
        orderId: activeOrder._id,
        status,
        note
      });

      if (res.success) {
        showToast(`Task updated to ${status.replace(/_/g, ' ')}!`, 'success');
        if (status === 'DELIVERED') {
          navigate('/delivery');
        } else {
          fetchActive();
        }
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const simulateRiderMovement = () => {
    if (!activeOrder) return;
    // Slight random GPS jitter around Delhi coordinates
    const newLat = 28.63 + (Math.random() - 0.5) * 0.005;
    const newLng = 77.215 + (Math.random() - 0.5) * 0.005;

    api.post('/delivery/location', {
      orderId: activeOrder._id,
      coordinates: [newLng, newLat]
    });

    if (socket) {
      socket.emit('delivery_location_update', {
        orderId: activeOrder._id,
        coordinates: [newLng, newLat]
      });
    }

    showToast('Live GPS coordinates broadcasted to customer tracking map.', 'info');
  };

  if (loading) {
    return <Skeleton height="300px" />;
  }

  if (!activeOrder) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h3>No Active Delivery Task</h3>
        <Button variant="primary" onClick={() => navigate('/delivery')} style={{ marginTop: '1rem' }}>
          Back to Delivery Portal
        </Button>
      </div>
    );
  }

  const isAssigned = activeOrder.orderStatus === 'DELIVERY_ASSIGNED' || activeOrder.orderStatus === 'READY_FOR_PICKUP';
  const isArrivedAtPharmacy = activeOrder.orderStatus === 'ARRIVED_AT_PHARMACY';
  const isOutForDelivery = activeOrder.orderStatus === 'OUT_FOR_DELIVERY';
  const isArrivedNearCustomer = activeOrder.orderStatus === 'ARRIVED_NEAR_CUSTOMER';

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate('/delivery')}
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
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Task #{activeOrder.orderId}</h1>
            <Badge variant="primary">{activeOrder.orderStatus.replace(/_/g, ' ')}</Badge>
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Earnings for this trip: <strong>₹40 Payout</strong>
          </span>
        </div>

        <Button variant="outline" size="sm" icon={Navigation} onClick={simulateRiderMovement}>
          Broadcast Live GPS Ping
        </Button>
      </div>

      {/* Interactive Map View */}
      <div style={{ marginBottom: '1.5rem' }}>
        <MapView
          pharmacyLocation={{
            name: activeOrder.pharmacyId?.name,
            lat: activeOrder.pharmacyId?.location?.coordinates?.[1] || 28.6328,
            lng: activeOrder.pharmacyId?.location?.coordinates?.[0] || 77.2195
          }}
          customerLocation={{
            name: activeOrder.deliveryAddress?.fullAddress,
            lat: activeOrder.deliveryAddress?.coordinates?.[1] || 28.629,
            lng: activeOrder.deliveryAddress?.coordinates?.[0] || 77.214
          }}
          driverLocation={partner?.currentLocation?.coordinates}
          orderStatus={activeOrder.orderStatus}
          distanceKm={activeOrder.distanceKm || 2.1}
          etaText={`${activeOrder.estimatedDeliveryMinutes || 20} mins`}
          height="280px"
        />
      </div>

      {/* Step 1: Pharmacy Pickup Card */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={18} color="var(--primary-600)" />
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
              Step 1: Pickup from Pharmacy
            </h4>
          </div>
          {(isOutForDelivery || isArrivedNearCustomer) && <Badge variant="success" size="sm">Picked Up ✓</Badge>}
          {isArrivedAtPharmacy && <Badge variant="warning" size="sm">At Counter</Badge>}
        </div>

        <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{activeOrder.pharmacyId?.name}</p>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {activeOrder.pharmacyId?.address?.fullAddress || 'Pharmacy counter pickup location'}
        </span>

        {isAssigned && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button
              variant="primary"
              fullWidth
              loading={updating}
              onClick={() => handleUpdateDelivery('ARRIVED_AT_PHARMACY', 'Rider arrived at pharmacy counter')}
            >
              1. I Have Arrived at Pharmacy Counter
            </Button>
          </div>
        )}

        {isArrivedAtPharmacy && (
          <div style={{ marginTop: '1rem' }}>
            <Button
              variant="secondary"
              fullWidth
              loading={updating}
              onClick={() => handleUpdateDelivery('OUT_FOR_DELIVERY', 'Rider picked up medicines and started transit')}
            >
              2. Confirm Package Picked Up & Start Delivery
            </Button>
          </div>
        )}
      </Card>

      {/* Step 2: Customer Delivery Card */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--secondary-600)" />
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
              Step 2: Deliver to Customer
            </h4>
          </div>
          {isArrivedNearCustomer && <Badge variant="warning" size="sm">At Destination</Badge>}
        </div>

        <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>
          {activeOrder.customerId?.name} ({activeOrder.customerId?.phone || 'Customer'})
        </p>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {activeOrder.deliveryAddress?.fullAddress}
        </span>

        <div style={{ marginTop: '10px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-700)' }}>
          {activeOrder.paymentMethod === 'COD'
            ? `Collect Cash on Delivery: ₹${activeOrder.total}`
            : 'Prepaid Online: Do Not Collect Cash'}
        </div>

        {isOutForDelivery && (
          <div style={{ marginTop: '1rem' }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={updating}
              onClick={() => handleUpdateDelivery('ARRIVED_NEAR_CUSTOMER', 'Rider reached customer address')}
            >
              3. I Have Arrived at Customer Location / Gate
            </Button>
          </div>
        )}

        {isArrivedNearCustomer && (
          <div style={{ marginTop: '1rem' }}>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              loading={updating}
              icon={CheckCircle2}
              onClick={() => handleUpdateDelivery('DELIVERED', 'Delivered safely to customer doorstep')}
            >
              4. Complete Handover & Mark Delivered
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DeliveryActive;
