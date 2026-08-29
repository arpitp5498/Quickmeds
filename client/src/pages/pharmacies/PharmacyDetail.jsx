import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Search,
  Phone,
  Pill,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Skeleton from '../../components/ui/Skeleton';
import Tabs from '../../components/ui/Tabs';
import { getMedicineImage } from '../../utils/medicineImages';

const PharmacyDetail = () => {
  const { id } = useParams();
  const { location } = useLocation();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/pharmacies/${id}?lat=${location.lat}&lng=${location.lng}`);
        if (res.success && res.data) {
          setPharmacy(res.data.pharmacy);
          setInventory(res.data.inventory || []);
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        showToast('Could not load pharmacy details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacy();
  }, [id, location.lat, location.lng]);

  const filteredInventory = inventory.filter((item) => {
    if (!item.medicineId) return false;
    const matchesSearch =
      item.medicineId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicineId.genericName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.medicineId.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'All',
    ...new Set(inventory.map((i) => i.medicineId?.category).filter(Boolean))
  ];

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1.25rem' }}>
        <Skeleton height="200px" borderRadius="var(--radius-lg)" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="300px" borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
        <h2>Pharmacy Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/pharmacies')} style={{ marginTop: '1rem' }}>
          Back to Nearby Pharmacies
        </Button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/pharmacies')}
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
        <ArrowLeft size={16} /> Back to Pharmacies
      </button>

      {/* Pharmacy Header Card */}
      <Card style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '72px'
              }}
            >
              <Store size={36} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pharmacy.name}</h1>
                <Badge variant="verified">
                  <ShieldCheck size={14} /> Verified Partner
                </Badge>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {pharmacy.tagline || 'Licensed Hyperlocal Retail Pharmacy'}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-muted)',
                  fontSize: '0.8125rem',
                  marginTop: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="var(--primary-600)" />
                  {pharmacy.address?.fullAddress || pharmacy.address?.street}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} color="var(--primary-600)" />
                  {pharmacy.phone}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color="var(--primary-600)" />
                  {pharmacy.operatingHours?.open} - {pharmacy.operatingHours?.close}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '6px'
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--primary-50)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'right'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                Distance & Delivery
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                {pharmacy.distanceKm || 1.8} km • ~{pharmacy.etaText || '15 mins'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {pharmacy.rating}</span>
              <span style={{ color: 'var(--text-muted)' }}>({pharmacy.totalRatings} ratings)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs: Medicines Inventory vs Reviews */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'inventory', label: 'Medicine Inventory', count: inventory.length },
          { id: 'reviews', label: 'Customer Reviews', count: reviews.length }
        ]}
      />

      {activeTab === 'inventory' ? (
        <div>
          {/* Search & Category Filter */}
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
            <div style={{ flex: 1, minWidth: '240px' }}>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search medicines available at this pharmacy..."
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: selectedCategory === cat ? 600 : 500,
                    backgroundColor:
                      selectedCategory === cat ? 'var(--primary-600)' : 'var(--bg-card)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-main)',
                    border: '1px solid var(--border-medium)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Grid */}
          {filteredInventory.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Pill size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                No medicines found in this category at this pharmacy.
              </p>
            </Card>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {filteredInventory.map((item) => {
                const med = item.medicineId;
                if (!med) return null;
                return (
                  <Card
                    key={item._id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          height: '180px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-light)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '12px',
                          padding: '10px'
                        }}
                      >
                        <img
                          src={getMedicineImage(med)}
                          alt={med.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          loading="lazy"
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '6px'
                        }}
                      >
                        <span style={{ fontSize: '0.6875rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                          {med.category}
                        </span>
                        {med.requiresPrescription ? (
                          <Badge variant="prescription" size="sm">Rx</Badge>
                        ) : (
                          <Badge variant="success" size="sm">OTC</Badge>
                        )}
                      </div>

                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '2px' }}>
                        {med.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {med.genericName} • {med.strength}
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                          borderTop: '1px solid var(--border-light)',
                          paddingTop: '8px'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                            ₹{item.price}
                          </span>
                          {item.price < med.mrp && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                              ₹{med.mrp}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary-700)', fontWeight: 600 }}>
                          ✓ {item.stockQuantity} in stock
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon={ShoppingBag}
                        onClick={() => addToCart(med._id, 1)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Reviews Tab */
        <div>
          {reviews.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <Star size={32} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>No Reviews Yet</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Be the first customer to rate this pharmacy after your order is delivered.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <Card key={rev._id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                      {rev.customerId?.name || 'Verified Customer'}
                    </h5>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    "{rev.comment}"
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PharmacyDetail;
