import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Flame,
  ShieldCheck,
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Check,
  Zap,
  Sparkles,
  Thermometer,
  Wind,
  Activity,
  Heart
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import { getMedicineImage } from '../../utils/medicineImages';

const CATEGORY_FILTERS = [
  { id: 'All', label: 'All Essentials', icon: Sparkles },
  { id: 'Fever & Pain', label: 'Fever & Pain', icon: Thermometer },
  { id: 'Cold & Cough', label: 'Cold & Cough', icon: Wind },
  { id: 'First Aid', label: 'First Aid', icon: Activity },
  { id: 'Hydration & Digestion', label: 'Hydration & Digestion', icon: Heart },
  { id: 'Respiratory', label: 'Respiratory', icon: Wind }
];

const EmergencyEssentialsSection = ({
  initialLimit = 8,
  showViewAll = true,
  title = 'SOS — Emergency Essentials',
  subtitle = 'Quick access to commonly searched emergency essentials',
  className = ''
}) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expanded, setExpanded] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});

  const { addToCart } = useCart();
  const { location } = useLocation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmergencyMedicines = async () => {
      try {
        setLoading(true);
        const res = await api.get('/medicines/emergency-essentials');
        if (res.success && res.data) {
          setMedicines(res.data.medicines || []);
        }
      } catch (err) {
        console.warn('Could not fetch emergency essentials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyMedicines();
  }, []);

  const handleQuickAdd = async (medicine, e) => {
    e.stopPropagation();
    try {
      setAddingId(medicine._id);
      const unitPrice = medicine.lowestPrice || medicine.mrp;
      const success = await addToCart(medicine._id, 1, unitPrice);
      if (success) {
        setAddedIds((prev) => ({ ...prev, [medicine._id]: true }));
        setTimeout(() => {
          setAddedIds((prev) => {
            const next = { ...prev };
            delete next[medicine._id];
            return next;
          });
        }, 2000);
      }
    } catch (err) {
      showToast('Failed to add medicine', 'error');
    } finally {
      setAddingId(null);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Hydration & Digestion') {
      return m.emergencyCategory === 'Hydration & Digestion' || m.category === 'Digestive Care';
    }
    return m.emergencyCategory === selectedCategory;
  });

  const displayedMedicines =
    expanded || !showViewAll ? filteredMedicines : filteredMedicines.slice(0, initialLimit);

  return (
    <section className={`emergency-essentials-section ${className}`} style={{ width: '100%' }}>
      {/* Header Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffe4e6',
                color: '#e11d48',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}
            >
              <Zap size={13} />
              FAST RESPONSE
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-700)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <CheckCircle2 size={13} color="var(--secondary-600)" />
              Nearby network available
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            {title}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </div>

        {/* Location / ETA indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            fontSize: '0.8125rem'
          }}
        >
          <MapPin size={15} color="var(--primary-600)" />
          <span style={{ color: 'var(--text-muted)' }}>
            Near: <strong style={{ color: 'var(--text-main)' }}>{location?.address || 'Connaught Place, New Delhi'}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--secondary-700)', fontWeight: 700 }}>~15-25 min ETA</span>
        </div>
      </div>

      {/* Category Shortcut Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '1.5rem',
          scrollbarWidth: 'none'
        }}
      >
        {CATEGORY_FILTERS.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: isSelected ? 700 : 600,
                backgroundColor: isSelected ? 'var(--primary-600)' : 'var(--bg-card)',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                border: `1.5px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-light)'}`,
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} height="320px" borderRadius="var(--radius-lg)" />
          ))}
        </div>
      ) : displayedMedicines.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No emergency items found in this category.</p>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {displayedMedicines.map((med) => {
            const isAdded = !!addedIds[med._id];
            const isAdding = addingId === med._id;

            return (
              <Card
                key={med._id}
                hoverable
                onClick={() => navigate(`/medicines/${med._id}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  cursor: 'pointer',
                  border: '1px solid var(--border-light)',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--primary-700)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {med.emergencyCategory || med.category}
                    </span>

                    {med.requiresPrescription ? (
                      <Badge variant="prescription" size="sm">Rx Required</Badge>
                    ) : (
                      <Badge variant="success" size="sm">OTC Essential</Badge>
                    )}
                  </div>

                  {/* Product Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '160px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      marginBottom: '12px',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={getMedicineImage(med)}
                      alt={med.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center'
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <h4
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      marginBottom: '4px',
                      lineHeight: 1.35,
                      color: 'var(--text-main)'
                    }}
                  >
                    {med.name}
                  </h4>

                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {med.genericName}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--secondary-700)',
                      fontWeight: 600,
                      marginBottom: '12px'
                    }}
                  >
                    <CheckCircle2 size={13} color="var(--secondary-600)" />
                    <span>Available in nearby network</span>
                  </div>
                </div>

                {/* Bottom Pricing & Quick Action */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-light)'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>
                        Demo Price
                      </span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        ₹{med.mrp}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {med.dosageForm}
                    </span>
                  </div>

                  <Button
                    variant={isAdded ? 'success' : 'primary'}
                    size="sm"
                    fullWidth
                    loading={isAdding}
                    icon={isAdded ? Check : ShoppingBag}
                    onClick={(e) => handleQuickAdd(med, e)}
                  >
                    {isAdded
                      ? 'Added to Cart ✓'
                      : med.requiresPrescription
                      ? 'Add with Rx'
                      : 'Quick Add'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* View All Button & Legal Advisory */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1.75rem',
          textAlign: 'center'
        }}
      >
        {showViewAll && filteredMedicines.length > initialLimit && (
          <Button
            variant="outline"
            size="md"
            onClick={() => setExpanded(!expanded)}
            icon={ArrowRight}
            iconPosition="right"
          >
            {expanded
              ? 'Show Less Essentials'
              : `View All Emergency Essentials (${filteredMedicines.length})`}
          </Button>
        )}

        {/* Emergency Medical Notice */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            color: '#9f1239',
            maxWidth: '720px'
          }}
        >
          <AlertTriangle size={14} color="#e11d48" style={{ minWidth: '14px' }} />
          <span>
            <strong>Medical Notice:</strong> Demonstration feature. For life-threatening emergencies, contact emergency services (112 / 102) or a qualified physician immediately.
          </span>
        </div>
      </div>
    </section>
  );
};

export default EmergencyEssentialsSection;
