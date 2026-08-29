import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  FileCheck,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';
import BasketOptimizationBreakdown from '../../components/routing/BasketOptimizationBreakdown';

const Checkout = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { location } = useLocation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [optimizedPlan, setOptimizedPlan] = useState(null);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customStreet, setCustomStreet] = useState(location.address || '');
  const [customCity, setCustomCity] = useState(location.city || 'New Delhi');
  const [customPincode, setCustomPincode] = useState('110001');

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [existingPrescriptions, setExistingPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [addrRes, rxRes] = await Promise.all([
          api.get('/users/addresses'),
          api.get('/prescriptions')
        ]);

        if (addrRes.success && addrRes.data) {
          const addresses = addrRes.data.addresses || [];
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          if (defaultAddr) setSelectedAddress(defaultAddr);
          else setUseCustomAddress(true);
        }

        if (rxRes.success && rxRes.data) {
          setExistingPrescriptions(rxRes.data.prescriptions || []);
        }
      } catch (err) {
        console.warn('Checkout init error:', err);
      }
    };

    fetchData();
  }, []);

  const handlePlaceOrder = async () => {
    let deliveryAddressPayload = null;

    if (useCustomAddress || !selectedAddress) {
      if (!customStreet.trim()) {
        showToast('Please enter your delivery street address', 'warning');
        return;
      }
      deliveryAddressPayload = {
        label: 'Current Location',
        street: customStreet,
        city: customCity,
        state: 'Delhi',
        pincode: customPincode,
        fullAddress: `${customStreet}, ${customCity} ${customPincode}`,
        coordinates: [location.lng, location.lat]
      };
    } else {
      deliveryAddressPayload = {
        label: selectedAddress.label,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        landmark: selectedAddress.landmark,
        fullAddress: selectedAddress.fullAddress,
        coordinates: selectedAddress.coordinates
      };
    }

    let finalPrescriptionId = selectedPrescriptionId;

    // If prescription file newly uploaded, upload it first
    if (cart.hasPrescriptionRequiredItems && prescriptionFile) {
      try {
        const formData = new FormData();
        formData.append('prescription', prescriptionFile);
        formData.append('pharmacyId', cart.pharmacyId?._id || cart.pharmacyId);
        formData.append('patientName', user.name);

        const uploadRes = await api.post('/prescriptions/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.success && uploadRes.data) {
          finalPrescriptionId = uploadRes.data.prescription._id;
        }
      } catch (err) {
        showToast(err.message || 'Prescription upload failed', 'error');
        return;
      }
    }

    if (cart.hasPrescriptionRequiredItems && !finalPrescriptionId) {
      showToast(
        'Please upload or select a valid doctor prescription for your prescription medicines.',
        'warning'
      );
      return;
    }

    try {
      setPlacingOrder(true);
      const targetPharmacyId =
        optimizedPlan?.recommended?.pharmacies?.[0]?._id ||
        cart.pharmacyId?._id ||
        cart.pharmacyId;

      const res = await api.post('/orders', {
        pharmacyId: targetPharmacyId,
        deliveryAddress: deliveryAddressPayload,
        prescriptionId: finalPrescriptionId,
        paymentMethod
      });

      if (res.success && res.data) {
        showToast('Order placed successfully! Redirecting to live tracking...', 'success');
        refreshCart();
        navigate(`/orders/${res.data.order._id}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const deliveryFee = 25;
  const platformFee = 5;
  const total = cart.subtotal + deliveryFee + platformFee;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        Complete Your Order
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'flex-start'
        }}
      >
        {/* Left: Multi-step checkout details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Delivery Address Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Select Delivery Address</h3>
            </div>

            {savedAddresses.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                {savedAddresses.map((addr) => {
                  const isSelected = !useCustomAddress && selectedAddress?._id === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setUseCustomAddress(false);
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-light)'}`,
                        backgroundColor: isSelected ? 'var(--primary-50)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPin size={18} color={isSelected ? 'var(--primary-600)' : 'var(--text-muted)'} />
                        <div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{addr.label}</span>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {addr.fullAddress}
                          </p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={18} color="var(--primary-600)" />}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => setUseCustomAddress(!useCustomAddress)}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--primary-600)',
                fontWeight: 600,
                marginBottom: useCustomAddress ? '1rem' : 0,
                display: 'block'
              }}
            >
              {useCustomAddress ? 'Use a saved address ↑' : '+ Use a different custom address'}
            </button>

            {useCustomAddress && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <Input
                  label="Street Address / Landmark"
                  value={customStreet}
                  onChange={(e) => setCustomStreet(e.target.value)}
                  placeholder="e.g. Flat 301, Silver Tower, CP"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Input
                    label="City"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                  />
                  <Input
                    label="Pincode"
                    value={customPincode}
                    onChange={(e) => setCustomPincode(e.target.value)}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* 2. Prescription Upload (Mandatory if Cart has Rx medicines) */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Doctor's Prescription{' '}
                {cart.hasPrescriptionRequiredItems ? (
                  <span style={{ color: 'var(--accent-600)', fontSize: '0.8125rem' }}>
                    (Mandatory for your medicines)
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    (Optional for OTC orders)
                  </span>
                )}
              </h3>
            </div>

            {/* Statutory Simulation Disclaimer */}
            <div
              style={{
                backgroundColor: 'var(--accent-50)',
                border: '1px solid var(--accent-100)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <ShieldCheck size={16} color="var(--accent-600)" style={{ minWidth: '16px', marginTop: '2px' }} />
              <span style={{ fontSize: '0.75rem', color: '#9f1239', lineHeight: 1.4, fontWeight: 600 }}>
                Statutory Requirement: Under Indian Pharmacy Practice Regulations, all Schedule H/X drugs require licensed pharmacist verification. (Secure Verification).
              </span>
            </div>

            {existingPrescriptions.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Attach a previously verified prescription:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {existingPrescriptions.map((rx) => {
                    const isSelected = selectedPrescriptionId === rx._id;
                    return (
                      <div
                        key={rx._id}
                        onClick={() => {
                          setSelectedPrescriptionId(isSelected ? null : rx._id);
                          setPrescriptionFile(null);
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-light)'}`,
                          backgroundColor: isSelected ? 'var(--primary-50)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileCheck size={16} color="var(--primary-600)" />
                          <span>{rx.originalName} ({rx.doctorName || 'Consultation'})</span>
                        </div>
                        {isSelected && <CheckCircle2 size={16} color="var(--primary-600)" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <FileUpload
              label="Or upload a new Prescription (Photo / PDF)"
              onFileSelect={(file) => {
                setPrescriptionFile(file);
                if (file) setSelectedPrescriptionId(null);
              }}
            />
          </Card>

          {/* 3. Payment Method */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Select Payment Method</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${paymentMethod === 'COD' ? 'var(--primary-600)' : 'var(--border-light)'}`,
                  backgroundColor: paymentMethod === 'COD' ? 'var(--primary-50)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Banknote size={20} color="var(--secondary-600)" />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                      Cash on Delivery (COD)
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Pay with cash or QR at your doorstep upon delivery.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${paymentMethod === 'ONLINE' ? 'var(--primary-600)' : 'var(--border-light)'}`,
                  backgroundColor: paymentMethod === 'ONLINE' ? 'var(--primary-50)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CreditCard size={20} color="var(--primary-600)" />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                      UPI / Online Payment
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Pay via Google Pay, PhonePe, Paytm, or Cards.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                />
              </label>
            </div>
          </Card>
        </div>

        {/* Right: Smart Fulfilment Routing Breakdown & Order Action */}
        <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <BasketOptimizationBreakdown
            cartItems={cart.items}
            coordinates={location ? [location.lng, location.lat] : [77.2090, 28.6139]}
            onPlanOptimized={setOptimizedPlan}
            showPricingBreakdown={true}
          />

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Order Summary
              </h3>
              <Badge variant="primary" size="sm">
                {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
              </Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
              {cart.items.map((item) => (
                <div
                  key={item.medicineId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem'
                  }}
                >
                  <span style={{ color: 'var(--text-main)' }}>
                    {item.name} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Medicine Subtotal</span>
                <span style={{ fontWeight: 600 }}>₹{optimizedPlan?.recommended?.priceBreakdown?.itemsSubtotal || cart.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hyperlocal Delivery</span>
                <span style={{ fontWeight: 600 }}>₹{optimizedPlan?.recommended?.priceBreakdown?.deliveryFee || deliveryFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Safety & Packaging</span>
                <span style={{ fontWeight: 600 }}>₹{optimizedPlan?.recommended?.priceBreakdown?.platformFee || platformFee}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--primary-700)',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '8px'
                }}
              >
                <span>Total Payable</span>
                <span>₹{optimizedPlan?.recommended?.totalOrderValue || optimizedPlan?.recommended?.totalDemoValue || total}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handlePlaceOrder}
              loading={placingOrder}
              icon={CheckCircle2}
            >
              Place Order (₹{optimizedPlan?.recommended?.totalOrderValue || optimizedPlan?.recommended?.totalDemoValue || total})
            </Button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: 'var(--secondary-700)',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={14} color="var(--secondary-600)" />
              <span>Prescriptions verified by Licensed Pharmacist</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
