import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Store,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Zap,
  TrendingDown,
  AlertTriangle,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';

/**
 * BasketOptimizationBreakdown Component
 *
 * Basket optimization breakdown:
 * - Animated loading pulse during API call to /api/routing/optimize
 * - Basket coverage indicator badge (100% / Split / Partial)
 * - Consolidated estimated price breakdown
 * - Expandable "How was this option selected?" with 5 multi-factor scoring criteria & weights:
 *     1. Stock Availability (35%)
 *     2. Proximity to Customer (25%)
 *     3. Estimated Preparation & Delivery Time (15%)
 *     4. Price Competitiveness (15%)
 *     5. Pharmacy Rating & Reliability (10%)
 * - Selected pharmacy details (Name, Address, Distance in km, ETA in mins, Rating stars)
 */
const BasketOptimizationBreakdown = ({
  cartItems = [],
  coordinates = null,
  optimizationData = null,
  onPlanOptimized = null,
  compact = false,
  showPricingBreakdown = true
}) => {
  const [loading, setLoading] = useState(false);
  const [routingResult, setRoutingResult] = useState(optimizationData || null);
  const [error, setError] = useState(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showAlternative, setShowAlternative] = useState(false);

  // Fetch or recompute optimization plan from API
  const fetchOptimization = useCallback(async () => {
    if (optimizationData) {
      setRoutingResult(optimizationData);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setRoutingResult(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare payload items
      const formattedItems = cartItems.map((item) => {
        const medicineId = item.medicineId?._id || item.medicineId || item._id;
        return {
          medicineId,
          quantity: item.quantity || 1,
          name: item.name || item.medicineId?.name || 'Medicine',
          price: item.price || 50
        };
      });

      // Prepare coordinates payload
      let coordsPayload = [77.2090, 28.6139]; // Default New Delhi coordinates
      if (Array.isArray(coordinates) && coordinates.length === 2) {
        coordsPayload = coordinates;
      } else if (coordinates && typeof coordinates === 'object' && coordinates.lng && coordinates.lat) {
        coordsPayload = [Number(coordinates.lng), Number(coordinates.lat)];
      }

      const res = await api.post('/routing/optimize', {
        items: formattedItems,
        coordinates: coordsPayload,
        maxDistanceKm: 15
      });

      if (res.success && res.data) {
        setRoutingResult(res.data);
        if (onPlanOptimized) {
          onPlanOptimized(res.data);
        }
      }
    } catch (err) {
      console.warn('Smart routing optimization notice:', err);
      setError(err.message || 'Could not compute optimal routing plan.');
    } finally {
      setLoading(false);
    }
  }, [cartItems, coordinates, optimizationData, onPlanOptimized]);

  useEffect(() => {
    fetchOptimization();
  }, [fetchOptimization]);

  // Loading State with Pulse Animation
  if (loading) {
    return (
      <Card
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
          border: '1px solid var(--primary-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulseGlow 1.5s ease-in-out infinite'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                Optimizing your fulfilment...
              </h4>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                Smart Fulfilment Engine
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--primary-700)', marginTop: '2px' }}>
              Evaluating live inventory matching, road proximity, delivery ETA, estimated pricing & reliability weights...
            </p>
          </div>
        </div>

        {/* Shimmer pulse bar */}
        <div
          style={{
            marginTop: '12px',
            height: '4px',
            width: '100%',
            backgroundColor: 'var(--primary-100)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            style={{
              height: '100%',
              width: '40%',
              backgroundColor: 'var(--primary-600)',
              borderRadius: 'var(--radius-full)',
              animation: 'pulseGlow 1.2s ease-in-out infinite'
            }}
          />
        </div>
      </Card>
    );
  }

  // Error or empty state
  if (error || !routingResult || !routingResult.recommended) {
    if (!cartItems || cartItems.length === 0) return null;
    return (
      <Card
        style={{
          border: '1px dashed var(--border-medium)',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          backgroundColor: 'var(--bg-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--warning)" />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {error || 'Routing engine awaiting items selection.'}
            </span>
          </div>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchOptimization}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const plan = routingResult.recommended;
  const isSplit = plan.type === 'SPLIT_BASKET' || (plan.fulfilmentPoints && plan.fulfilmentPoints > 1);
  const coveragePct = Math.round((plan.basketCoverage || 1.0) * 100);
  const itemsCovered = plan.itemsCovered || cartItems.length;
  const totalItems = plan.totalItems || cartItems.length;
  const compositeScorePct = Math.round((plan.compositeScore || 0.92) * 100);
  const breakdown = plan.scoreBreakdown || {
    availability: 1.0,
    proximity: 0.9,
    eta: 0.85,
    price: 0.95,
    rating: 0.96
  };

  const primaryPharmacy = plan.pharmacies && plan.pharmacies[0] ? plan.pharmacies[0] : null;
  const secondaryPharmacy = plan.pharmacies && plan.pharmacies[1] ? plan.pharmacies[1] : null;

  return (
    <Card
      style={{
        border: '1px solid #bfdbfe',
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: compact ? '1rem' : '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Header Bar: Engine Badge & Basket Coverage */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff'
            }}
          >
            <Zap size={15} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--primary-950)' }}>
              Smart Fulfilment Routing
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Hyperlocal Multi-Factor Optimization Engine
            </span>
          </div>
        </div>

        {/* Coverage Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isSplit ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#ede9fe',
                color: '#6d28d9',
                border: '1px solid #ddd6fe'
              }}
            >
              <Layers size={13} />
              Split Fulfilment: {plan.fulfilmentPoints} Pharmacies ({coveragePct}% Coverage)
            </span>
          ) : coveragePct >= 100 ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'var(--secondary-50)',
                color: 'var(--secondary-700)',
                border: '1px solid rgba(22, 163, 74, 0.3)'
              }}
            >
              <CheckCircle2 size={13} color="var(--secondary-600)" />
              Basket Coverage: {itemsCovered}/{totalItems} items (100%)
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a'
              }}
            >
              <AlertTriangle size={13} color="#b45309" />
              Partial Coverage: {itemsCovered}/{totalItems} items ({coveragePct}%)
            </span>
          )}
        </div>
      </div>

      {/* Selected Pharmacy Details */}
      <div style={{ marginTop: '12px' }}>
        {!isSplit && primaryPharmacy ? (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)',
                  minWidth: '42px'
                }}
              >
                <Store size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <h5 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--primary-950)' }}>
                    {primaryPharmacy.name}
                  </h5>
                  <Badge variant="verified" size="sm">
                    <ShieldCheck size={11} /> Verified Partner
                  </Badge>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={12} color="var(--primary-600)" />
                    {primaryPharmacy.distanceKm !== undefined
                      ? `${Number(primaryPharmacy.distanceKm).toFixed(1)} km away`
                      : 'Nearby'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} color="var(--secondary-600)" />
                    {plan.etaText || `${plan.etaMinutes || 18} mins (Target)`}
                  </span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <StarRating rating={4.8} size={12} />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', marginLeft: '2px' }}>4.8</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                Composite Score
              </span>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--secondary-700)'
                }}
              >
                {compositeScorePct}%
              </span>
            </div>
          </div>
        ) : isSplit ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8125rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color="var(--primary-600)" />
                <div>
                  <strong>{primaryPharmacy?.name || 'Pharmacy Store A'}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.75rem' }}>
                    ({Number(primaryPharmacy?.distanceKm || 1.2).toFixed(1)} km)
                  </span>
                </div>
              </div>
              <Badge variant="primary" size="sm">
                Fulfills {primaryPharmacy?.itemsFulfilled?.length || 'Part'} items
              </Badge>
            </div>

            {secondaryPharmacy && (
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#f5f3ff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #ddd6fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={18} color="#7c3aed" />
                  <div>
                    <strong>{secondaryPharmacy.name}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.75rem' }}>
                      ({Number(secondaryPharmacy.distanceKm || 2.4).toFixed(1)} km)
                    </span>
                  </div>
                </div>
                <Badge variant="info" size="sm">
                  Fulfills remaining items
                </Badge>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Rationale Explanation */}
      {plan.explanation && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px'
          }}
        >
          <Info size={14} color="var(--primary-600)" style={{ minWidth: '14px', marginTop: '1px' }} />
          <span>{plan.explanation}</span>
        </div>
      )}

      {/* Pricing Breakdown (Consolidated Single Order Value) */}
      {showPricingBreakdown && plan.priceBreakdown && (
        <div
          style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px dashed var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Consolidated Fulfilment Valuation
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#b45309',
                backgroundColor: '#fef3c7',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #fde68a'
              }}
            >
              Estimated pricing
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Medicine Items Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{plan.priceBreakdown?.itemsSubtotal || plan.totalOrderValue || plan.totalDemoValue - 30}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Hyperlocal Delivery Fee ({isSplit ? '2 Multi-Drop' : 'Direct Dispatch'})</span>
              <span style={{ fontWeight: 600 }}>₹{plan.priceBreakdown?.deliveryFee || 25}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Safety & Packaging / Platform Charge</span>
              <span style={{ fontWeight: 600 }}>₹{plan.priceBreakdown?.platformFee || 5}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                marginTop: '4px',
                borderTop: '1px solid var(--border-light)',
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--primary-700)'
              }}
            >
              <span>Estimated Order Total</span>
              <span>₹{plan.totalOrderValue || plan.totalDemoValue || (plan.priceBreakdown?.itemsSubtotal + 30)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Expandable "How was this option selected?" Accordion */}
      <div style={{ marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: isAccordionOpen ? 'var(--primary-100)' : 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--primary-800)',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--primary-600)" />
            <span>How was this option selected? (5 Scoring Factors)</span>
          </div>
          {isAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isAccordionOpen && (
          <div
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-100)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                  Multi-Factor Scoring Engine Weights (QuickMeds Standard)
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary-700)' }}>
                  Total: {compositeScorePct}/100
                </span>
              </div>
            </div>

            {/* 5 Scoring Criteria Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 1. Stock Availability (35%) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    1. Stock Availability <strong style={{ color: 'var(--primary-700)' }}>(35% Weight)</strong>
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {Math.round((breakdown.availability || 1.0) * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((breakdown.availability || 1.0) * 100)}%`,
                      backgroundColor: 'var(--secondary-600)',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              {/* 2. Proximity to Customer (25%) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    2. Proximity to Customer <strong style={{ color: 'var(--primary-700)' }}>(25% Weight)</strong>
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {Math.round((breakdown.proximity || 0.88) * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((breakdown.proximity || 0.88) * 100)}%`,
                      backgroundColor: 'var(--primary-600)',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              {/* 3. Estimated Prep & Delivery Time (15%) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    3. Estimated Preparation & Delivery Time <strong style={{ color: 'var(--primary-700)' }}>(15% Weight)</strong>
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {Math.round((breakdown.eta || 0.85) * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((breakdown.eta || 0.85) * 100)}%`,
                      backgroundColor: '#3b82f6',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              {/* 4. Demo Price Index (15%) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    4. Price Competitiveness <strong style={{ color: 'var(--primary-700)' }}>(15% Weight)</strong>
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {Math.round((breakdown.price || 0.95) * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((breakdown.price || 0.95) * 100)}%`,
                      backgroundColor: '#8b5cf6',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              {/* 5. Pharmacy Rating & Reliability (10%) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    5. Pharmacy Rating & Reliability <strong style={{ color: 'var(--primary-700)' }}>(10% Weight)</strong>
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {Math.round((breakdown.rating || 0.96) * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((breakdown.rating || 0.96) * 100)}%`,
                      backgroundColor: '#f59e0b',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-light)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Algorithm Formula: S = 0.35·A + 0.25·P + 0.15·E + 0.15·C + 0.10·R</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>QuickMeds AI Engine</span>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Plan (if available) */}
      {routingResult.alternative && (
        <div style={{ marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => setShowAlternative(!showAlternative)}
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0
            }}
          >
            {showAlternative ? 'Hide alternative option' : 'View alternative fulfilment option'}
          </button>

          {showAlternative && (
            <div
              style={{
                marginTop: '6px',
                padding: '8px 10px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--border-medium)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              <strong>Alternative: </strong>
              {routingResult.alternative.pharmacies?.[0]?.name || 'Secondary store'} (
              {routingResult.alternative.pharmacies?.[0]?.distanceKm ? `${Number(routingResult.alternative.pharmacies[0].distanceKm).toFixed(1)} km` : '2.1 km'}
              , ETA: {routingResult.alternative.etaMinutes || 22} mins, Score: {Math.round((routingResult.alternative.compositeScore || 0.85) * 100)}%
              ) — {routingResult.alternative.explanation || 'Secondary candidate'}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default BasketOptimizationBreakdown;
