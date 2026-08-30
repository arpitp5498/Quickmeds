import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  Clock,
  ArrowRight,
  Truck,
  Star,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let url = '/orders';
        if (statusFilter !== 'ALL') {
          url += `?status=${statusFilter}`;
        }
        const res = await api.get(url);
        if (res.success && res.data) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.warn('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  const handleReorder = async (order) => {
    // Only reorder non-rx items automatically
    const eligibleItems = order.items.filter((i) => !i.requiresPrescription);
    if (eligibleItems.length === 0) {
      showToast(
        'This order contains prescription medications. Please search and upload a fresh prescription to reorder.',
        'warning'
      );
      navigate(`/pharmacies/${order.pharmacyId?._id || order.pharmacyId}`);
      return;
    }

    let addedCount = 0;
    for (const item of eligibleItems) {
      const success = await addToCart(
        order.pharmacyId?._id || order.pharmacyId,
        item.medicineId,
        item.quantity
      );
      if (success) addedCount++;
    }

    if (addedCount > 0) {
      showToast('Eligible items added to cart!', 'success');
      navigate('/cart');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Orders</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Track active deliveries and review your medicine order history.
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs
        activeTab={statusFilter}
        onChange={setStatusFilter}
        tabs={[
          { id: 'ALL', label: 'All Orders' },
          { id: 'OUT_FOR_DELIVERY', label: 'In Transit' },
          { id: 'DELIVERED', label: 'Delivered' },
          { id: 'CANCELLED', label: 'Cancelled' }
        ]}
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="90px" />
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Found"
          description="You don't have any orders in this category."
          actionLabel="Find Medicines"
          onAction={() => navigate('/medicines')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => {
            const isActive = !['DELIVERED', 'REJECTED', 'CANCELLED', 'FULFILMENT_UNAVAILABLE'].includes(order.orderStatus);

            return (
              <Card
                key={order._id}
                style={{
                  borderLeft: `4px solid ${
                    order.orderStatus === 'DELIVERED'
                      ? 'var(--secondary-600)'
                      : isActive
                      ? 'var(--primary-600)'
                      : 'var(--border-medium)'
                  }`
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--border-light)',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{order.orderId}</span>
                    <Badge
                      variant={
                        order.orderStatus === 'DELIVERED'
                          ? 'success'
                          : order.orderStatus === 'CANCELLED' || order.orderStatus === 'REJECTED' || order.orderStatus === 'FULFILMENT_UNAVAILABLE'
                          ? 'danger'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {order.orderStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Store size={15} color="var(--primary-600)" />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                        {order.pharmacyId?.name}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {order.items?.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: 800, marginTop: '6px' }}>
                      Total: ₹{order.total} • <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{order.paymentMethod}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {isActive && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Truck}
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        Track Live GPS
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      View Invoice
                    </Button>

                    {order.orderStatus === 'DELIVERED' && !order.isReviewed && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Star}
                        onClick={() => navigate(`/reviews/write?orderId=${order._id}`)}
                      >
                        Rate Store
                      </Button>
                    )}

                    {order.orderStatus === 'DELIVERED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={RotateCcw}
                        onClick={() => handleReorder(order)}
                      >
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderList;
