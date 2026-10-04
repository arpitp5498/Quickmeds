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
  Plus,
  Stethoscope,
  TestTubes,
  ClipboardList,
  Calendar,
  Video,
  CheckCircle2,
  AlertCircle
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
  const [upcomingConsultations, setUpcomingConsultations] = useState([]);
  const [upcomingLabBookings, setUpcomingLabBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersRes, pharmaciesRes, consultRes, labRes] = await Promise.allSettled([
          api.get('/orders?limit=5'),
          api.get(`/pharmacies/nearby?lat=${location.lat}&lng=${location.lng}&limit=4`),
          api.get('/consultations/my?limit=5'),
          api.get('/lab-tests/bookings/my?limit=5')
        ]);

        if (ordersRes.status === 'fulfilled' && ordersRes.value?.success && ordersRes.value?.data) {
          const orders = ordersRes.value.data.orders || [];
          setRecentOrders(orders);
          // Find any non-delivered active order
          const active = orders.find(
            (o) => !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.orderStatus)
          );
          setActiveOrder(active || null);
        }

        if (pharmaciesRes.status === 'fulfilled' && pharmaciesRes.value?.success && pharmaciesRes.value?.data) {
          setNearbyPharmacies(pharmaciesRes.value.data.pharmacies?.slice(0, 3) || []);
        }

        if (consultRes.status === 'fulfilled' && consultRes.value?.data) {
          const consults = consultRes.value.data.consultations || (Array.isArray(consultRes.value.data) ? consultRes.value.data : []);
          const activeConsults = consults.filter(c => ['REQUESTED', 'CONFIRMED', 'IN_PROGRESS'].includes(c.status));
          setUpcomingConsultations(activeConsults.slice(0, 2));
        }

        if (labRes.status === 'fulfilled' && labRes.value?.data) {
          const bookings = labRes.value.data.bookings || (Array.isArray(labRes.value.data) ? labRes.value.data : []);
          const activeBookings = bookings.filter(b => ['BOOKED', 'SAMPLE_COLLECTED', 'PROCESSING'].includes(b.status));
          setUpcomingLabBookings(activeBookings.slice(0, 2));
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

      {/* 3. Clinical & Pharmacy Quick Access Grid */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
          Healthcare Services & Essentials
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem'
          }}
        >
          <Card
            hoverable
            className="card-healthcare"
            onClick={() => navigate('/doctors')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', padding: '1.25rem' }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Stethoscope size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Consult Doctor</h4>
                <span className="badge-available-now" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  <span className="pulse-dot-green" /> Live
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified doctors & video slot</span>
            </div>
          </Card>

          <Card
            hoverable
            className="card-healthcare"
            onClick={() => navigate('/lab-tests')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', padding: '1.25rem' }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <TestTubes size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Lab Tests</h4>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 700 }}>
                  Home Sample
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Certified diagnostic checkups</span>
            </div>
          </Card>

          <Card
            hoverable
            className="card-healthcare"
            onClick={() => navigate('/health-records')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', padding: '1.25rem' }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ClipboardList size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Health Records</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rx, test reports & history</span>
            </div>
          </Card>

          <Card
            hoverable
            className="card-healthcare"
            onClick={() => navigate('/medicines')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', padding: '1.25rem' }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Search size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Order Medicines</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Search catalog with live stock</span>
            </div>
          </Card>

          <Card
            hoverable
            className="card-healthcare"
            onClick={() => navigate('/prescriptions/upload')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', padding: '1.25rem' }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--accent-50)',
                color: 'var(--accent-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Upload Rx</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pharmacist verification</span>
            </div>
          </Card>

          <Card
            hoverable
            className="card-healthcare"
            onClick={() => navigate('/pharmacies')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', padding: '1.25rem' }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--secondary-50)',
                color: 'var(--secondary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Store size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Nearby Chemists</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Licensed stores in 10km</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Upcoming Healthcare Appointments (Doctor Consultations & Lab Tests) */}
      {(upcomingConsultations.length > 0 || upcomingLabBookings.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary-600)" />
              Upcoming Healthcare Appointments
            </h3>
            <Link to="/health-records" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-600)' }}>
              All Records →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {upcomingConsultations.map((c) => (
              <Card key={c._id} className="card-healthcare" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-600)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Dr. {c.doctorId?.name || 'Doctor Consultation'}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.doctorId?.specialty || 'General Care'} • {c.type === 'SCHEDULED' ? 'Scheduled Video' : 'Instant Video'}</span>
                    </div>
                  </div>
                  <Badge variant={c.status === 'CONFIRMED' ? 'success' : 'primary'} size="sm">
                    {c.status}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span>{new Date(c.scheduledTime || c.createdAt).toLocaleString()}</span>
                </div>
                {c.symptoms && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '6px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Symptoms: {c.symptoms}
                  </p>
                )}
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="sm" onClick={() => navigate('/doctors')}>
                    View Consultation Details
                  </Button>
                </div>
              </Card>
            ))}

            {upcomingLabBookings.map((b) => (
              <Card key={b._id} className="card-healthcare" style={{ padding: '1.25rem', borderLeft: '4px solid #059669' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TestTubes size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>{(b.tests || []).map(t => t.name).join(', ') || 'Diagnostic Test'}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Home Sample Collection</span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    {b.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>{new Date(b.scheduledDate).toLocaleDateString()} ({b.scheduledSlot})</span>
                </div>
                {b.collectionOTP && b.status === 'BOOKED' && (
                  <div style={{ fontSize: '0.75rem', color: '#065f46', backgroundColor: '#d1fae5', padding: '4px 8px', borderRadius: '4px', marginTop: '6px', display: 'inline-block' }}>
                    Phlebotomist OTP: <strong>{b.collectionOTP}</strong>
                  </div>
                )}
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="sm" onClick={() => navigate('/lab-tests')}>
                    View Booking Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

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
