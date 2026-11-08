import { stockLabel } from '../../utils/medicineStock';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pill,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Tag
} from 'lucide-react';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { getMedicineImage } from '../../utils/medicineImages';

const MedicineDetail = () => {
  const { id } = useParams();
  const { location } = useLocation();
  const { addToCart, getItemQuantity, updateQuantity, removeFromCart, cart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    let current = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/medicines/${id}?lat=${location.lat}&lng=${location.lng}`);
        if (!current) return;
        if (!res.success || !res.data?.medicine) throw new Error('Invalid medicine response');
        const { medicine: med, pharmacies: pharma, promotion: promo } = res.data;
        setMedicine(med);
        const offers = Array.isArray(pharma) && stockLabel(med) === 'In Stock' ? pharma : [];
        setPharmacies(offers.filter(p => p?.pharmacyId && Number.isSafeInteger(p.stockQuantity) && p.stockQuantity > 0));
        setPromotion(promo || null);
      } catch (err) {
        if (!current) return;
        setMedicine(null);
        setPharmacies([]);
        showToast('Could not load medicine details', 'error');
      } finally {
        if (current) setLoading(false);
      }
    };

    fetchDetail();
    return () => { current = false; };
  }, [id, location.lat, location.lng]);

  const verifiedOffers = pharmacies.filter((p) => !p.isDemo && !p.isPriceSuspicious);

  const bestOffer = verifiedOffers.length > 0 ? verifiedOffers[0] : (pharmacies[0] || null);
  const activeOffer = stockLabel(medicine) === 'In Stock' ? bestOffer : null;
  const activeOfferEffectivePrice = activeOffer ? (activeOffer.effectivePrice || activeOffer.price) : null;
  const bestPrice = activeOfferEffectivePrice !== null
    ? activeOfferEffectivePrice
    : (promotion?.promotionalPrice || medicine?.mrp || 0);

  const currentQty = medicine ? getItemQuantity(medicine._id) : 0;
  const cartItem = cart?.items?.find(
    (i) => (i.medicineId?._id || i.medicineId)?.toString() === medicine?._id?.toString()
  );

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try { await addToCart(medicine, 1); }
    finally { setAddingToCart(false); }
  };

  const handleIncreaseQty = async () => {
    if (!medicine) return;
    setAddingToCart(true);
    await updateQuantity(medicine._id, currentQty + 1);
    setAddingToCart(false);
  };

  const handleDecreaseQty = async () => {
    if (!medicine) return;
    setAddingToCart(true);
    if (currentQty <= 1) {
      await removeFromCart(medicine._id);
    } else {
      await updateQuantity(medicine._id, currentQty - 1);
    }
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1.25rem' }}>
        <Skeleton height="300px" borderRadius="var(--radius-lg)" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="200px" borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
        <h2>Medicine details unavailable</h2>
        <Button variant="primary" onClick={() => navigate('/medicines')} style={{ marginTop: '1rem' }}>
          Back to Medicine Search
        </Button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
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
        <ArrowLeft size={16} /> Back to search
      </button>

      {/* Main Medicine Info Card */}
      <Card style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'flex-start'
          }}
        >
          {/* Medicine Image (Realistic Showcase) */}
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              height: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0'
            }}
          >
            <img
              src={getMedicineImage(medicine)}
              alt={medicine.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
            />
          </div>

          {/* Medicine Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="primary">{medicine.category}</Badge>
              {medicine.requiresPrescription ? (
                <Badge variant="prescription">Prescription Required (Schedule H)</Badge>
              ) : (
                <Badge variant="success">Over-the-Counter (OTC)</Badge>
              )}
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '6px' }}>
              {medicine.name}
            </h1>

            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <strong>Generic:</strong> {medicine.genericName}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px',
                padding: '12px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                <p style={{ fontWeight: 700 }}>{medicine.strength}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Form:</span>
                <p style={{ fontWeight: 700 }}>{medicine.dosageForm}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Manufacturer:</span>
                <p style={{ fontWeight: 700 }}>{medicine.manufacturer}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Standard MRP:</span>
                <p style={{ fontWeight: 700, color: 'var(--primary-700)' }}>₹{medicine.mrp}</p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '1rem' }}>
              {medicine.description}
            </p>

            {/* Medical Disclaimer Banner */}
            <div
              style={{
                backgroundColor: 'var(--accent-50)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '0.75rem',
                color: '#9f1239',
                marginBottom: '1.25rem'
              }}
            >
              <AlertTriangle size={16} color="#e11d48" style={{ minWidth: '16px', marginTop: '2px' }} />
              <span>
                <strong>Safety Disclaimer:</strong> QuickMeds facilitates ordering and delivery. Final
                dispensing decisions are made by the licensed pharmacist. Do not self-medicate.
              </span>
            </div>

            {/* Best Fulfilment Price Showcase */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1.5px solid var(--primary-100)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    color: 'var(--primary-700)',
                    letterSpacing: '0.04em'
                  }}
                >
                  Estimated price
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px'
                  }}
                >
                  QuickMeds assigns a pharmacy for your basket and delivery address.
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                    ₹{bestPrice}
                  </span>
                  {bestPrice < medicine.mrp && (
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'line-through'
                      }}
                    >
                      MRP ₹{medicine.mrp}
                    </span>
                  )}
                </div>
                {bestPrice < medicine.mrp && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                    Save {Math.round(((medicine.mrp - bestPrice) / medicine.mrp) * 100)}% OFF
                  </span>
                )}
                {promotion && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    marginTop: '4px'
                  }}>
                    <Tag size={12} />
                    {promotion.name} — {promotion.discountPercentage}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Primary Add To Cart / Quantity Selector Area */}
            {currentQty > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--primary-50)',
                    border: '1.5px solid var(--primary-600)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '6px 12px',
                    height: '52px',
                    boxSizing: 'border-box'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                    Item in Cart ({cartItem?.pharmacyName ? `via ${cartItem.pharmacyName}` : 'Standard'}):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={handleDecreaseQty}
                      disabled={addingToCart}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--primary-200)',
                        backgroundColor: '#ffffff',
                        color: currentQty === 1 ? '#ef4444' : 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      aria-label="Decrease quantity"
                    >
                      {currentQty === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                    </button>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-900)', minWidth: '24px', textAlign: 'center' }}>
                      {currentQty}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncreaseQty}
                      disabled={addingToCart}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        backgroundColor: 'var(--primary-600)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => navigate('/cart')}
                  style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}
                  icon={ShoppingBag}
                >
                  Go to Cart ({cart.totalItems} item{cart.totalItems === 1 ? '' : 's'}) →
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                disabled={!activeOffer}
                onClick={handleAddToCart}
                loading={addingToCart}
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}
                icon={ShoppingBag}
              >
                {activeOffer ? `Add to Cart • from ₹${bestPrice}` : stockLabel(medicine) === 'Out of Stock' ? 'Out of Stock' : 'Availability Unknown'}
              </Button>
            )}
          </div>
        </div>
      </Card>


    </div>
  );
};

export default MedicineDetail;
