import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  MapPin,
  Truck,
  Phone,
  Clock,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  ArrowLeft,
  XCircle,
  AlertTriangle,
  Play,
  FastForward,
  RotateCcw,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Timeline from '../../components/ui/Timeline';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import MapView from '../../components/common/MapView';
import { getMedicineImage } from '../../utils/medicineImages';

const OrderDetail = () => {
  const { id } = useParams();
  const { socket, trackOrder } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [deliveryPartner, setDeliveryPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.success && res.data) {
        setOrder(res.data.order);
        setDeliveryPartner(res.data.deliveryPartner || null);
        trackOrder(id);
      }
    } catch (err) {
      showToast('Could not load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    if (socket) {
      const handleStatusChange = (data) => {
        if (data.orderId === id) {
          showToast(`Order status updated to: ${data.status.replace(/_/g, ' ')}`, 'info');
          if (data.deliveryPartner) {
            setDeliveryPartner(data.deliveryPartner);
          }
          fetchOrder();
        }
      };

      const handleDriverMoved = (data) => {
        if (data.orderId === id) {
          setDeliveryPartner((prev) => ({
            ...prev,
            currentLocation: data.coordinates
          }));
        }
      };

      const handleFallbackReassigned = (data) => {
        if (data.orderId === id) {
          showToast(
            `⚡ Your order is being rerouted to ${data.newPharmacyName} for faster fulfilment.`,
            'info'
          );
          fetchOrder();
        }
      };

      socket.on('order_status_changed', handleStatusChange);
      socket.on('driver_moved', handleDriverMoved);
      socket.on('order_fallback_reassigned', handleFallbackReassigned);

      return () => {
        socket.off('order_status_changed', handleStatusChange);
        socket.off('driver_moved', handleDriverMoved);
        socket.off('order_fallback_reassigned', handleFallbackReassigned);
      };
    }
  }, [id, socket]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await api.post(`/orders/${id}/cancel`, { reason: cancelReason });
      if (res.success && res.data) {
        setOrder(res.data.order);
        setCancelModalOpen(false);
        showToast('Order cancelled successfully', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '960px' }}>
        <Skeleton height="240px" borderRadius="var(--radius-lg)" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="300px" borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/orders')} style={{ marginTop: '1rem' }}>
          Back to Orders
        </Button>
      </div>
    );
  }

  // Full 8-State Delivery Progression Definition
  const ALL_8_STATES = [
    {
      key: 'PLACED',
      title: '1. Order Placed',
      desc: 'Hyperlocal order received & routed to nearest licensed chemist'
    },
    {
      key: 'PHARMACY_REVIEW',
      title: '2. Pharmacy Review',
      desc: 'Pharmacist validating prescription authenticity & inventory batch'
    },
    {
      key: 'ACCEPTED',
      title: '3. Pharmacy Confirmed',
      desc: 'Dispensation approved and reserved at pharmacy'
    },
    {
      key: 'PREPARING',
      title: '4. Medicines Packed',
      desc: 'Assembled in tamper-proof seal with temperature safety strip'
    },
    {
      key: 'READY_FOR_PICKUP',
      title: '5. Ready for Dispatch',
      desc: 'Package staged for pickup at pharmacy counter'
    },
    {
      key: 'DELIVERY_ASSIGNED',
      title: '6. Rider Assigned',
      desc: 'Nearest delivery partner dispatched to pickup location'
    },
    {
      key: 'OUT_FOR_DELIVERY',
      title: '7. Out for Delivery',
      desc: 'Rider en route with real-time waypoint tracking'
    },
    {
      key: 'DELIVERED',
      title: '8. Order Delivered',
      desc: 'Handed over securely to customer with digital confirmation'
    }
  ];

  const statusOrderKeys = ALL_8_STATES.map((s) => s.key);
  const currentIndex = statusOrderKeys.indexOf(order.orderStatus);

  const timelineSteps = ALL_8_STATES.map((step, idx) => {
    const isCompleted =
      currentIndex >= idx &&
      order.orderStatus !== 'CANCELLED' &&
      order.orderStatus !== 'REJECTED';
    const isCurrent = order.orderStatus === step.key;
    const isRejected =
      (order.orderStatus === 'CANCELLED' || order.orderStatus === 'REJECTED') && isCurrent;

    // Find timestamp in history if present
    const historyItem = order.statusHistory?.find((h) => h.status === step.key);
    const timeStr = historyItem
      ? new Date(historyItem.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      : null;

    return {
      title: step.title,
      description: historyItem?.note || step.desc,
      timestamp: timeStr,
      isCompleted,
      isCurrent,
      isRejected
    };
  });

  const canCancel = ['PLACED', 'PHARMACY_REVIEW'].includes(order.orderStatus);
  const isFulfilmentUnavailable = order.orderStatus === 'FULFILMENT_UNAVAILABLE';
  const isDelivered = order.orderStatus === 'DELIVERED';

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '960px' }}>
      {/* Top Header & Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/orders')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Back to My Orders
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Order ID: <strong>{order.orderId}</strong>
          </span>
          <Badge
            variant={
              isDelivered
                ? 'success'
                : order.orderStatus === 'CANCELLED' || order.orderStatus === 'REJECTED' || order.orderStatus === 'FULFILMENT_UNAVAILABLE'
                ? 'danger'
                : 'primary'
            }
            size="md"
          >
            {order.orderStatus.replace(/_/g, ' ')}
          </Badge>
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setCancelModalOpen(true)}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>



      {/* Fulfilment Unavailable Banner */}
      {isFulfilmentUnavailable && (
        <Card
          style={{
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>
              Fulfilment Unavailable
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              We were unable to find an eligible pharmacy to fulfil this order after {order.fallbackAttempt || 0} attempt(s). Please try placing a new order or contact support.
            </p>
          </div>
        </Card>
      )}

      {/* Delivered Success Celebration Banner */}
      {isDelivered && (
        <Card
          style={{
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'var(--secondary-500)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--secondary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--secondary-700)' }}>
              Medicines Delivered Successfully!
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Your order has been handed over safely with tamper-proof seal intact. Thank you for using QuickMeds!
            </p>
          </div>
        </Card>
      )}

      {/* Fallback Rerouting Banner */}
      {(order.fallbackTriggered || order.fallbackAttempt > 0) && order.orderStatus !== 'DELIVERED' && (
        <Card
          style={{
            marginBottom: '1.5rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Zap size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#92400e' }}>
              ⚡ Order Rerouted (Attempt #{order.fallbackAttempt || 1})
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#92400e', marginTop: '2px' }}>
              {order.fallbackReason === 'PHARMACY_REJECTED'
                ? 'Previous pharmacy could not fulfil this order.'
                : 'Previous pharmacy confirmation timed out.'}
              {' '}QuickMeds automatically reassigned your order to{' '}
              <strong>{order.pharmacyId?.name || 'a nearby verified pharmacy'}</strong> for faster delivery.
            </p>
          </div>
        </Card>
      )}

      {/* Live Map Tracking Component */}
      <div style={{ marginBottom: '2rem' }}>
        <MapView
          pharmacyLocation={{
            name: order.pharmacyId?.name || 'Apollo Pharmacy',
            lat: order.pharmacyId?.location?.coordinates?.[1] || 28.6328,
            lng: order.pharmacyId?.location?.coordinates?.[0] || 77.2195,
            address: order.pharmacyId?.address?.fullAddress
          }}
          customerLocation={{
            name: order.deliveryAddress?.fullAddress || 'Customer Address',
            lat: order.deliveryAddress?.coordinates?.[1] || 28.629,
            lng: order.deliveryAddress?.coordinates?.[0] || 77.214,
            address: order.deliveryAddress?.fullAddress
          }}
          driverLocation={deliveryPartner?.currentLocation}
          deliveryPartner={deliveryPartner}
          orderStatus={order.orderStatus}
          distanceKm={order.distanceKm || 2.1}
          etaText={`${order.estimatedDeliveryMinutes || 20} mins`}
          height="340px"
          interactive={true}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'flex-start'
        }}
      >
        {/* Left: 8-State Live Timeline & Delivery Partner Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem'
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                8-State Delivery Lifecycle
              </h3>
              <Badge variant="primary" size="sm">
                Live GPS Sync
              </Badge>
            </div>
            <Timeline steps={timelineSteps} currentStatus={order.orderStatus} />
          </Card>

          {/* Delivery Executive Card */}
          {deliveryPartner && (
            <Card>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Truck size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                      {deliveryPartner.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {deliveryPartner.vehicleType || 'Electric Scooter'} •{' '}
                      <strong>{deliveryPartner.vehicleNumber || 'DL 01 QM 8822'}</strong>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                      ★ {deliveryPartner.rating || 4.9} Rider Rating
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${deliveryPartner.phone || '+919876543210'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-700)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={15} /> Call Rider
                </a>
              </div>
            </Card>
          )}

          {/* Prescription Status Banner */}
          {order.prescriptionId && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileCheck size={24} color="var(--primary-600)" />
                <div>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                    Prescription Verification:{' '}
                    <span
                      style={{
                        color:
                          order.prescriptionStatus === 'APPROVED'
                            ? 'var(--secondary-600)'
                            : order.prescriptionStatus === 'REJECTED'
                            ? 'var(--accent-600)'
                            : '#f59e0b'
                      }}
                    >
                      {order.prescriptionStatus.replace(/_/g, ' ')}
                    </span>
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Authenticated by registered pharmacist at {order.pharmacyId?.name}.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Items, Address & Bill Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Pharmacy Info */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Store size={20} color="var(--primary-600)" />
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                  {order.pharmacyId?.name}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {order.pharmacyId?.address?.fullAddress ||
                    `${order.pharmacyId?.address?.street}, ${order.pharmacyId?.address?.city}`}
                </p>
              </div>
            </div>
            {order.pharmacyId?.phone && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Phone: {order.pharmacyId.phone}
              </div>
            )}
          </Card>

          {/* Delivery Address */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={20} color="var(--primary-600)" />
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Delivery Destination</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {order.deliveryAddress?.fullAddress}
                </p>
              </div>
            </div>
          </Card>

          {/* Medicines List & Invoice */}
          <Card>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '12px' }}>
              Ordered Items ({order.items?.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-light)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        padding: '4px'
                      }}
                    >
                      <img
                        src={getMedicineImage(item)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                        (Qty: {item.quantity})
                      </span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Hyperlocal Express Delivery</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Payment Mode</span>
                <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.0625rem',
                  fontWeight: 800,
                  color: 'var(--primary-700)',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '8px',
                  marginTop: '4px'
                }}
              >
                <span>Total Amount</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel This Medicine Order?"
      >
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '1rem' }}>
            Are you sure you want to cancel order <strong>{order.orderId}</strong>? Reserved pharmacy
            inventory will be released back to the chemist.
          </p>
          <Input
            label="Reason for cancellation"
            placeholder="e.g. Ordered wrong medicine, alternate arrangement made"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button variant="danger" onClick={handleCancelOrder} loading={cancelling}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;
