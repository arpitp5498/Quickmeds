import React, { useState, useEffect } from 'react';
import { ScrollText, CheckCircle2, DollarSign, Store, MapPin } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const DeliveryHistory = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ completedCount: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/delivery/history');
        if (res.success && res.data) {
          setOrders(res.data.orders || []);
          setStats(res.data.stats || {});
        }
      } catch (err) {
        console.warn('Delivery history error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Delivery Trip History</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Completed trips: <strong>{stats.completedCount}</strong> • Total Earned: <strong>₹{stats.totalEarnings}</strong>
        </p>
      </div>

      {loading ? (
        <Skeleton height="200px" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No Delivery Trips Yet"
          description="Complete medicine orders to accumulate earnings and build your trip history."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
            <Card key={order._id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '8px',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{order.orderId}</span>
                  <Badge variant="success" size="sm">Delivered ✓</Badge>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--secondary-700)' }}>
                  +₹40 Payout Earned
                </span>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <p><strong>From:</strong> {order.pharmacyId?.name} ({order.pharmacyId?.address?.city})</p>
                <p><strong>To:</strong> {order.customerId?.name} — {order.deliveryAddress?.fullAddress}</p>
                <p style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                  Completed on: {new Date(order.updatedAt).toLocaleString('en-IN')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;
