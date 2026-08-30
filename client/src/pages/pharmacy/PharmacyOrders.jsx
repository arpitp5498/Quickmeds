import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Truck,
  Eye,
  FileCheck,
  AlertTriangle,
  Clock,
  Zap,
  Timer
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const PharmacyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [simulatingTimeoutId, setSimulatingTimeoutId] = useState(null);

  const { socket } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/orders/pharmacy/list';
      if (statusFilter !== 'ALL') {
        url += `?status=${statusFilter}`;
      }
      const res = await api.get(url);
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.warn('Error fetching pharmacy orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (socket) {
      const handleNewOrder = () => fetchOrders();
      socket.on('new_order_received', handleNewOrder);
      socket.on('order_status_changed', handleNewOrder);
      socket.on('order_reassigned_away', handleNewOrder);
      return () => {
        socket.off('new_order_received', handleNewOrder);
        socket.off('order_status_changed', handleNewOrder);
        socket.off('order_reassigned_away', handleNewOrder);
      };
    }
  }, [statusFilter, socket]);

  const updateStatus = async (orderId, newStatus, note = '') => {
    try {
      setUpdatingId(orderId);
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus, note });
      if (res.success) {
        // Detect fallback rerouting response from pharmacy rejection
        if (res.data?.fallback?.triggered && newStatus === 'REJECTED') {
          if (res.data.fallback.exhausted) {
            showToast('Order rejected. No other eligible pharmacy available.', 'warning');
          } else {
            showToast(
              `⚡ Order rejected → automatically reassigned to ${res.data.fallback.newPharmacy} (Attempt #${res.data.fallback.attempt})`,
              'info'
            );
          }
        } else {
          showToast(`Order status updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
        }
        fetchOrders();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSimulateTimeout = async (orderId) => {
    try {
      setSimulatingTimeoutId(orderId);
      const res = await api.post(`/orders/${orderId}/simulate-timeout`, {
        reason: 'PHARMACY_CONFIRMATION_TIMEOUT'
      });
      if (res.success) {
        showToast(
          '⚡ Fallback Routing Triggered: 30s confirmation timed out. Order reassigned to next candidate pharmacy.',
          'info'
        );
        fetchOrders();
      }
    } catch (err) {
      showToast(err.message || 'Fallback simulation failed', 'error');
    } finally {
      setSimulatingTimeoutId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pharmacy Order Processing</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Review incoming orders, verify prescriptions, simulate timeouts & fallback routing, and dispatch to riders.
        </p>
      </div>

      <Tabs
        activeTab={statusFilter}
        onChange={setStatusFilter}
        tabs={[
          { id: 'ALL', label: 'All Orders' },
          { id: 'PLACED', label: 'New Orders' },
          { id: 'PHARMACY_REVIEW', label: 'Prescription Review' },
          { id: 'ACCEPTED', label: 'Accepted' },
          { id: 'PREPARING', label: 'Packaging' },
          { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
          { id: 'DELIVERED', label: 'Completed' }
        ]}
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="100px" />
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders In This Category"
          description="There are currently no orders under this workflow status."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => {
            const isPlaced = order.orderStatus === 'PLACED' || order.orderStatus === 'PHARMACY_REVIEW';
            const isAccepted = order.orderStatus === 'ACCEPTED';
            const isPreparing = order.orderStatus === 'PREPARING';
            const isReady = order.orderStatus === 'READY_FOR_PICKUP';
            const isFallback = order.fallbackTriggered || order.fallbackAttempt > 0;

            return (
              <Card key={order._id}>
                {/* Fallback Reassignment Banner */}
                {isFallback && (
                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fde68a',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      fontSize: '0.75rem',
                      color: '#92400e'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={15} color="#b45309" />
                      <span>
                        <strong>⚡ Fallback Reassigned (Attempt #{order.fallbackAttempt || 1}):</strong> Reassigned from{' '}
                        <em>{order.previousPharmacyId?.name || 'Previous Pharmacy'}</em> to{' '}
                        <em>{order.pharmacyId?.name || 'Current Store'}</em> due to {order.fallbackReason === 'PHARMACY_REJECTED' ? 'pharmacy rejection' : 'confirmation timeout'}.
                      </span>
                    </div>
                    <Badge variant="warning" size="sm">
                      Fallback Active
                    </Badge>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--border-light)',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>{order.orderId}</span>
                    <Badge variant="primary" size="sm">
                      {order.orderStatus.replace(/_/g, ' ')}
                    </Badge>
                    {order.prescriptionId && (
                      <Badge variant="prescription" size="sm">Rx Attached</Badge>
                    )}
                  </div>

                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Customer: <strong>{order.customerId?.name}</strong> ({order.customerId?.phone}) • ₹{order.total} ({order.paymentMethod})
                  </span>
                </div>

                {/* Items summary */}
                <div style={{ marginBottom: '12px', fontSize: '0.875rem' }}>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                    {order.items?.map((i) => `${i.name} (Qty: ${i.quantity})`).join(' • ')}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Delivery to: {order.deliveryAddress?.fullAddress}
                  </p>
                </div>

                {/* Action Buttons based on order state machine */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate(`/pharmacy/orders/${order._id}`)}
                    >
                      Inspect Full Order & Rx
                    </Button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {isPlaced && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={updatingId === order._id}
                          onClick={() => updateStatus(order._id, 'REJECTED', 'Stock unavailable / Invalid prescription')}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={CheckCircle2}
                          loading={updatingId === order._id}
                          onClick={() => updateStatus(order._id, 'ACCEPTED', 'Accepted by pharmacist')}
                        >
                          Accept Order
                        </Button>
                      </>
                    )}

                    {isAccepted && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={PackageCheck}
                        loading={updatingId === order._id}
                        onClick={() => updateStatus(order._id, 'PREPARING', 'Medicines packed securely')}
                      >
                        Mark Preparing / Packing
                      </Button>
                    )}

                    {isPreparing && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Truck}
                        loading={updatingId === order._id}
                        onClick={() => updateStatus(order._id, 'READY_FOR_PICKUP', 'Package sealed for driver pickup')}
                      >
                        Mark Ready for Pickup (Auto-Assign Rider)
                      </Button>
                    )}

                    {isReady && (
                      <Badge variant="success">
                        Rider Auto-Assigned • Awaiting Pickup
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PharmacyOrders;
