import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Store, Truck, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StarRating from '../../components/ui/StarRating';

const WriteReview = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [pharmacyRating, setPharmacyRating] = useState(5);
  const [pharmacyComment, setPharmacyComment] = useState('');
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [deliveryComment, setDeliveryComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      navigate('/orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.success && res.data) {
          setOrder(res.data.order);
        }
      } catch (err) {
        showToast('Could not find order', 'error');
        navigate('/orders');
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/reviews', {
        orderId,
        rating: pharmacyRating,
        comment: pharmacyComment,
        deliveryRating,
        deliveryComment
      });

      showToast('Thank you! Your review has been published.', 'success');
      navigate('/orders');
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '650px' }}>
      <button
        type="button"
        onClick={() => navigate('/orders')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Rate Your Experience</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Order {order?.orderId} from <strong>{order?.pharmacyId?.name}</strong>
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          {/* Pharmacy Rating */}
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Store size={20} color="var(--primary-600)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Pharmacy & Medicine Quality</h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              How satisfied were you with the packaging, medicine condition, and pharmacist handling?
            </p>

            <div style={{ marginBottom: '12px' }}>
              <StarRating
                rating={pharmacyRating}
                interactive={true}
                size={24}
                onChange={setPharmacyRating}
              />
            </div>

            <Input
              label="Review / Feedback (Optional)"
              as="textarea"
              rows={3}
              value={pharmacyComment}
              onChange={(e) => setPharmacyComment(e.target.value)}
              placeholder="e.g. Authentic medicines with intact seals. Fast preparation."
            />
          </div>

          {/* Delivery Rating */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Truck size={20} color="var(--secondary-600)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Delivery Rider Speed & Service</h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              How was the delivery promptness and rider communication?
            </p>

            <div style={{ marginBottom: '12px' }}>
              <StarRating
                rating={deliveryRating}
                interactive={true}
                size={24}
                onChange={setDeliveryRating}
              />
            </div>

            <Input
              label="Delivery Comments (Optional)"
              value={deliveryComment}
              onChange={(e) => setDeliveryComment(e.target.value)}
              placeholder="e.g. Polite executive, arrived in 15 minutes."
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting} icon={CheckCircle2}>
            Submit Review
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default WriteReview;
