import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, FileCheck, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { getMedicineImage, showMedicineImagePlaceholder } from '../../utils/medicineImages';
import './basket.css';

const Cart = () => {
  const { cart, stockWarnings, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [pendingItem, setPendingItem] = useState(null);

  async function changeCart(key, operation) {
    setPendingItem(key);
    try {
      await operation();
    } finally {
      setPendingItem(null);
    }
  }

  if (!cart.items.length) {
    return (
      <div className="basket-page basket-empty">
        {loading ? <p role="status">Loading your cart…</p> : (
          <EmptyState icon={ShoppingBag} title="Your cart is empty"
            description="Find a medicine to get started."
            actionLabel="Find medicines" onAction={() => navigate('/medicines')} />
        )}
      </div>
    );
  }

  const savings = cart.items.reduce((sum, item) =>
    sum + Math.max(0, (item.mrp ?? item.price) - item.price) * item.quantity, 0);
  const subtotal = Number.isFinite(cart.subtotal) ? cart.subtotal :
    cart.items.reduce((sum, item) => Number.isFinite(item.price) ? sum + item.price * item.quantity : NaN, 0);

  return (
    <div className="basket-page">
      <div className="basket-page-heading">
        <h1>Your cart</h1>
        <Link to="/medicines" className="basket-link"><Plus size={16} /> Add medicines</Link>
      </div>

      {stockWarnings?.length > 0 && (
        <div className="basket-notice" role="status">
          <AlertTriangle size={20} aria-hidden="true" />
          <div><strong>Check your quantities</strong>
            <ul>{stockWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          </div>
        </div>
      )}

      <div className="basket-layout">
        <section className="basket-panel" aria-label="Medicines in your cart" aria-busy={pendingItem !== null}>
          <ul className="basket-items">
            {cart.items.map((item) => {
              const id = item.medicineId?._id || item.medicineId;
              return (
                <li key={id} className="basket-item">
                  <img src={getMedicineImage(item)} onError={showMedicineImagePlaceholder} alt="" className="basket-image" />
                  <div className="basket-item-name">
                    <h2>{item.name}</h2>
                    {item.strength && <p>{item.strength}</p>}
                    {item.requiresPrescription && <small>Prescription required</small>}
                  </div>
                  <div className="basket-quantity">
                    <button type="button" aria-label={`Decrease quantity of ${item.name}`}
                      disabled={pendingItem !== null}
                      onClick={() => changeCart(id, () => item.quantity === 1 ? removeFromCart(id) : updateQuantity(id, item.quantity - 1))}>
                      <Minus size={16} aria-hidden="true" />
                    </button>
                    <span aria-live="polite">{pendingItem === id ? '…' : item.quantity}</span>
                    <button type="button" aria-label={`Increase quantity of ${item.name}`}
                      disabled={pendingItem !== null || item.quantity >= 100}
                      onClick={() => changeCart(id, () => updateQuantity(id, item.quantity + 1))}>
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="basket-item-price">
                    <strong>{Number.isFinite(item.price) ? `₹${(item.price * item.quantity).toLocaleString('en-IN')}` : 'Price at checkout'}</strong>
                    {Number.isFinite(item.price) && item.quantity > 1 && <small>₹{item.price} each</small>}
                  </div>
                  <button type="button" className="basket-remove" aria-label={`Remove ${item.name}`}
                    disabled={pendingItem !== null} onClick={() => changeCart(id, () => removeFromCart(id))}>
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
          <button className="basket-link basket-clear" type="button" disabled={pendingItem !== null}
            onClick={() => changeCart('clear', clearCart)}>
            {pendingItem === 'clear' ? 'Clearing…' : 'Clear cart'}
          </button>
        </section>

        <aside className="basket-panel basket-summary" aria-labelledby="cart-summary">
          <h2 id="cart-summary">Order summary</h2>
          <div className="basket-price-row basket-total"><span>Medicines</span>
            <strong>{Number.isFinite(subtotal) ? `₹${subtotal.toLocaleString('en-IN')}` : 'Price at checkout'}</strong>
          </div>
          {savings > 0 && <p className="basket-saving">₹{savings.toLocaleString('en-IN')} saved on MRP</p>}
          <p className="basket-muted">Delivery and packaging fees are calculated at checkout.</p>
          {cart.hasPrescriptionRequiredItems && (
            <p className="basket-detail-note"><FileCheck size={18} /> Attach your prescription at checkout.</p>
          )}
          <Button fullWidth size="lg" disabled={pendingItem !== null} icon={ArrowRight}
            iconPosition="right" onClick={() => navigate('/checkout')}>Continue to checkout</Button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
