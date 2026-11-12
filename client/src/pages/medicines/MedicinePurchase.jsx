import React, { useRef, useState } from 'react';
import { Clock, Info, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { deliveryAvailability } from '../../utils/medicineStock';

export function useMedicineCart() {
  const { cart, getItemQuantity, addToCart, updateQuantity, removeFromCart } = useCart();
  const changing = useRef(false);
  const [pendingId, setPendingId] = useState(null);

  async function changeQuantity(medicine, delta) {
    if (changing.current) return;
    const quantity = getItemQuantity(medicine._id);
    const next = quantity + delta;
    if (delta > 0 && !deliveryAvailability(medicine, next).available) return;
    changing.current = true;
    setPendingId(medicine._id);
    try {
      if (next === 0) await removeFromCart(medicine._id);
      else if (quantity === 0) await addToCart(medicine, 1, medicine.lowestPrice);
      else await updateQuantity(medicine._id, next);
    } finally {
      changing.current = false;
      setPendingId(null);
    }
  }

  return { totalItems: cart?.totalItems || 0, getItemQuantity, changeQuantity, pendingId };
}

export function MedicinePrice({ medicine }) {
  const price = medicine.lowestPrice ?? medicine.mrp;
  return (
    <div className="med-price">
      <strong>{Number.isFinite(price) ? `₹${price}` : 'Price unavailable'}</strong>
      {Number.isFinite(price) && price < medicine.mrp && <del aria-label={`MRP ₹${medicine.mrp}`}>₹{medicine.mrp}</del>}
    </div>
  );
}

export function MedicinePurchase({ medicine, basket }) {
  const quantity = basket.getItemQuantity(medicine._id);
  const availability = deliveryAvailability(medicine, quantity || 1);
  const Icon = availability.available ? Clock : Info;
  return (
    <div className="med-purchase" aria-busy={basket.pendingId === medicine._id}>
      <p className={`med-availability ${availability.available ? 'confirmed' : ''}`}><Icon aria-hidden="true" size={15} />{availability.label}</p>
      <div className="med-price-row">
        <MedicinePrice medicine={medicine} />
        {quantity > 0 ? (
          <div className="med-stepper" role="group" aria-label={`${medicine.name} in cart`}>
            <button type="button" disabled={!!basket.pendingId} aria-label={`Decrease quantity of ${medicine.name}`} onClick={() => basket.changeQuantity(medicine, -1)}>
              {quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
            </button>
            <output aria-label="Quantity in cart">{quantity}</output>
            <button type="button" disabled={!!basket.pendingId || !deliveryAvailability(medicine, quantity + 1).available} aria-label={`Increase quantity of ${medicine.name}`} onClick={() => basket.changeQuantity(medicine, 1)}><Plus size={16} /></button>
          </div>
        ) : availability.available && (
          <button className="med-add" type="button" disabled={!!basket.pendingId} aria-label={`Add ${medicine.name} to cart`} onClick={() => basket.changeQuantity(medicine, 1)}>
            <Plus size={16} />{basket.pendingId === medicine._id ? 'Adding…' : 'Add'}
          </button>
        )}
      </div>
    </div>
  );
}

export function MedicineFacts({ medicine }) {
  const facts = [
    ['Generic name', medicine.genericName], ['Strength', medicine.strength], ['Form', medicine.dosageForm],
    ['Manufacturer', medicine.manufacturer], ['Category', medicine.category], ['Schedule', medicine.prescriptionSchedule]
  ].filter(([, value]) => value);
  return (
    <>
      {facts.length > 0 && <dl className="med-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
      {medicine.description && <p className="med-description">{medicine.description}</p>}
    </>
  );
}
