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

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const success = await addToCart(medicine._id, 1);
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
                marginBottom: '1rem'
              }}
            >
              <AlertTriangle size={16} color="#e11d48" style={{ minWidth: '16px', marginTop: '2px' }} />
              <span>
                <strong>Safety Disclaimer:</strong> QuickMeds facilitates ordering and delivery. Final
                dispensing decisions are made by the licensed pharmacist. Do not self-medicate.
              </span>
            </div>

            {/* Quick Add To Cart Button */}
            <Button
              variant="primary"
              onClick={handleAddToCart}
              loading={addingToCart}
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}
            >
              <ShoppingBag size={20} /> Add to Cart (Automatic Smart Fulfilment)
            </Button>
          </div>
        </div>
      </Card>

      {/* Verified Pharmacies Stocking This Medicine (Informational Preview Only) */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            Live Network Stock Availability
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Verified pharmacies stocking this medicine in your area. QuickMeds automatically evaluates stock, distance, ETA, and reliability to select the best fulfilment option for your complete order.
          </p>
        </div>

        {pharmacies.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <Store size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>
              Currently Out of Stock Nearby
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1rem' }}>
              None of the verified pharmacies in your immediate area have "{medicine.name}" in stock right now. Try searching for equivalent generic compositions.
            </p>
            <Button variant="primary" onClick={() => navigate('/medicines')}>
              Search Other Medicines
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pharmacies.map((pharm) => (
              <Card
                key={pharm.pharmacyId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Store size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{pharm.name}</h4>
                      <Badge variant="verified" size="sm">Verified Partner</Badge>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {pharm.address.street}, {pharm.address.city} • <strong>{pharm.distanceKm} km away</strong>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--secondary-700)', fontWeight: 600 }}>
                        ✓ {pharm.stockQuantity} units available
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        ETA: ~{pharm.estimatedMinutes} mins
                      </span>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                        ★ {pharm.rating} ({pharm.totalRatings})
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      ₹{pharm.price}
                    </div>
                    {pharm.price < pharm.mrp && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        MRP ₹{pharm.mrp}
                      </span>
                    )}
                  </div>

                  <Badge variant="info" size="md">
                    ✓ Network Eligible
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineDetail;
