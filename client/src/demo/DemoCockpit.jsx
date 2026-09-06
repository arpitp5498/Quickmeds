// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * QuickMeds 3-Sided Live Demo Cockpit
 * File: client/src/demo/DemoCockpit.jsx
 *
 * Renders Customer, Pharmacy, and Rider interfaces side-by-side on one screen,
 * demonstrating live state machine synchronization without repeated logins.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Store,
  Truck,
  RotateCcw,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
  MapPin,
  ExternalLink
} from 'lucide-react';
import {
  fetchDemoStatus,
  triggerRejectionAndReroute,
  resetDemoState
} from './demoApi';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const DemoCockpit = () => {
  const [demoData, setDemoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { socket } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchDemoStatus();
      if (res.success && res.data) {
        setDemoData(res.data);
      }
    } catch (err) {
      console.warn('[Cockpit] Error loading demo status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time socket sync
  useEffect(() => {
    if (!socket) return;
    const handleStatusChange = () => loadData();
    socket.on('order_status_changed', handleStatusChange);
    socket.on('order_reassigned_away', handleStatusChange);
    return () => {
      socket.off('order_status_changed', handleStatusChange);
      socket.off('order_reassigned_away', handleStatusChange);
    };
  }, [socket]);

  const order = demoData?.order;
  const status = order?.orderStatus || 'PLACED';

  // Pharmacy Actions via genuine /api/orders/:id/status endpoint
  const handlePharmacyStatus = async (newStatus, note = '') => {
    if (!order) return;
    try {
      setActionLoading(true);
      await api.patch(`/orders/${order._id}/status`, { status: newStatus, note });
      showToast(`Pharmacy updated order to ${newStatus.replace(/_/g, ' ')}`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Rider Actions via genuine /api/delivery/status endpoint
  const handleRiderStatus = async (newStatus, note = '') => {
    if (!order) return;
    try {
      setActionLoading(true);
      await api.post('/delivery/status', { orderId: order._id, status: newStatus, note });
      showToast(`Rider updated task to ${newStatus.replace(/_/g, ' ')}`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Rider update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Reroute Simulation
  const handleTriggerRejection = async () => {
    try {
      setActionLoading(true);
      const res = await triggerRejectionAndReroute();
      if (res.success) {
        showToast('⚡ Fallback rerouting triggered! Order transferred to Pharmacy B.', 'warning');
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset Demo
  const handleReset = async () => {
    try {
      setActionLoading(true);
      const res = await resetDemoState();
      if (res.success) {
        showToast('Demo order QM-DEMO-001 reset to initial baseline!', 'success');
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Reset failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenTab = (role) => {
    window.open(`/demo/launch/${role}`, '_blank');
  };

  if (loading && !demoData) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading 3-Sided Demo Cockpit...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Header & Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              marginBottom: '6px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Exit Cockpit
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>3-Sided Live Tracking Cockpit</h1>
            <Badge variant="primary">Demo Order #{order?.orderId || 'QM-DEMO-001'}</Badge>
            <Badge variant="success">{status.replace(/_/g, ' ')}</Badge>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="warning"
            size="sm"
            icon={ShieldAlert}
            loading={actionLoading}
            onClick={handleTriggerRejection}
          >
            ⚡ Test Chemist Rejection (Reroute)
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            loading={actionLoading}
            onClick={handleReset}
          >
            Reset Demo
          </Button>
        </div>
      </div>

      {/* 3 Columns Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start'
        }}
      >
        {/* COLUMN 1: CUSTOMER VIEW */}
        <Card style={{ borderTop: '4px solid var(--primary-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--primary-600)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>1. Customer Perspective</h2>
            </div>
            <button
              onClick={() => handleOpenTab('customer')}
              title="Open full page in separate tab"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: 'var(--primary-600)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Open Tab <ExternalLink size={12} />
            </button>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Patient: <strong>{order?.customerId?.name || 'Rahul Demo'}</strong> • Phone: {order?.customerId?.phone || '9800000001'}
          </div>

          <div
            style={{
              padding: '10px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.8125rem'
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Delivery Address:</div>
            <div style={{ color: 'var(--text-muted)' }}>{order?.deliveryAddress?.fullAddress}</div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
              Prescribed / Ordered Items:
            </div>
            {order?.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem',
                  padding: '4px 0',
                  borderBottom: '1px solid var(--border-light)'
                }}
              >
                <span>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontWeight: 800, color: 'var(--primary-700)' }}>
              <span>Total Payable</span>
              <span>₹{order?.total || 91}</span>
            </div>
          </div>

          {/* Customer Live Status Card */}
          <div
            style={{
              padding: '12px',
              backgroundColor: status === 'DELIVERED' ? '#f0fdf4' : '#f0f9ff',
              borderRadius: '8px',
              border: `1px solid ${status === 'DELIVERED' ? '#bbf7d0' : '#bae6fd'}`
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              LIVE TRACKING STATUS
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: status === 'DELIVERED' ? '#166534' : '#0369a1', marginTop: '4px' }}>
              {status === 'PLACED' && '1. Order Placed — Finding Nearest Chemist'}
              {status === 'ACCEPTED' && '2. Pharmacy Confirmed — Stock Reserved'}
              {status === 'PREPARING' && '3. Medicines Being Packed in Tamper-Proof Bag'}
              {status === 'READY_FOR_PICKUP' && '4. Ready at Counter — Dispatched Rider'}
              {status === 'DELIVERY_ASSIGNED' && '5. Rider Dispatched — En route to Chemist'}
              {status === 'ARRIVED_AT_PHARMACY' && '6. Rider Arrived at Chemist Counter'}
              {status === 'OUT_FOR_DELIVERY' && '7. Out for Delivery — En route to You'}
              {status === 'ARRIVED_NEAR_CUSTOMER' && '8. Rider Arrived at Your Address / Gate'}
              {status === 'DELIVERED' && '9. Order Delivered Safely!'}
            </div>

            {order?.deliveryPartnerId && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e0f2fe', fontSize: '0.75rem' }}>
                Assigned Rider: <strong>{order.deliveryPartnerId.name}</strong> ({order.deliveryPartnerId.deliveryPartnerId?.vehicleType || 'EV Scooter'})
              </div>
            )}
          </div>
        </Card>

        {/* COLUMN 2: PHARMACY VIEW */}
        <Card style={{ borderTop: '4px solid var(--secondary-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={18} color="var(--secondary-600)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>2. Pharmacy Perspective</h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleOpenTab('pharmacy1')}
                title="Open Pharmacy A"
                style={{ fontSize: '0.75rem', color: 'var(--secondary-600)', cursor: 'pointer', fontWeight: 600 }}
              >
                Store A ↗
              </button>
              <button
                onClick={() => handleOpenTab('pharmacy2')}
                title="Open Pharmacy B"
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
              >
                Store B ↗
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Active Chemist: <strong>{order?.pharmacyId?.name || 'QuickMeds Demo Pharmacy 1'}</strong>
          </div>

          {/* Stock Availability */}
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.8125rem'
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Live Pharmacy Inventory:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Store A (Connaught Place):</span>
              <strong>{demoData?.inventory?.pharmacyAStock} units available</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Store B (Barakhamba Fallback):</span>
              <strong>{demoData?.inventory?.pharmacyBStock} units available</strong>
            </div>
          </div>

          {/* Pharmacy State Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {status === 'PLACED' && (
              <Button
                variant="primary"
                fullWidth
                loading={actionLoading}
                onClick={() => handlePharmacyStatus('ACCEPTED', 'Pharmacy accepted order')}
              >
                1. Accept Order
              </Button>
            )}

            {status === 'ACCEPTED' && (
              <Button
                variant="primary"
                fullWidth
                loading={actionLoading}
                onClick={() => handlePharmacyStatus('PREPARING', 'Packaging medicines')}
              >
                2. Start Preparing / Packaging
              </Button>
            )}

            {status === 'PREPARING' && (
              <Button
                variant="secondary"
                fullWidth
                loading={actionLoading}
                onClick={() => handlePharmacyStatus('READY_FOR_PICKUP', 'Packaged and staged at counter')}
              >
                3. Mark Ready for Pickup (Dispatches Rider)
              </Button>
            )}

            {['READY_FOR_PICKUP', 'DELIVERY_ASSIGNED', 'ARRIVED_AT_PHARMACY', 'OUT_FOR_DELIVERY', 'ARRIVED_NEAR_CUSTOMER', 'DELIVERED'].includes(status) && (
              <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', fontSize: '0.8125rem' }}>
                <div style={{ color: '#166534', fontWeight: 700 }}>
                  ✓ Staged at Chemist Counter
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                  {status === 'ARRIVED_AT_PHARMACY' ? 'Rider is at the counter collecting package' : 'Rider dispatched'}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* COLUMN 3: RIDER VIEW */}
        <Card style={{ borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="#10b981" />
              <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>3. Rider Perspective</h2>
            </div>
            <button
              onClick={() => handleOpenTab('rider')}
              title="Open Rider in separate tab"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: '#10b981',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Open Tab <ExternalLink size={12} />
            </button>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Assigned Agent: <strong>Suresh Kumar</strong> • Vehicle: <strong>EV Scooter (DL 01 QM 2026)</strong>
          </div>

          <div
            style={{
              padding: '10px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.8125rem'
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Delivery Task Telemetry:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pickup:</span>
              <span style={{ fontWeight: 600 }}>{order?.pharmacyId?.name || 'Chemist'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Distance:</span>
              <span style={{ fontWeight: 600 }}>1.5 km (~12 min)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 700, marginTop: '4px' }}>
              <span>Trip Payout:</span>
              <span>₹40</span>
            </div>
          </div>

          {/* Rider Progressive Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['DELIVERY_ASSIGNED', 'READY_FOR_PICKUP'].includes(status) && (
              <Button
                variant="primary"
                fullWidth
                loading={actionLoading}
                onClick={() => handleRiderStatus('ARRIVED_AT_PHARMACY', 'Rider arrived at store counter')}
              >
                1. I Have Arrived at Pharmacy Counter
              </Button>
            )}

            {status === 'ARRIVED_AT_PHARMACY' && (
              <Button
                variant="secondary"
                fullWidth
                loading={actionLoading}
                onClick={() => handleRiderStatus('OUT_FOR_DELIVERY', 'Rider collected medicines and started transit')}
              >
                2. Confirm Package Picked Up & Start Delivery
              </Button>
            )}

            {status === 'OUT_FOR_DELIVERY' && (
              <Button
                variant="primary"
                fullWidth
                loading={actionLoading}
                onClick={() => handleRiderStatus('ARRIVED_NEAR_CUSTOMER', 'Rider arrived at customer gate')}
              >
                3. I Have Arrived at Customer Location
              </Button>
            )}

            {status === 'ARRIVED_NEAR_CUSTOMER' && (
              <Button
                variant="secondary"
                fullWidth
                icon={CheckCircle2}
                loading={actionLoading}
                onClick={() => handleRiderStatus('DELIVERED', 'Delivered to customer doorstep')}
              >
                4. Complete Handover & Mark Delivered
              </Button>
            )}

            {status === 'DELIVERED' && (
              <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                <CheckCircle2 size={24} color="#166534" style={{ margin: '0 auto 4px' }} />
                <div style={{ color: '#166534', fontWeight: 800 }}>Delivery Task Completed</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Earnings Credited: +₹40</div>
              </div>
            )}

            {['PLACED', 'ACCEPTED', 'PREPARING'].includes(status) && (
              <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Waiting for Pharmacy to mark order Ready for Pickup...
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DemoCockpit;
