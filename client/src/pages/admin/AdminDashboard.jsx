import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  Activity,
  Zap
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import RoutingMonitor from '../../components/admin/RoutingMonitor';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingPharmacies, setPendingPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const [statsRes, ordersRes, pharmRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/orders?limit=5'),
          api.get('/admin/pharmacies?status=PENDING')
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data.metrics);
        }
        if (ordersRes.success && ordersRes.data) {
          setRecentOrders(ordersRes.data.orders || []);
        }
        if (pharmRes.success && pharmRes.data) {
          setPendingPharmacies(pharmRes.data.pharmacies || []);
        }
      } catch (err) {
        console.warn('Admin stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Administration</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            System health, compliance auditing, pharmacy licenses, and platform GMV.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={TrendingUp} onClick={() => navigate('/admin/analytics')}>
            Detailed Analytics
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <StatCard
          title="Total Gross Revenue (GMV)"
          value={`₹${stats?.totalGMV?.toLocaleString('en-IN') || '0'}`}
          icon={TrendingUp}
          color="var(--primary-600)"
          bg="var(--primary-50)"
        />

        <StatCard
          title="Total Orders Processed"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          color="var(--secondary-600)"
          bg="var(--secondary-50)"
        />

        <StatCard
          title="Verified Pharmacies"
          value={stats?.verifiedPharmaciesCount || 0}
          icon={Store}
          color="#f59e0b"
          bg="#fef3c7"
        />

        <StatCard
          title="Registered Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="#6366f1"
          bg="#e0e7ff"
        />
      </div>

      {/* Smart Fulfilment Routing Monitor Visualizer */}
      <RoutingMonitor />

      {/* Two Column Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Pending Pharmacy Licenses Card */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Pending Pharmacy License Approvals ({pendingPharmacies.length})
            </h3>
            <Link
              to="/admin/pharmacies"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-600)' }}
            >
              Manage →
            </Link>
          </div>

          {loading ? (
            <Skeleton height="100px" />
          ) : pendingPharmacies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <ShieldCheck size={32} color="var(--secondary-600)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.875rem' }}>All pharmacy licenses are reviewed & verified.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingPharmacies.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/admin/pharmacies/${p._id}`)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>{p.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      License: {p.licenseNumber} • {p.address?.city}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Audit License
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* System Recent Orders */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Live Platform Orders</h3>
            <Link
              to="/admin/orders"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-600)' }}
            >
              Monitor All →
            </Link>
          </div>

          {loading ? (
            <Skeleton height="100px" />
          ) : recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.875rem' }}>No orders in system.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentOrders.map((o) => (
                <div
                  key={o._id}
                  onClick={() => navigate('/admin/orders')}
                  style={{
                    padding: '10px 12px',
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
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{o.orderId}</span>
                      <Badge variant="primary" size="sm">{o.orderStatus.replace(/_/g, ' ')}</Badge>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {o.pharmacyId?.name} ➔ {o.customerId?.name} (₹{o.total})
                    </span>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
