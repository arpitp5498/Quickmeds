import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  AlertTriangle,
  Search,
  Heart,
  Flame,
  Sparkles,
  Check,
  ArrowRight,
  RefreshCw
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

const CATEGORY_META = {
  MENSTRUAL_CARE: {
    title: '1. MENSTRUAL CARE',
    subtitle: 'Sanitary pads, tampons & menstrual hygiene essentials',
    icon: Heart,
    color: '#be185d',
    bgColor: '#fdf2f8',
    borderColor: '#fbcfe8'
  },
  COMFORT_RELIEF: {
    title: '2. COMFORT & RELIEF',
    subtitle: 'Heating pads, cramp patches, ORS & OTC pain relief',
    icon: Flame,
    color: '#c2410c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa'
  },
  HYGIENE_ESSENTIALS: {
    title: '3. HYGIENE ESSENTIALS',
    subtitle: 'Wet wipes, tissues, disposal bags & sanitizers',
    icon: Sparkles,
    color: '#047857',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0'
  }
};

const EmergencyEssentialsSection = ({ className = '' }) => {
  const [categoriesData, setCategoriesData] = useState({
    MENSTRUAL_CARE: [],
    COMFORT_RELIEF: [],
    HYGIENE_ESSENTIALS: []
  });
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingOrder, setBuildingOrder] = useState(false);

  const { addToCart } = useCart();
  const { location } = useLocation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSOSData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/medicines/emergency-essentials');
        if (res.success && res.data) {
          if (res.data.categories) {
            setCategoriesData(res.data.categories);
          }
          setAllMedicines(res.data.medicines || []);
        }
      } catch (err) {
        console.warn('Could not fetch SOS emergency data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSOSData();
  }, []);

  // Filter medicines by optional quick search term
  const filterList = (items) => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.genericName.toLowerCase().includes(term) ||
        m.brand.toLowerCase().includes(term)
    );
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  };

  const selectedList = useMemo(() => {
    return allMedicines.filter((m) => selectedIds[m._id]);
  }, [allMedicines, selectedIds]);

  const selectedCount = selectedList.length;

  const totalEstimatedPrice = useMemo(() => {
    return selectedList.reduce((sum, item) => sum + (item.lowestPrice || item.mrp || 0), 0);
  }, [selectedList]);

  const handleBuildOrder = async () => {
    if (selectedCount === 0) return;

    try {
      setBuildingOrder(true);
      let successCount = 0;

      for (const item of selectedList) {
        const unitPrice = item.lowestPrice || item.mrp;
        const success = await addToCart(item._id, 1, unitPrice);
        if (success) successCount++;
      }

      if (successCount > 0) {
        showToast(
          `Added ${successCount} SOS item${successCount > 1 ? 's' : ''} to cart! QuickMeds is auto-routing fulfilment.`,
          'success'
        );
        navigate('/cart');
      }
    } catch (err) {
      showToast('Failed to build SOS order. Please try again.', 'error');
    } finally {
      setBuildingOrder(false);
    }
  };

  return (
    <div className={`sos-container ${className}`} style={{ marginBottom: '2.5rem' }}>
      {/* Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '140px',
            height: '140px',
            background: 'radial-gradient(circle, rgba(244,63,94,0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span
            style={{
              backgroundColor: '#e11d48',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Zap size={13} fill="#ffffff" /> 🚨 SOS ORDER
          </span>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            Near {location.address || 'Your Location'}
          </span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
          Select What You Need
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '640px', lineHeight: 1.5 }}>
          Curated emergency &amp; comfort essentials checklist for fast selection. Choose your required items, and the QuickMeds Smart Fulfilment Engine will automatically assign the best pharmacy.
        </p>

        {/* Quick Filter Search */}
        <div style={{ marginTop: '1.25rem', maxWidth: '360px', position: 'relative' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search SOS essentials (e.g. Pads, ORS, Wipes)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '0.8125rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton height="180px" borderRadius="var(--radius-lg)" />
          <Skeleton height="180px" borderRadius="var(--radius-lg)" />
          <Skeleton height="180px" borderRadius="var(--radius-lg)" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {Object.keys(CATEGORY_META).map((catKey) => {
            const meta = CATEGORY_META[catKey];
            const rawItems = categoriesData[catKey] || [];
            const items = filterList(rawItems);
            const Icon = meta.icon;

            if (items.length === 0 && searchTerm) return null;

            return (
              <Card
                key={catKey}
                style={{
                  backgroundColor: '#ffffff',
                  border: `1.5px solid ${meta.borderColor}`,
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}
              >
                {/* Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '1rem',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--border-light)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: meta.bgColor,
                      color: meta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: meta.color,
                        letterSpacing: '0.02em',
                        margin: 0
                      }}
                    >
                      {meta.title}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {meta.subtitle}
                    </span>
                  </div>
                </div>

                {/* Items Grid Checklist */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                    gap: '14px'
                  }}
                >
                  {items.map((item) => {
                    const isSelected = !!selectedIds[item._id];
                    const itemPrice = item.lowestPrice || item.mrp;

                    return (
                      <div
                        key={item._id}
                        onClick={() => toggleSelect(item._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: isSelected ? meta.bgColor : 'var(--bg-subtle)',
                          border: `2px solid ${isSelected ? meta.color : 'var(--border-light)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          userSelect: 'none',
                          boxShadow: isSelected ? `0 3px 12px ${meta.color}22` : 'none',
                          minHeight: '84px'
                        }}
                      >
                        {/* Checkbox Control */}
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? meta.color : '#ffffff',
                            border: `2px solid ${isSelected ? meta.color : 'var(--border-medium)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected && <Check size={16} strokeWidth={3} />}
                        </div>

                        {/* Slightly Larger Visual Thumbnail (58px) */}
                        <div
                          style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: '#ffffff',
                            border: '1px solid var(--border-light)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            padding: '3px'
                          }}
                        >
                          <img
                            src={getMedicineImage(item)}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>

                        {/* Item Info with Up To 2-Line Title */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <h4
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              color: 'var(--text-main)',
                              margin: 0,
                              lineHeight: 1.25,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '2.25em'
                            }}
                          >
                            {item.name}
                          </h4>

                          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: meta.color }}>
                              ₹{itemPrice}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.strength || item.genericName}
                            </span>
                            <div style={{ marginLeft: 'auto' }}>
                              {item.requiresPrescription ? (
                                <Badge variant="prescription" size="sm">Rx</Badge>
                              ) : (
                                <Badge variant="success" size="sm">OTC</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div
        style={{
          position: 'sticky',
          bottom: '16px',
          zIndex: 90,
          marginTop: '1.75rem',
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--primary-600)',
          borderRadius: 'var(--radius-xl)',
          padding: '1rem 1.25rem',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: selectedCount > 0 ? 'var(--primary-100)' : 'var(--bg-subtle)',
              color: selectedCount > 0 ? 'var(--primary-700)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem'
            }}
          >
            {selectedCount}
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {selectedCount > 0
                ? `${selectedCount} SOS Essential${selectedCount > 1 ? 's' : ''} Selected`
                : 'Select SOS Essentials Above'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedCount > 0
                ? `Estimated Subtotal: ₹${totalEstimatedPrice}`
                : 'Tap items above to build your quick SOS order'}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          disabled={selectedCount === 0 || buildingOrder}
          loading={buildingOrder}
          onClick={handleBuildOrder}
          icon={ShoppingBag}
          style={{
            minWidth: '220px',
            backgroundColor: selectedCount > 0 ? '#e11d48' : undefined,
            borderColor: selectedCount > 0 ? '#e11d48' : undefined
          }}
        >
          {selectedCount > 0 ? `Build SOS Order — ${selectedCount} Items` : 'Select Items'}
        </Button>
      </div>

      {/* Safety Disclaimer Notice */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '10px 14px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <ShieldCheck size={14} color="var(--primary-600)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Demonstration feature:</strong> For medical emergencies, contact local emergency services or a qualified healthcare professional. QuickMeds automatically routes all orders to licensed pharmacies.
        </span>
      </div>
    </div>
  );
};

export default EmergencyEssentialsSection;
