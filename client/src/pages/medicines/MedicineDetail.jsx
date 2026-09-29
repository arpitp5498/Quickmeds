import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Pill,
  ShieldCheck,
  Store,
  MapPin,
  Clock,
  AlertTriangle,
  FileCheck,
  ArrowLeft,
  Check,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Star,
  Sparkles,
  CheckCircle2
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
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerActionLoading, setOfferActionLoading] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/medicines/${id}?lat=${location.lat}&lng=${location.lng}`);
        if (res.success && res.data) {
          setMedicine(res.data.medicine);
          setPharmacies(res.data.pharmacies || []);
        }
      } catch (err) {
        showToast('Could not load medicine details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, location.lat, location.lng]);

  const verifiedOffers = pharmacies.filter((p) => !p.isDemo && !p.isPriceSuspicious);
  const otherOffers = pharmacies.filter((p) => p.isDemo || p.isPriceSuspicious);

  const bestOffer = verifiedOffers.length > 0 ? verifiedOffers[0] : (pharmacies[0] || null);
  const activeOffer = selectedOffer || bestOffer;
  const bestPrice = activeOffer ? activeOffer.price : (medicine?.mrp || 0);

  const currentQty = medicine ? getItemQuantity(medicine._id) : 0;
  const cartItem = cart?.items?.find(
    (i) => (i.medicineId?._id || i.medicineId)?.toString() === medicine?._id?.toString()
  );
  const cartPharmacyId = cartItem?.pharmacyId ? cartItem.pharmacyId.toString() : null;

  const handleAddToCart = async (offer = null) => {
    if (!medicine) return;
    const target = offer || activeOffer;
    const priceToAdd = target ? target.price : medicine.mrp;
    const pharmacyIdToAdd = target ? target.pharmacyId : null;
    const pharmacyNameToAdd = target ? target.name : null;

    setAddingToCart(true);
    await addToCart(medicine, 1, priceToAdd, pharmacyIdToAdd, pharmacyNameToAdd);
    setAddingToCart(false);
  };

  const handleSelectOffer = async (offer) => {
    setSelectedOffer(offer);
    setOfferActionLoading(offer.pharmacyId);
    try {
      await addToCart(medicine, 1, offer.price, offer.pharmacyId, offer.name);
    } finally {
      setOfferActionLoading(null);
    }
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
        <h2>Medicine Not Found</h2>
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
                  {activeOffer ? `BEST FULFILMENT VIA ${activeOffer.name.toUpperCase()}` : 'BEST FULFILMENT PRICE'}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px'
                  }}
                >
                  {activeOffer
                    ? `${activeOffer.distanceKm} km away • ~${activeOffer.estimatedMinutes} mins delivery • ${activeOffer.stockQuantity} in stock`
                    : 'Based on availability, cost, delivery, ETA'}
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
                onClick={() => handleAddToCart(activeOffer)}
                loading={addingToCart}
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}
                icon={ShoppingBag}
              >
                Add to Cart • ₹{bestPrice}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Available Pharmacy Offers Section */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={22} color="var(--primary-600)" />
              Available Pharmacy Offers ({verifiedOffers.length})
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Real-time prices, verified stock, and delivery ETAs from licensed partner pharmacies in your network.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--secondary-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={16} color="var(--secondary-600)" />
              100% Genuine Pharmacy Stock
            </span>
          </div>
        </div>

        {verifiedOffers.length === 0 ? (
          <Card style={{ padding: '2rem', textAlign: 'center' }}>
            <Store size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>No verified local pharmacy offers found right now</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1rem auto' }}>
              This item can still be ordered at standard MRP (₹{medicine.mrp}) and will be fulfilled from our centralized distribution network.
            </p>
            <Button variant="primary" onClick={() => handleAddToCart()} loading={addingToCart}>
              Order at Standard MRP (₹{medicine.mrp})
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {verifiedOffers.map((offer, idx) => {
              const isBest = idx === 0;
              const isInCartForThisPharmacy = cartPharmacyId === offer.pharmacyId.toString();
              const discount = offer.mrp > offer.price ? Math.round(((offer.mrp - offer.price) / offer.mrp) * 100) : 0;

              return (
                <Card
                  key={offer.pharmacyId}
                  style={{
                    border: isBest ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
                    backgroundColor: isBest ? 'var(--primary-50)' : '#ffffff',
                    padding: '1.25rem 1.5rem',
                    borderRadius: 'var(--radius-xl)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {isBest && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-11px',
                        left: '20px',
                        backgroundColor: 'var(--primary-600)',
                        color: '#ffffff',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Sparkles size={12} /> BEST VALUE &amp; FASTEST DELIVERY
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem'
                    }}
                  >
                    {/* Left: Pharmacy Info */}
                    <div style={{ minWidth: '240px', flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {offer.name}
                        </h4>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <Star size={11} fill="#f59e0b" color="#f59e0b" />
                          {offer.rating} ({offer.totalRatings || 45})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} color="var(--primary-600)" />
                          {offer.distanceKm} km away
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} color="var(--secondary-600)" />
                          <strong>~{offer.estimatedMinutes} mins</strong> delivery
                        </span>
                        <span>•</span>
                        <span style={{ color: offer.isOpen ? 'var(--secondary-700)' : 'var(--accent-600)', fontWeight: 600 }}>
                          {offer.isOpen ? '● Open Now' : 'Closed'}
                        </span>
                        {offer.is24x7 && (
                          <span style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', fontSize: '0.7rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
                            24x7
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} color="var(--secondary-600)" />
                          In Stock ({offer.stockQuantity} units available)
                        </span>
                        {offer.batchNumber && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            • Batch: {offer.batchNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Pricing & Add/Select Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                            ₹{offer.price}
                          </span>
                          {offer.mrp > offer.price && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              ₹{offer.mrp}
                            </span>
                          )}
                        </div>
                        {discount > 0 && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>
                            Save {discount}% OFF MRP
                          </span>
                        )}
                      </div>

                      <div>
                        {isInCartForThisPharmacy ? (
                          <Button
                            variant="outline"
                            size="md"
                            onClick={() => navigate('/cart')}
                            icon={Check}
                            style={{ borderColor: 'var(--primary-600)', color: 'var(--primary-700)', fontWeight: 700, minWidth: '170px' }}
                          >
                            In Cart ({currentQty}) →
                          </Button>
                        ) : (
                          <Button
                            variant={isBest ? 'primary' : 'outline'}
                            size="md"
                            loading={offerActionLoading === offer.pharmacyId}
                            onClick={() => handleSelectOffer(offer)}
                            icon={ShoppingBag}
                            style={{ fontWeight: 700, minWidth: '170px' }}
                          >
                            {isBest ? 'Select Best Offer' : 'Choose This Pharmacy'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineDetail;
