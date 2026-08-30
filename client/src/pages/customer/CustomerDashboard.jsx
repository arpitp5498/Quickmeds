import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Store,
  FileText,
  ShoppingBag,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmergencyEssentialsSection from '../../components/emergency/EmergencyEssentialsSection';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { location } = useLocation();
  const navigate = useNavigate();

  const [activeOrder, setActiveOrder] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersRes, pharmaciesRes] = await Promise.all([
          api.get('/orders?limit=5'),
          api.get(`/pharmacies/nearby?lat=${location.lat}&lng=${location.lng}&limit=4`)
        ]);

        if (ordersRes.success && ordersRes.data) {
          const orders = ordersRes.data.orders || [];
          setRecentOrders(orders);
          // Find any non-delivered active order
          const active = orders.find(
            (o) => !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.orderStatus)
          );
          setActiveOrder(active || null);
        }

        if (pharmaciesRes.success && pharmaciesRes.data) {
          setNearbyPharmacies(pharmaciesRes.data.pharmacies?.slice(0, 3) || []);
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location.lat, location.lng]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header Greeting & Location */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              marginTop: '4px'
            }}
          >
            <MapPin size={16} color="var(--primary-600)" />
            <span>Delivering to: <strong>{location.address}</strong></span>
          </div>
        </div>

        <Button
          variant="primary"
          icon={Search}
          onClick={() => navigate('/medicines')}
        >
          Find Urgent Medicine
        </Button>
      </div>

      {/* 2. Active Order Tracker Alert (If Any Active Order) */}
      {activeOrder && (
        <div
          style={{
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-300)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
          className="animate-fade-in"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Truck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                  ACTIVE ORDER: {activeOrder.orderId}
                </span>
                <Badge variant="primary" size="sm">
                  {activeOrder.orderStatus.replace(/_/g, ' ')}
                </Badge>
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '2px' }}>
                {activeOrder.orderStatus === 'OUT_FOR_DELIVERY'
                  ? '🛵 Rider on the way to your doorstep!'
                  : activeOrder.orderStatus === 'PREPARING'
                  ? '💊 Pharmacist is packaging your medicines'
                  : '🔍 Pharmacy verifying prescription & availability'}
              </h4>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                From {activeOrder.pharmacyId?.name} • ₹{activeOrder.total}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate(`/orders/${activeOrder._id}`)}
            icon={ArrowRight}
            iconPosition="right"
          >
            Track Live GPS
          </Button>
        </div>
      )}

      {/* 3. Quick Action Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}
      >
        <Card
          hoverable
          onClick={() => navigate('/medicines')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Search size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Search Medicine</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Check live stock</span>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/pharmacies')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--secondary-50)',
              color: 'var(--secondary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Store size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Nearby Chemists</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Within your area</span>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/prescriptions/upload')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-50)',
              color: 'var(--accent-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Upload Rx</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pharmacist check</span>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/orders')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShoppingBag size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>My Orders</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>History & reorder</span>
          </div>
        </Card>
      </div>

      {/* 4. SOS — Emergency Essentials Section */}
      <EmergencyEssentialsSection
        initialLimit={8}
        showViewAll={true}
        title="SOS — Emergency Essentials"
        subtitle="Quick one-tap access to frequently needed emergency medicines & first-aid essentials"
      />

      {/* 5. Two-Column Content: Recent Orders & Nearby Verified Pharmacies */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Recent Orders */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Orders</h3>
            <Link
              to="/orders"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-600)' }}
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height="60px" />
              <Skeleton height="60px" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.875rem' }}>No orders placed yet.</p>
              <Button
                variant="outline"
                size="sm"
                style={{ marginTop: '10px' }}
                onClick={() => navigate('/medicines')}
              >
                Search Medicines
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                        {order.orderId}
                      </span>
                      <Badge
                        variant={order.orderStatus === 'DELIVERED' ? 'success' : 'primary'}
                        size="sm"
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {order.items?.length} items • ₹{order.total} • {order.pharmacyId?.name}
                    </span>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Nearby Pharmacies */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Nearby Verified Pharmacies</h3>
            <Link
              to="/pharmacies"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-600)' }}
            >
              See All →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height="60px" />
              <Skeleton height="60px" />
            </div>
          ) : nearbyPharmacies.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
              No pharmacies detected within 10km.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {nearbyPharmacies.map((pharmacy) => (
                <div
                  key={pharmacy._id}
                  onClick={() => navigate(`/pharmacies/${pharmacy._id}`)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Store size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>{pharmacy.name}</h4>
                        <ShieldCheck size={14} color="var(--secondary-600)" />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {pharmacy.distanceKm} km away • {pharmacy.etaText}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-600)' }}>
                    Visit Store →
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
