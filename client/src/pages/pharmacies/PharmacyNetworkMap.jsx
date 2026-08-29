import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Search,
  Navigation,
  Sliders,
  CheckCircle2,
  Phone,
  Package,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  X,
  Compass
} from 'lucide-react';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Skeleton from '../../components/ui/Skeleton';
import MapView from '../../components/common/MapView';

const PharmacyNetworkMap = () => {
  const { location } = useLocation();
  const navigate = useNavigate();

  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState(10); // 1 km to 15 km slider
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'IN_STOCK' | '24X7'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch pharmacies based on radius and filters
  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        setLoading(true);
        let url = `/pharmacies/nearby?lat=${location.lat}&lng=${location.lng}&maxDistanceKm=${radiusKm}`;

        if (filterMode === 'IN_STOCK') {
          url += '&inStockOnly=true';
        } else if (filterMode === '24X7') {
          url += '&is24x7=true';
        }

        if (searchTerm.trim()) {
          url += `&search=${encodeURIComponent(searchTerm.trim())}`;
        }

        const res = await api.get(url);
        if (res.success && res.data) {
          const list = res.data.pharmacies || [];
          setPharmacies(list);
          if (list.length > 0 && !selectedPharmacy) {
            setSelectedPharmacy(list[0]);
          } else if (list.length === 0) {
            setSelectedPharmacy(null);
          }
        }
      } catch (err) {
        console.warn('Error fetching pharmacy network:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetwork();
  }, [location.lat, location.lng, radiusKm, filterMode, searchTerm]);

  const handleSelectPharmacy = (pharm) => {
    setSelectedPharmacy(pharm);
    setDrawerOpen(true);
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem' }}>
      {/* Top Header & Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              Hyperlocal Pharmacy Network Map
            </h1>
            <Badge variant="verified" size="md">
              <ShieldCheck size={14} /> Live Pharmacy Grid
            </Badge>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Explore licensed pharmacies in real-time within your customized delivery zone near{' '}
            <strong>{location.address}</strong>
          </p>
        </div>

        <Link
          to="/pharmacies"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--primary-600)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none'
          }}
        >
          <span>Switch to List View</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Control Panel: Radius Slider, Stock Filters & Search */}
      <Card style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center'
          }}
        >
          {/* 1. Radius Slider */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}
            >
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Compass size={16} color="var(--primary-600)" />
                <span>Search Radius:</span>
              </label>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: 'var(--primary-600)',
                  backgroundColor: 'var(--primary-50)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {radiusKm} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                accentColor: 'var(--primary-600)',
                cursor: 'pointer'
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                marginTop: '4px'
              }}
            >
              <span>1 km (Ultra-Local)</span>
              <span>5 km</span>
              <span>10 km</span>
              <span>15 km (City Zone)</span>
            </div>
          </div>

          {/* 2. Stock Availability Filter Tabs */}
          <div>
            <label
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                marginBottom: '8px',
                display: 'block'
              }}
            >
              Stock & Operation Filter:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    filterMode === 'ALL'
                      ? '1.5px solid var(--primary-600)'
                      : '1px solid var(--border-medium)',
                  backgroundColor:
                    filterMode === 'ALL' ? 'var(--primary-600)' : 'var(--bg-card)',
                  color: filterMode === 'ALL' ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.2s'
                }}
              >
                All Pharmacies
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('IN_STOCK')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    filterMode === 'IN_STOCK'
                      ? '1.5px solid var(--secondary-600)'
                      : '1px solid var(--border-medium)',
                  backgroundColor:
                    filterMode === 'IN_STOCK' ? 'var(--secondary-600)' : 'var(--bg-card)',
                  color: filterMode === 'IN_STOCK' ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.2s'
                }}
              >
                📦 In-Stock Only
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('24X7')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    filterMode === '24X7'
                      ? '1.5px solid #8b5cf6'
                      : '1px solid var(--border-medium)',
                  backgroundColor:
                    filterMode === '24X7' ? '#8b5cf6' : 'var(--bg-card)',
                  color: filterMode === '24X7' ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.2s'
                }}
              >
                🌙 24x7 Open
              </button>
            </div>
          </div>

          {/* 3. Search Bar */}
          <div>
            <label
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                marginBottom: '8px',
                display: 'block'
              }}
            >
              Search by Pharmacy Name:
            </label>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by chemist name or street..."
            />
          </div>
        </div>
      </Card>

      {/* Main Map & Interactive Side Panel Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)',
          gap: '1.5rem',
          alignItems: 'start'
        }}
        className="pharmacy-network-grid"
      >
        {/* Left: Full-Featured Map View */}
        <div style={{ position: 'relative' }}>
          <MapView
            pharmacyLocation={{
              name: selectedPharmacy?.name || 'Apollo Pharmacy',
              lat: selectedPharmacy?.location?.coordinates?.[1] || location.lat,
              lng: selectedPharmacy?.location?.coordinates?.[0] || location.lng
            }}
            customerLocation={{
              name: location.address,
              lat: location.lat,
              lng: location.lng
            }}
            height="540px"
            showRadiusRings={true}
            radiusKm={radiusKm}
            pharmacies={pharmacies}
            selectedPharmacyId={selectedPharmacy?._id}
            onSelectPharmacy={handleSelectPharmacy}
          />

          {/* Floating Map Legend */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(6px)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.6875rem',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 35,
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '2px', color: '#38bdf8' }}>
              Map Legend
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>Your Delivery Address</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
              <span>Verified Partner Chemist</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
              <span>24x7 Open Night Care</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#f59e0b' }} />
              <span>Selected Shortest Delivery Route</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Pharmacy Drawer & Filtered Chemist List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Selected Pharmacy Drawer Card */}
          {selectedPharmacy ? (
            <Card
              style={{
                border: '2px solid var(--primary-500)',
                boxShadow: 'var(--shadow-md)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Store size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 800 }}>
                        {selectedPharmacy.name}
                      </h3>
                      <Badge variant="verified" size="sm">
                        <ShieldCheck size={12} /> Verified
                      </Badge>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedPharmacy.address?.fullAddress ||
                        `${selectedPharmacy.address?.street}, ${selectedPharmacy.address?.city}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats & Proximity */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginTop: '1rem',
                  padding: '10px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>
                    Proximity
                  </span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--primary-700)' }}>
                    📍 {selectedPharmacy.distanceKm} km
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>
                    Live ETA
                  </span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--secondary-700)' }}>
                    ⚡ ~{selectedPharmacy.etaText || '15 mins'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>
                    Rating
                  </span>
                  <strong style={{ fontSize: '0.875rem', color: '#f59e0b' }}>
                    ★ {selectedPharmacy.rating} ({selectedPharmacy.totalRatings || 12})
                  </strong>
                </div>
              </div>

              {/* Inventory & Timing Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  fontSize: '0.75rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                  <Package size={14} color="var(--primary-600)" />
                  <strong>
                    {selectedPharmacy.availableInventoryCount !== undefined
                      ? `${selectedPharmacy.availableInventoryCount} Medicines in Stock`
                      : 'Stock Active'}
                  </strong>
                </span>

                <span
                  style={{
                    color: selectedPharmacy.operatingHours?.is24x7
                      ? '#8b5cf6'
                      : 'var(--secondary-600)',
                    fontWeight: 700
                  }}
                >
                  {selectedPharmacy.operatingHours?.is24x7
                    ? '24x7 Open'
                    : `Open: ${selectedPharmacy.operatingHours?.open || '8 AM'} - ${selectedPharmacy.operatingHours?.close || '11 PM'}`}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/pharmacies/${selectedPharmacy._id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>Browse Medicines & Catalog</span>
                  <ArrowRight size={15} />
                </Button>
              </div>
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Store size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Click any pharmacy pin on the map to inspect live inventory and route details.
              </p>
            </Card>
          )}

          {/* List of Nearby Pharmacies in Zone */}
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}
            >
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                Chemists in {radiusKm} km Radius ({pharmacies.length})
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click to inspect
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton height="60px" />
                <Skeleton height="60px" />
                <Skeleton height="60px" />
              </div>
            ) : pharmacies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.8125rem' }}>
                  No verified pharmacies found matching this filter within {radiusKm} km.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRadiusKm(15);
                    setFilterMode('ALL');
                    setSearchTerm('');
                  }}
                  style={{ marginTop: '8px' }}
                >
                  Reset Radius to 15 km
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}
              >
                {pharmacies.map((pharm) => {
                  const isSelected = pharm._id === selectedPharmacy?._id;
                  return (
                    <div
                      key={pharm._id}
                      onClick={() => handleSelectPharmacy(pharm)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '1.5px solid var(--primary-500)'
                          : '1px solid var(--border-light)',
                        backgroundColor: isSelected
                          ? 'var(--primary-50)'
                          : 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                            {pharm.name}
                          </span>
                          {pharm.operatingHours?.is24x7 && (
                            <Badge variant="info" size="sm">24x7</Badge>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--primary-700)'
                          }}
                        >
                          {pharm.distanceKm} km
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '4px',
                          fontSize: '0.6875rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <span>★ {pharm.rating} rating</span>
                        <span>⚡ ~{pharm.etaText}</span>
                        <span>
                          {pharm.availableInventoryCount !== undefined
                            ? `${pharm.availableInventoryCount} in stock`
                            : 'Verified'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PharmacyNetworkMap;
