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
  ShoppingBag
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
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

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

  const bestPrice =
    pharmacies && pharmacies.length > 0
      ? Math.min(...pharmacies.map((p) => p.price || medicine?.mrp))
      : medicine?.mrp;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const success = await addToCart(medicine._id, 1, bestPrice);
    setAddingToCart(false);
    if (success) {
      navigate('/cart');
    }
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
            {(() => {
              const bestPrice =
                pharmacies && pharmacies.length > 0
                  ? Math.min(...pharmacies.map((p) => p.price || medicine.mrp))
                  : medicine.mrp;

              return (
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
                      BEST FULFILMENT PRICE
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '2px'
                      }}
                    >
                      Based on availability, cost, delivery, ETA
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
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      Demonstration data only
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Primary Add To Cart Action */}
            <Button
              variant="primary"
              onClick={handleAddToCart}
              loading={addingToCart}
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}
              icon={ShoppingBag}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MedicineDetail;
