import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    subtotal: 0,
    pharmacyId: null,
    hasPrescriptionRequiredItems: false
  });
  const [stockWarnings, setStockWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pharmacyConflictModal, setPharmacyConflictModal] = useState(null);

  const { isAuthenticated, isCustomer } = useAuth();
  const { showToast } = useToast();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setCart({ items: [], totalItems: 0, subtotal: 0, pharmacyId: null });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success && res.data) {
        setCart(res.data.cart);
        setStockWarnings(res.data.stockWarnings || []);
      }
    } catch (error) {
      console.warn('Could not fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (pharmacyIdOrMedicineId, medicineIdOrQty, quantity = 1, clearExisting = false) => {
    if (!isAuthenticated) {
      showToast('Please log in as a customer to add medicines to your cart.', 'warning');
      return false;
    }

    let pharmacyId = null;
    let medicineId = null;
    let qty = 1;

    // Handle both addToCart(medicineId, quantity) and addToCart(pharmacyId, medicineId, quantity)
    if (typeof medicineIdOrQty === 'string') {
      pharmacyId = pharmacyIdOrMedicineId;
      medicineId = medicineIdOrQty;
      qty = quantity;
    } else {
      medicineId = pharmacyIdOrMedicineId;
      qty = typeof medicineIdOrQty === 'number' ? medicineIdOrQty : 1;
    }

    try {
      const payload = {
        medicineId,
        quantity: qty,
        clearExisting
      };
      if (pharmacyId) payload.pharmacyId = pharmacyId;

      const res = await api.post('/cart/items', payload);

      if (res.success && res.data) {
        setCart(res.data.cart);
        showToast('Added to cart!', 'success');
        setPharmacyConflictModal(null);
        return true;
      }
    } catch (error) {
      if (error.requiresClearConfirmation) {
        // Trigger conflict modal
        setPharmacyConflictModal({
          pharmacyId,
          medicineId,
          quantity,
          message: error.message
        });
        return false;
      }
      showToast(error.message || 'Failed to add item to cart', 'error');
      return false;
    }
  };

  const updateQuantity = async (medicineId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${medicineId}`, { quantity });
      if (res.success && res.data) {
        setCart(res.data.cart);
      }
    } catch (error) {
      showToast(error.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (medicineId) => {
    try {
      const res = await api.delete(`/cart/items/${medicineId}`);
      if (res.success && res.data) {
        setCart(res.data.cart);
        showToast('Item removed from cart', 'info');
      }
    } catch (error) {
      showToast(error.message || 'Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.success && res.data) {
        setCart(res.data.cart);
      }
    } catch (error) {
      showToast(error.message || 'Failed to clear cart', 'error');
    }
  };

  const resolveConflict = async (proceed) => {
    if (!pharmacyConflictModal) return;
    if (proceed) {
      const { pharmacyId, medicineId, quantity } = pharmacyConflictModal;
      await addToCart(pharmacyId, medicineId, quantity, true);
    } else {
      setPharmacyConflictModal(null);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        stockWarnings,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
        pharmacyConflictModal,
        resolveConflict
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
