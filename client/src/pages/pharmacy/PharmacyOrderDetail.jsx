import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Store,
  User,
  MapPin,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  Timer,
  Zap
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import { getMedicineImage } from '../../utils/medicineImages';

const PharmacyOrderDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [simulatingTimeout, setSimulatingTimeout] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.success && res.data) {
        setOrder(res.data.order);
      }
    } catch (err) {
      showToast('Could not load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (status, note = '', reason = '') => {
    try {
      setUpdating(true);
      const res = await api.patch(`/orders/${id}/status`, {
        status,
        note,
        rejectionReason: reason
      });
      if (res.success) {
        showToast(`Order status updated to ${status}`, 'success');
        setRejectModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleSimulateTimeout = async () => {
    try {
      setSimulatingTimeout(true);
      const res = await api.post(`/orders/${id}/simulate-timeout`, {
        reason: 'PHARMACY_CONFIRMATION_TIMEOUT'
      });
      if (res.success) {
        showToast(
          '⚡ Fallback Routing Triggered: Order successfully reassigned to next candidate pharmacy.',
          'info'
        );
        fetchOrder();
      }
    } catch (err) {
      showToast(err.message || 'Timeout simulation failed', 'error');
    } finally {
      setSimulatingTimeout(false);
    }
  };

  const handleVerifyPrescription = async (status, notes = '') => {
    if (!order.prescriptionId) return;
    try {
      const rxId = typeof order.prescriptionId === 'object' ? order.prescriptionId._id : order.prescriptionId;
      const res = await api.put(`/prescriptions/${rxId}/review`, {
        status,
        reviewNotes: notes,
        rejectionReason: status === 'REJECTED' ? notes : ''
      });
      if (res.success) {
        showToast(`Prescription marked as ${status} (Lic #DL-PH-2026-98124)`, 'success');
        fetchOrder();
      }
    } catch (err) {
      showToast(err.message || 'Prescription review failed', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <Skeleton height="300px" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h3>Order Not Found</h3>
        <Button variant="primary" onClick={() => navigate('/pharmacy/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const isFallback = order.fallbackTriggered || order.fallbackAttempt > 0;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate('/pharmacy/orders')}
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
        <ArrowLeft size={16} /> Back to Pharmacy Orders
      </button>

      {/* Fallback Reassignment Banner */}
      {isFallback && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.8125rem',
            color: '#92400e'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="#b45309" />
            <span>
              <strong>⚡ Fallback Reassigned (Attempt #{order.fallbackAttempt || 1}):</strong> Transferred from{' '}
              <em>{order.previousPharmacyId?.name || 'Previous Pharmacy Partner'}</em> to{' '}
              <em>{order.pharmacyId?.name || 'Current Store'}</em> due to confirmation timeout.
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
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Order {order.orderId}</h1>
            <Badge variant="primary">{order.orderStatus.replace(/_/g, ' ')}</Badge>
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Placed: {new Date(order.createdAt).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Workflow Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Simulate Timeout Button */}
          {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'REJECTED' && (
            <Button
              variant="outline"
              size="sm"
              icon={Timer}
              loading={simulatingTimeout}
              onClick={handleSimulateTimeout}
              title="Simulate 30-second pharmacy response timeout to trigger automatic fallback reassignment"
            >
              Simulate Pharmacy Timeout
            </Button>
          )}

          {(order.orderStatus === 'PLACED' || order.orderStatus === 'PHARMACY_REVIEW') && (
            <>
              <Button variant="danger" size="sm" onClick={() => setRejectModalOpen(true)}>
                Reject
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={updating}
                onClick={() => handleUpdateStatus('ACCEPTED', 'Accepted by Pharmacist')}
              >
                Accept Order
              </Button>
            </>
          )}

          {order.orderStatus === 'ACCEPTED' && (
            <Button
              variant="primary"
              size="sm"
              loading={updating}
              onClick={() => handleUpdateStatus('PREPARING', 'Medicines packaged')}
            >
              Start Preparing
            </Button>
          )}

          {order.orderStatus === 'PREPARING' && (
            <Button
              variant="secondary"
              size="sm"
              loading={updating}
              onClick={() => handleUpdateStatus('READY_FOR_PICKUP', 'Package ready for rider pickup')}
            >
              Mark Ready for Pickup
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Customer & Prescription */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
              Customer Information
            </h3>
            <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              <p><strong>Name:</strong> {order.customerId?.name}</p>
              <p><strong>Phone:</strong> {order.customerId?.phone}</p>
              <p><strong>Email:</strong> {order.customerId?.email}</p>
              <p style={{ marginTop: '8px' }}>
                <strong>Delivery Address:</strong> {order.deliveryAddress?.fullAddress}
              </p>
            </div>
          </Card>

          {/* Prescription Document Card if attached */}
          {order.prescriptionId && (
            <Card style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCheck size={18} color="var(--primary-700)" />
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                    Customer Prescription
                  </h4>
                </div>
                <Badge variant={order.prescriptionStatus === 'APPROVED' ? 'success' : 'pending'}>
                  {order.prescriptionStatus}
                </Badge>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--primary-800)', marginBottom: '12px' }}>
                Document: {order.prescriptionId?.originalName || 'Prescription Document'}
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {order.prescriptionId?.fileUrl && (
                  <a
                    href={order.prescriptionId.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--primary-700)',
                      border: '1px solid var(--primary-300)'
                    }}
                  >
                    <ExternalLink size={14} /> Open Document File
                  </a>
                )}

                {order.prescriptionStatus !== 'APPROVED' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleVerifyPrescription('APPROVED', 'Pharmacist verified (Lic #DL-PH-2026-98124)')}
                  >
                    Approve Rx
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Ordered Medicines & Invoice */}
        <Card>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
            Prescribed / Ordered Items ({order.items?.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700 }}>{item.name}</span>
                      {item.requiresPrescription && <Badge variant="prescription" size="sm">Rx</Badge>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} • ₹{item.price} each
                    </span>
                  </div>
                </div>
                <span style={{ fontWeight: 800 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Medicine Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.125rem',
                fontWeight: 800,
                color: 'var(--primary-700)',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '8px'
              }}
            >
              <span>Total Payable</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Reject Order Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Order"
      >
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '1rem' }}>
            Please state the reason for rejecting this order (e.g. Stock unavailable, invalid prescription). Reserved inventory will be restored.
          </p>
          <Input
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Medicine expired/out of stock"
            required
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleUpdateStatus('REJECTED', 'Rejected by pharmacy', rejectionReason)}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PharmacyOrderDetail;
