import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Store,
  Home,
  ShieldCheck,
  Truck,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const MapView = ({
  pharmacyLocation = { lat: 28.6328, lng: 77.2195, name: 'Apollo Pharmacy' },
  customerLocation = { lat: 28.629, lng: 77.214, name: 'Customer Delivery Address' },
  driverLocation = null, // [lng, lat] or { lat, lng }
  deliveryPartner = null,
  orderStatus = 'OUT_FOR_DELIVERY',
  etaText = '15 mins',
  distanceKm = 2.1,
  height = '360px',
  interactive = true,
  showRadiusRings = false,
  radiusKm = 10,
  pharmacies = [],
  selectedPharmacyId = null,
  onSelectPharmacy = null,
  routePolyline = null
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [riderProgress, setRiderProgress] = useState(0.5); // 0 to 1 along the curve
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [hoveredPharmacy, setHoveredPharmacy] = useState(null);

  // Parse driver coordinates
  const driverCoords = driverLocation
    ? Array.isArray(driverLocation)
      ? { lng: driverLocation[0], lat: driverLocation[1] }
      : driverLocation
    : null;

  // Real-time animation loop for rider motion when OUT_FOR_DELIVERY
  useEffect(() => {
    if (orderStatus === 'OUT_FOR_DELIVERY') {
      let animFrame;
      let start = Date.now();
      const duration = 12000; // Rider position interpolation animation

      const animate = () => {
        const elapsed = (Date.now() - start) % duration;
        const progress = elapsed / duration;
        // Smooth sine ease
        const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
        setRiderProgress(0.15 + eased * 0.75); // moves between 15% and 90% of route
        animFrame = requestAnimationFrame(animate);
      };

      animFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animFrame);
    } else if (orderStatus === 'DELIVERED') {
      setRiderProgress(1.0);
    } else if (orderStatus === 'DELIVERY_ASSIGNED') {
      setRiderProgress(0.1);
    } else {
      setRiderProgress(0.0);
    }
  }, [orderStatus]);

  // Live countdown timer for ETA
  useEffect(() => {
    let initialSeconds = 15 * 60;
    if (typeof etaText === 'string') {
      const match = etaText.match(/(\d+)/);
      if (match) initialSeconds = parseInt(match[1], 10) * 60;
    }
    setSecondsRemaining(initialSeconds);

    if (orderStatus === 'OUT_FOR_DELIVERY' || orderStatus === 'DELIVERY_ASSIGNED') {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 10 ? prev - 1 : 10));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [etaText, orderStatus]);

  const formatCountdown = (totalSec) => {
    if (!totalSec || totalSec <= 0) return etaText || '15 mins';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // SVG Coordinates Mapping (Map bounds: viewBox 0 0 800 450)
  // Origin (Pharmacy): (200, 180)
  // Waypoint 1: (320, 130)
  // Waypoint 2: (460, 290)
  // Waypoint 3: (560, 180)
  // Destination (Customer): (640, 240)
  const pharmacyPos = { x: 200, y: 180 };
  const customerPos = { x: 640, y: 240 };

  // Calculate cubic bezier point at t (rider position on route)
  const getBezierPoint = (t) => {
    const p0 = pharmacyPos;
    const p1 = { x: 320, y: 110 };
    const p2 = { x: 480, y: 310 };
    const p3 = customerPos;

    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const x = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
    const y = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;
    return { x, y };
  };

  const riderPos = getBezierPoint(riderProgress);

  // For multi-pharmacy network rendering:
  // Convert lat/lng offsets relative to customer center (400, 225)
  const centerPos = { x: 400, y: 225 };
  const centerLat = customerLocation?.lat || 28.6139;
  const centerLng = customerLocation?.lng || 77.209;

  const getPharmacyCanvasPos = (lat, lng, idx = 0) => {
    if (!lat || !lng) {
      // Fallback pseudo distribution
      const angle = (idx * (360 / Math.max(pharmacies.length, 1)) * Math.PI) / 180;
      const radius = 100 + (idx % 3) * 50;
      return {
        x: centerPos.x + Math.cos(angle) * radius,
        y: centerPos.y + Math.sin(angle) * radius
      };
    }
    const scale = 2200 * zoomLevel;
    const x = centerPos.x + (lng - centerLng) * scale;
    const y = centerPos.y - (lat - centerLat) * scale;
    return { x, y };
  };

  // Find active selected pharmacy for routing
  const activePharmacy =
    pharmacies.find((p) => p._id === selectedPharmacyId) ||
    (pharmacies.length > 0 ? pharmacies[0] : null);

  const selectedPos = activePharmacy
    ? getPharmacyCanvasPos(
        activePharmacy.location?.coordinates?.[1] || activePharmacy.lat,
        activePharmacy.location?.coordinates?.[0] || activePharmacy.lng
      )
    : null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        backgroundColor: '#0f172a',
        boxShadow: 'var(--shadow-md)',
        userSelect: 'none'
      }}
      className="hyperlocal-map-container"
    >
      {/* Hyperlocal Simulated Vector Canvas / Road Grid */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 450"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#090d16',
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease'
        }}
      >
        <defs>
          {/* Futuristic GPS Map Grid Pattern */}
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
          </pattern>
          <pattern id="mapGridMajor" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#334155" strokeWidth="1" />
          </pattern>

          {/* Route Gradients */}
          <linearGradient id="liveRouteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="selectedRouteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Radar animation filter */}
          <radialGradient id="serviceRadiusGrad">
            <stop offset="0%" stopColor="rgba(2, 132, 199, 0.22)" />
            <stop offset="70%" stopColor="rgba(2, 132, 199, 0.08)" />
            <stop offset="100%" stopColor="rgba(2, 132, 199, 0.0)" />
          </radialGradient>
        </defs>

        {/* Map Background Grids */}
        <rect width="100%" height="100%" fill="#0a0f1d" />
        <rect width="100%" height="100%" fill="url(#mapGrid)" />
        <rect width="100%" height="100%" fill="url(#mapGridMajor)" />

        {/* Arterial Road Networks */}
        <g strokeLinecap="round" strokeLinejoin="round">
          {/* Main Ring Road Highway */}
          <path
            d="M -50 200 C 150 60, 600 80, 850 160"
            fill="none"
            stroke="#1e293b"
            strokeWidth="20"
          />
          <path
            d="M -50 200 C 150 60, 600 80, 850 160"
            fill="none"
            stroke="#334155"
            strokeWidth="12"
          />
          <path
            d="M -50 200 C 150 60, 600 80, 850 160"
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray="10 8"
          />

          {/* Vertical City Expressway */}
          <path
            d="M 280 -50 L 250 500"
            fill="none"
            stroke="#1e293b"
            strokeWidth="18"
          />
          <path
            d="M 280 -50 L 250 500"
            fill="none"
            stroke="#334155"
            strokeWidth="10"
          />

          {/* Diagonal Sector Connector */}
          <path
            d="M 120 450 Q 400 240 700 -20"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
          />
          <path
            d="M 120 450 Q 400 240 700 -20"
            fill="none"
            stroke="#334155"
            strokeWidth="8"
          />

          {/* Hyperlocal Residential Streets */}
          <path d="M 80 120 L 720 120" stroke="#1e293b" strokeWidth="6" fill="none" />
          <path d="M 120 320 L 760 320" stroke="#1e293b" strokeWidth="6" fill="none" />
          <path d="M 450 40 L 450 420" stroke="#1e293b" strokeWidth="6" fill="none" />
          <path d="M 600 40 L 600 420" stroke="#1e293b" strokeWidth="6" fill="none" />
        </g>

        {/* Concentric Service Radius Rings (when showRadiusRings is true) */}
        {showRadiusRings && (
          <g>
            {/* 15km outer ring */}
            <circle
              cx={centerPos.x}
              cy={centerPos.y}
              r={190}
              fill="url(#serviceRadiusGrad)"
              stroke="rgba(2, 132, 199, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text
              x={centerPos.x + 195}
              y={centerPos.y + 4}
              fill="#0284c7"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="600"
            >
              15 km Max Radius
            </text>

            {/* 10km ring */}
            <circle
              cx={centerPos.x}
              cy={centerPos.y}
              r={130}
              fill="none"
              stroke="rgba(2, 132, 199, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={centerPos.x + 135}
              y={centerPos.y + 4}
              fill="#38bdf8"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="600"
            >
              10 km Express
            </text>

            {/* 5km ring */}
            <circle
              cx={centerPos.x}
              cy={centerPos.y}
              r={75}
              fill="none"
              stroke="rgba(16, 185, 129, 0.5)"
              strokeWidth="1.5"
            />
            <text
              x={centerPos.x + 80}
              y={centerPos.y + 4}
              fill="#10b981"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="700"
            >
              5 km Ultra-Fast
            </text>
          </g>
        )}

        {/* Multi-Pharmacy Network Routing Polyline (if selected pharmacy) */}
        {selectedPos && showRadiusRings && (
          <g>
            <path
              d={`M ${selectedPos.x} ${selectedPos.y} Q ${(selectedPos.x + centerPos.x) / 2 + 30} ${(selectedPos.y + centerPos.y) / 2 - 20} ${centerPos.x} ${centerPos.y}`}
              fill="none"
              stroke="url(#selectedRouteGlow)"
              strokeWidth="4"
              strokeDasharray="6 4"
            />
            <circle
              cx={(selectedPos.x + centerPos.x) / 2 + 15}
              cy={(selectedPos.y + centerPos.y) / 2 - 10}
              r="4"
              fill="#f59e0b"
            />
          </g>
        )}

        {/* Single Order Live Active Delivery Route Polyline */}
        {!showRadiusRings && (
          <g>
            {/* Background route glow */}
            <path
              d={`M ${pharmacyPos.x} ${pharmacyPos.y} C 320 110, 480 310, ${customerPos.x} ${customerPos.y}`}
              fill="none"
              stroke="rgba(2, 132, 199, 0.25)"
              strokeWidth="12"
            />
            {/* Active route line */}
            <path
              d={`M ${pharmacyPos.x} ${pharmacyPos.y} C 320 110, 480 310, ${customerPos.x} ${customerPos.y}`}
              fill="none"
              stroke="url(#liveRouteGlow)"
              strokeWidth="4"
              strokeDasharray="8 6"
            />

            {/* Waypoint nodes */}
            <circle cx="320" cy="110" r="3" fill="#38bdf8" opacity="0.7" />
            <circle cx="480" cy="310" r="3" fill="#38bdf8" opacity="0.7" />
          </g>
        )}

        {/* Pharmacy Markers on Network Map */}
        {showRadiusRings &&
          pharmacies.map((pharm, idx) => {
            const pPos = getPharmacyCanvasPos(
              pharm.location?.coordinates?.[1] || pharm.lat,
              pharm.location?.coordinates?.[0] || pharm.lng,
              idx
            );
            const isSelected = pharm._id === selectedPharmacyId;
            const isHovered = hoveredPharmacy === pharm._id;

            return (
              <g
                key={pharm._id || idx}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectPharmacy && onSelectPharmacy(pharm)}
                onMouseEnter={() => setHoveredPharmacy(pharm._id)}
                onMouseLeave={() => setHoveredPharmacy(null)}
              >
                {/* Glow ring if selected */}
                {isSelected && (
                  <circle
                    cx={pPos.x}
                    cy={pPos.y}
                    r="18"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                    opacity="0.8"
                  />
                )}
                {/* Pin Circle */}
                <circle
                  cx={pPos.x}
                  cy={pPos.y}
                  r={isSelected || isHovered ? "10" : "7"}
                  fill={
                    pharm.operatingHours?.is24x7
                      ? "#8b5cf6"
                      : pharm.availableInventoryCount > 0
                      ? "#0284c7"
                      : "#64748b"
                  }
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {/* Pharmacy Name Label */}
                <text
                  x={pPos.x}
                  y={pPos.y - 12}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isSelected ? "11" : "9"}
                  fontWeight={isSelected ? "800" : "600"}
                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                >
                  {pharm.name?.length > 18 ? `${pharm.name.substring(0, 16)}...` : pharm.name}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Origin (Pharmacy) HTML Marker (Single Order View) */}
      {!showRadiusRings && (
        <div
          style={{
            position: 'absolute',
            left: `${(pharmacyPos.x / 800) * 100}%`,
            top: `${(pharmacyPos.y / 450) * 100}%`,
            transform: 'translate(-50%, -100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              marginBottom: '3px'
            }}
          >
            <Store size={12} />
            <span>{pharmacyLocation.name || 'Apollo Pharmacy'}</span>
          </div>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              border: '2px solid #ffffff',
              boxShadow: '0 0 8px #0284c7'
            }}
          />
        </div>
      )}

      {/* Destination (Customer Delivery Address) HTML Marker */}
      <div
        style={{
          position: 'absolute',
          left: `${((showRadiusRings ? centerPos.x : customerPos.x) / 800) * 100}%`,
          top: `${((showRadiusRings ? centerPos.y : customerPos.y) / 450) * 100}%`,
          transform: 'translate(-50%, -100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.6875rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            marginBottom: '3px'
          }}
        >
          <Home size={12} />
          <span>{showRadiusRings ? 'Your Delivery Location' : 'Delivery Address'}</span>
        </div>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2.5px solid #ffffff',
            boxShadow: '0 0 10px #10b981'
          }}
        />
      </div>

      {/* Animated Live Vehicle / Rider Waypoint Marker (Single Order View) */}
      {!showRadiusRings &&
        (orderStatus === 'OUT_FOR_DELIVERY' ||
          orderStatus === 'DELIVERY_ASSIGNED' ||
          orderStatus === 'DELIVERED') && (
          <div
            style={{
              position: 'absolute',
              left: `${(riderPos.x / 800) * 100}%`,
              top: `${(riderPos.y / 450) * 100}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 25,
              transition: orderStatus === 'DELIVERED' ? 'all 0.5s ease-out' : 'none'
            }}
          >
            {/* Live Rider Info Tooltip */}
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: '1px solid #38bdf8',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.625rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)'
              }}
            >
              <span>
                {deliveryPartner?.vehicleType === 'Electric Scooter'
                  ? '⚡'
                  : deliveryPartner?.vehicleType === 'Bicycle'
                  ? '🚲'
                  : '🛵'}
              </span>
              <span>
                {deliveryPartner?.name || 'QuickMeds Rider'}
                {orderStatus === 'OUT_FOR_DELIVERY' ? ` • ${formatCountdown(secondsRemaining)}` : ''}
              </span>
            </div>

            {/* Pulsing Radar Vehicle Icon */}
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: orderStatus === 'DELIVERED' ? '#10b981' : '#f43f5e',
                color: '#ffffff',
                border: '2.5px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  orderStatus === 'DELIVERED'
                    ? '0 0 14px rgba(16, 185, 129, 0.8)'
                    : '0 0 16px rgba(244, 63, 94, 0.8)'
              }}
              className="animate-pulse"
            >
              {orderStatus === 'DELIVERED' ? (
                <CheckCircle2 size={15} />
              ) : (
                <Truck size={14} />
              )}
            </div>
          </div>
        )}

      {/* Floating Interactive Map Controls (Zoom & Center) */}
      {interactive && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 30
          }}
        >
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1.0)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
            title="Reset View"
          >
            <Compass size={16} />
          </button>
        </div>
      )}

      {/* Bottom Live Overlay Pill (Delivery Status / ETA / Radius) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 30,
          color: '#ffffff',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Navigation size={15} color="#38bdf8" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            {showRadiusRings
              ? `${radiusKm} km Search Radius`
              : `${distanceKm} km Hyperlocal Delivery`}
          </span>
        </div>

        {orderStatus === 'OUT_FOR_DELIVERY' && (
          <div
            style={{
              fontSize: '0.75rem',
              color: '#10b981',
              fontWeight: 700,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Clock size={12} />
            <span>ETA: ~{formatCountdown(secondsRemaining)}</span>
          </div>
        )}

        {orderStatus === 'DELIVERED' && (
          <div
            style={{
              fontSize: '0.75rem',
              color: '#10b981',
              fontWeight: 700,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <CheckCircle2 size={13} />
            <span>Delivered Successfully</span>
          </div>
        )}

        {showRadiusRings && (
          <div
            style={{
              fontSize: '0.75rem',
              color: '#38bdf8',
              fontWeight: 700,
              backgroundColor: 'rgba(2, 132, 199, 0.2)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)'
            }}
          >
            {pharmacies.length} Verified Pharmacies in Range
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
