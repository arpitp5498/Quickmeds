import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  FileText,
  Boxes,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pharmacy, setPharmacy] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    activeOrdersCount: 0,
    totalRevenue: 0,
    inventoryCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [profileRes, ordersRes, inventoryRes, rxRes] = await Promise.all([
        api.get('/pharmacies/profile/me'),
        api.get('/orders/pharmacy/list?status=ACTIVE'),
        api.get('/inventory?lowStockOnly=true'),
        api.get('/prescriptions/pharmacy/queue')
      ]);

      if (profileRes.success && profileRes.data) {
        setPharmacy(profileRes.data.pharmacy);
      }

      if (ordersRes.success && ordersRes.data) {
        const orders = ordersRes.data.orders || [];
        setActiveOrders(orders);
        const revenue = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
        setStats((prev) => ({
          ...prev,
          activeOrdersCount: orders.length,
          totalRevenue: revenue
        }));
      }

      if (inventoryRes.success && inventoryRes.data) {
        setLowStockItems(inventoryRes.data.inventory || []);
      }

      if (rxRes.success && rxRes.data) {
        const queue = rxRes.data.prescriptions || [];
        setPendingPrescriptions(queue.filter((p) => p.status === 'UNDER_REVIEW' || p.status === 'UPLOADED'));
      }
    } catch (err) {
      console.warn('Pharmacy dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    if (socket) {
      const handleNewOrder = (data) => {
        showToast(`🔔 New Order #${data.orderNumber} Received for ₹${data.total}!`, 'success');
        fetchDashboard();
      };

      socket.on('new_order_received', handleNewOrder);
      return () => {
        socket.off('new_order_received', handleNewOrder);
      };
    }
  }, [socket]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Profile & Status */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {pharmacy?.name || 'Pharmacy Partner Portal'}
            </h1>
            <Badge variant="verified">
              <ShieldCheck size={13} /> {pharmacy?.verificationStatus || 'VERIFIED'}
            </Badge>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Drug License: <strong>{pharmacy?.licenseNumber}</strong> • Operating: {pharmacy?.operatingHours?.open} - {pharmacy?.operatingHours?.close}
          </p>
        </div>

        <Button variant="primary" icon={ShoppingBag} onClick={() => navigate('/pharmacy/orders')}>
          Manage Live Orders
        </Button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <StatCard
          title="Active Incoming Orders"
          value={activeOrders.length}
          icon={ShoppingBag}
          color="var(--primary-600)"
          bg="var(--primary-50)"
        />

        <StatCard
          title="Pending Rx Reviews"
          value={pendingPrescriptions.length}
          icon={FileText}
          color="var(--accent-600)"
          bg="var(--accent-50)"
        />

        <StatCard
          title="Low Stock Alerts"
          value={lowStockItems.length}
          icon={AlertTriangle}
          color="#b45309"
          bg="#fef3c7"
        />

        <StatCard
          title="Total Completed Orders"
          value={pharmacy?.totalOrdersCompleted || 0}
          icon={CheckCircle2}
          color="var(--secondary-600)"
          bg="var(--secondary-50)"
        />
      </div>

      {/* Main Split: Live Order Queue & Prescription Review Queue */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Live Incoming Orders Card */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Incoming Active Orders</h3>
            <Link
              to="/pharmacy/orders"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-600)' }}
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <Skeleton height="100px" />
          ) : activeOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.875rem' }}>No active incoming orders.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/pharmacy/orders/${order._id}`)}
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
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{order.orderId}</span>
                      <Badge variant="primary" size="sm">
                        {order.orderStatus.replace(/_/g, ' ')}
                      </Badge>
                      {order.prescriptionId && (
                        <Badge variant="prescription" size="sm">Rx Attached</Badge>
                      )}
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Customer: {order.customerId?.name} ({order.customerId?.phone}) • ₹{order.total}
                    </p>
                  </div>

                  <span style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                    Process →
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Prescription Verification Queue Card */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Prescription Review Queue</h3>
            <Link
              to="/pharmacy/prescriptions"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-600)' }}
            >
              Review All →
            </Link>
          </div>

          {loading ? (
            <Skeleton height="100px" />
          ) : pendingPrescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.875rem' }}>All prescription uploads have been verified.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingPrescriptions.map((rx) => (
                <div
                  key={rx._id}
                  onClick={() => navigate('/pharmacy/prescriptions')}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-50)',
                    border: '1px solid var(--accent-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="var(--accent-600)" />
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                        {rx.originalName}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Patient: {rx.patientName || rx.customerId?.name}
                      </span>
                    </div>
                  </div>

                  <Button variant="danger" size="sm">
                    Verify Rx
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
