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
  ChevronRight,
  Map,
  Sparkles,
  Package
} from 'lucide-react';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Skeleton from '../../components/ui/Skeleton';
import MapView from '../../components/common/MapView';

const NearbyPharmacies = () => {
  const { location } = useLocation();
  const navigate = useNavigate();

  const [pharmacies, setPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('nearest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        let url = `/pharmacies/nearby?lat=${location.lat}&lng=${location.lng}&sort=${sort}`;
        if (searchTerm.trim()) {
          url += `&search=${encodeURIComponent(searchTerm.trim())}`;
        }
        const res = await api.get(url);
        if (res.success && res.data) {
          setPharmacies(res.data.pharmacies || []);
        }
      } catch (err) {
        console.warn('Error fetching nearby pharmacies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [location.lat, location.lng, sort, searchTerm]);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title & Location Header */}
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
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Nearby Licensed Pharmacies</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Discover verified neighbourhood chemists near <strong>{location.address}</strong>
          </p>
        </div>

        {/* CTA to Full-Screen Dedicated Pharmacy Network Map */}
        <Link
          to="/pharmacy-network"
          style={{ textDecoration: 'none' }}
        >
          <Button
            variant="primary"
            size="md"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
            }}
          >
            <Map size={18} />
            <span>Open Dedicated Network Map</span>
            <ChevronRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Network Map Interactive Banner Callout */}
      <Card
        style={{
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1.5px solid var(--primary-300)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Navigation size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>
                Interactive 1–15 km Service Radius Map Available
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Filter verified chemists by 24x7 operation, real-time stock levels, and inspect dynamic route polylines.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/pharmacy-network')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Launch Network Map</span>
            <ChevronRight size={14} />
          </Button>
        </div>
      </Card>

      {/* Map Overview Header */}
      <div style={{ marginBottom: '2rem' }}>
        <MapView
          pharmacyLocation={{
            name: pharmacies[0]?.name || 'Apollo Pharmacy',
            lat: pharmacies[0]?.location?.coordinates?.[1] || location.lat,
            lng: pharmacies[0]?.location?.coordinates?.[0] || location.lng
          }}
          customerLocation={{
            name: location.address,
            lat: location.lat,
            lng: location.lng
          }}
          distanceKm={pharmacies[0]?.distanceKm || 1.8}
          etaText={pharmacies[0]?.etaText || '15 mins'}
          height="240px"
          pharmacies={pharmacies}
          showRadiusRings={true}
          radiusKm={10}
          onSelectPharmacy={(p) => navigate(`/pharmacies/${p._id}`)}
        />
      </div>

      {/* Search & Sort Filters */}
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
            placeholder="Search chemist by name or street..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Sort:
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          >
            <option value="nearest">Nearest Distance</option>
            <option value="rating">Top Rated</option>
            <option value="orders">Most Orders Delivered</option>
          </select>
        </div>
      </div>

      {/* Pharmacy Listings */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="80px" />
            </Card>
          ))}
        </div>
      ) : pharmacies.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Store size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
            No Verified Pharmacies Found in this Area
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
            Try expanding your search radius or selecting another location from the top navigation bar.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pharmacies.map((pharm) => (
            <Card
              key={pharm._id}
              hoverable
              onClick={() => navigate(`/pharmacies/${pharm._id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '56px'
                  }}
                >
                  <Store size={28} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{pharm.name}</h3>
                    <Badge variant="verified" size="sm">
                      <ShieldCheck size={12} /> Verified Partner
                    </Badge>
                    {pharm.operatingHours?.is24x7 && (
                      <Badge variant="info" size="sm">24x7 Open</Badge>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {pharm.address?.fullAddress || `${pharm.address?.street}, ${pharm.address?.city}`}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '6px',
                      fontSize: '0.75rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                      📍 {pharm.distanceKm} km away
                    </span>
                    <span style={{ color: 'var(--secondary-700)', fontWeight: 700 }}>
                      ⚡ ~{pharm.etaText} delivery
                    </span>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                      ★ {pharm.rating} ({pharm.totalRatings} reviews)
                    </span>
                    {pharm.availableInventoryCount !== undefined && (
                      <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>
                        📦 {pharm.availableInventoryCount} in stock
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)' }}>
                      ✓ {pharm.totalOrdersCompleted || 0}+ orders completed
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button variant="primary" size="sm">
                  View Medicines & Store →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyPharmacies;
