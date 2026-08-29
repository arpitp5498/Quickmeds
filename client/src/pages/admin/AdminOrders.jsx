import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Search, Store, Truck, User } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import SearchBar from '../../components/ui/SearchBar';
import Skeleton from '../../components/ui/Skeleton';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/admin/orders';
      if (statusFilter !== 'ALL') {
        url += `?status=${statusFilter}`;
      }
      const res = await api.get(url);
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.warn('Admin orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const filtered = orders.filter((o) => {
    const s = searchTerm.toLowerCase();
    return (
      o.orderId?.toLowerCase().includes(s) ||
      o.customerId?.name?.toLowerCase().includes(s) ||
      o.pharmacyId?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Live Order Monitor</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Real-time order routing, prescription fulfillment states, and delivery statuses.
        </p>
      </div>

      <Tabs
        activeTab={statusFilter}
        onChange={setStatusFilter}
        tabs={[
          { id: 'ALL', label: 'All Orders' },
          { id: 'PLACED', label: 'Placed' },
          { id: 'OUT_FOR_DELIVERY', label: 'In Transit' },
          { id: 'DELIVERED', label: 'Delivered' },
          { id: 'CANCELLED', label: 'Cancelled' }
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by Order ID, customer, or pharmacy..."
        />
      </div>

      {loading ? (
        <Skeleton height="200px" />
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <ShoppingBag size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Orders Found</h4>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Order ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Customer</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Pharmacy</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Items & Total</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{o.orderId}</td>
                    <td style={{ padding: '12px 16px' }}>{o.customerId?.name}</td>
                    <td style={{ padding: '12px 16px' }}>{o.pharmacyId?.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700 }}>₹{o.total}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        ({o.items?.length} items)
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge
                        variant={
                          o.orderStatus === 'DELIVERED'
                            ? 'success'
                            : o.orderStatus === 'CANCELLED' || o.orderStatus === 'REJECTED'
                            ? 'danger'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {o.orderStatus.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(o.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminOrders;
