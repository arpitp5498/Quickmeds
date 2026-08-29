import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Store,
  FileCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import BasketOptimizationBreakdown from '../../components/routing/BasketOptimizationBreakdown';
import { getMedicineImage } from '../../utils/medicineImages';

const Cart = () => {
  const {
    cart,
    stockWarnings,
    updateQuantity,
    removeFromCart,
    clearCart,
    pharmacyConflictModal,
    resolveConflict
  } = useCart();
  const { location } = useLocation();
  const [optimizedPlan, setOptimizedPlan] = useState(null);
  const navigate = useNavigate();

  const deliveryFee = 25;
  const platformFee = 5;
  const total = cart.subtotal + (cart.items.length > 0 ? deliveryFee + platformFee : 0);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '600px' }}>
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="You haven't added any medicines yet. Search nearby pharmacies to find what you need."
          actionLabel="Find Medicines"
          onAction={() => navigate('/medicines')}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Shopping Cart</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Ordering from: <strong>{cart.pharmacyId?.name || 'Assigned Pharmacy Partner'}</strong>
        </p>
      </div>

      {/* Stock Warnings Banner if any item has low inventory */}
      {stockWarnings && stockWarnings.length > 0 && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          <AlertTriangle size={18} color="#b45309" style={{ minWidth: '18px', marginTop: '2px' }} />
          <div>
            <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#92400e' }}>
              Stock Availability Notice
            </h5>
            <ul style={{ fontSize: '0.8125rem', color: '#b45309', paddingLeft: '1.25rem', marginTop: '4px' }}>
              {stockWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Prescription Notice Banner */}
      {cart.hasPrescriptionRequiredItems && (
        <div
          style={{
            backgroundColor: 'var(--accent-50)',
            border: '1px solid var(--accent-100)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <FileCheck size={20} color="var(--accent-600)" />
          <span style={{ fontSize: '0.8125rem', color: '#9f1239', fontWeight: 600 }}>
            Your cart contains prescription medicines (Schedule H). You will be prompted to attach a valid prescription at checkout.
          </span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'flex-start'
        }}
      >
        {/* Left: Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.items.map((item) => (
            <Card
              key={item.medicineId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '72px',
                    padding: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <img
                    src={getMedicineImage(item)}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{item.name}</h4>
                    {item.requiresPrescription && <Badge variant="prescription" size="sm">Rx</Badge>}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.strength} • ₹{item.price} each
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Quantity Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                    style={{ padding: '2px', cursor: 'pointer', display: 'flex' }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                    style={{ padding: '2px', cursor: 'pointer', display: 'flex' }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Item Total */}
                <span style={{ fontSize: '1rem', fontWeight: 800, minWidth: '60px', textAlign: 'right' }}>
                  ₹{item.price * item.quantity}
                </span>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFromCart(item.medicineId)}
                  style={{
                    color: 'var(--accent-600)',
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={clearCart}
              style={{ fontSize: '0.8125rem', color: 'var(--accent-600)', fontWeight: 500 }}
            >
              Clear Cart
            </button>
            <Link
              to="/medicines"
              style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600 }}
            >
              + Add More Medicines
            </Link>
          </div>
        </div>

        {/* Right: Smart Fulfilment Routing & Checkout CTA */}
        <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <BasketOptimizationBreakdown
            cartItems={cart.items}
            coordinates={location ? [location.lng, location.lat] : [77.2090, 28.6139]}
            onPlanOptimized={setOptimizedPlan}
            showPricingBreakdown={true}
          />

          <Card style={{ backgroundColor: 'var(--bg-card)' }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/checkout')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Proceed to Checkout (₹{optimizedPlan?.recommended?.totalOrderValue || optimizedPlan?.recommended?.totalDemoValue || total})
            </Button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: 'var(--secondary-700)',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={14} color="var(--secondary-600)" />
              <span>Verified Pharmacy Direct Dispense • Target 20–30 min delivery</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Pharmacy Conflict Modal */}
      {pharmacyConflictModal && (
        <Modal
          isOpen={true}
          onClose={() => resolveConflict(false)}
          title="Different Pharmacy Selected"
        >
          <div style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <p>{pharmacyConflictModal.message}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => resolveConflict(false)}>
                Keep Existing Cart
              </Button>
              <Button variant="danger" onClick={() => resolveConflict(true)}>
                Clear & Switch Pharmacy
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Cart;
