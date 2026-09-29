import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();
const CART_STORAGE_KEY = 'quickmeds_cart';

const getInitialCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) return parsed;
    }
  } catch (e) {
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch (_) {}
  }
  return {
    items: [],
    totalItems: 0,
    subtotal: 0,
    pharmacyId: null,
    hasPrescriptionRequiredItems: false
  };
};

const saveCartToStorage = (cartData) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (e) {
    console.warn('Failed to save cart to localStorage', e);
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(getInitialCart);
  const [stockWarnings, setStockWarnings] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, isCustomer } = useAuth();
  const { showToast } = useToast();
  const syncAttemptedRef = useRef(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success && res.data) {
        setCart(res.data.cart);
        saveCartToStorage(res.data.cart);
        setStockWarnings(res.data.stockWarnings || []);
      }
    } catch (error) {
      console.warn('Could not fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  // Sync guest cart to backend upon login
  useEffect(() => {
    if (isAuthenticated && isCustomer && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      const initialLocal = getInitialCart();
      if (initialLocal.items && initialLocal.items.length > 0) {
        (async () => {
          try {
            for (const item of initialLocal.items) {
              const medId = typeof item.medicineId === 'object' ? item.medicineId?._id : item.medicineId;
              if (medId) {
                await api.post('/cart/items', {
                  medicineId: medId,
                  quantity: item.quantity || 1,
                  price: item.price
                });
              }
            }
          } catch (_) {
            // Non-blocking sync
          } finally {
            fetchCart();
          }
        })();
        return;
      }
    }
    if (!isAuthenticated) {
      syncAttemptedRef.current = false;
    }
    fetchCart();
  }, [isAuthenticated, isCustomer, fetchCart]);

  const getItemQuantity = useCallback((medicineId) => {
    if (!cart?.items || !medicineId) return 0;
    const targetId = medicineId.toString();
    const item = cart.items.find((i) => {
      const iId = typeof i.medicineId === 'object' ? i.medicineId?._id : i.medicineId;
      return (iId && iId.toString() === targetId) || (i._id && i._id.toString() === targetId);
    });
    return item ? item.quantity : 0;
  }, [cart]);

  const addToCart = async (medicineOrId, maybeQtyOrPrice = 1, unitPrice = null) => {
    let medicineId = null;
    let qty = 1;
    let price = null;
    let medMeta = {};

    if (typeof medicineOrId === 'object' && medicineOrId !== null) {
      medicineId = medicineOrId._id || medicineOrId.id;
      qty = typeof maybeQtyOrPrice === 'number' ? maybeQtyOrPrice : 1;
      price = typeof unitPrice === 'number' ? unitPrice : (medicineOrId.lowestPrice || medicineOrId.price || medicineOrId.mrp);
      medMeta = {
        name: medicineOrId.name,
        strength: medicineOrId.strength || '',
        dosageForm: medicineOrId.dosageForm || 'Tablet',
        image: medicineOrId.image || '',
        mrp: medicineOrId.mrp || price,
        requiresPrescription: !!medicineOrId.requiresPrescription
      };
    } else if (typeof maybeQtyOrPrice === 'string') {
      // legacy addToCart(pharmacyId, medicineId, quantity)
      medicineId = maybeQtyOrPrice;
      qty = typeof unitPrice === 'number' ? unitPrice : 1;
    } else {
      // addToCart(medicineId, quantity, unitPrice)
      medicineId = medicineOrId;
      qty = typeof maybeQtyOrPrice === 'number' ? maybeQtyOrPrice : 1;
      price = typeof unitPrice === 'number' ? unitPrice : null;
    }

    if (!medicineId) {
      showToast('Invalid medicine selected', 'error');
      return false;
    }

    if (isAuthenticated && isCustomer) {
      try {
        const payload = {
          medicineId,
          quantity: qty
        };
        if (price && price > 0) {
          payload.price = price;
        }

        const res = await api.post('/cart/items', payload);

        if (res.success && res.data) {
          setCart(res.data.cart);
          saveCartToStorage(res.data.cart);
          if (medMeta.requiresPrescription || res.data.cart.hasPrescriptionRequiredItems) {
            showToast('Added to cart! Doctor prescription will be required at checkout.', 'info');
          } else {
            showToast('Added to cart!', 'success');
          }
          return true;
        }
      } catch (error) {
        showToast(error.message || 'Failed to add item to cart', 'error');
        return false;
      }
    } else {
      // Guest cart support in localStorage
      const currentItems = [...(cart.items || [])];
      const targetId = medicineId.toString();
      const existingIdx = currentItems.findIndex((item) => {
        const itemMedId = typeof item.medicineId === 'object' ? item.medicineId?._id : item.medicineId;
        return (itemMedId && itemMedId.toString() === targetId) || (item._id && item._id.toString() === targetId);
      });

      const finalPrice = typeof price === 'number' && price > 0 ? price : (medMeta.mrp || 0);

      if (existingIdx > -1) {
        currentItems[existingIdx] = {
          ...currentItems[existingIdx],
          quantity: currentItems[existingIdx].quantity + qty
        };
      } else {
        currentItems.push({
          medicineId,
          name: medMeta.name || 'Medicine',
          strength: medMeta.strength || '',
          dosageForm: medMeta.dosageForm || 'Tablet',
          image: medMeta.image || '',
          price: finalPrice,
          mrp: medMeta.mrp || finalPrice,
          quantity: qty,
          requiresPrescription: !!medMeta.requiresPrescription
        });
      }

      const totalItems = currentItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const hasPrescriptionRequiredItems = currentItems.some((item) => item.requiresPrescription);

      const updatedCart = {
        ...cart,
        items: currentItems,
        totalItems,
        subtotal,
        hasPrescriptionRequiredItems
      };

      setCart(updatedCart);
      saveCartToStorage(updatedCart);

      if (medMeta.requiresPrescription) {
        showToast('Added to cart! Doctor prescription will be required at checkout.', 'info');
      } else {
        showToast('Added to cart!', 'success');
      }
      return true;
    }
  };

  const updateQuantity = async (medicineId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (!medicineId) return false;

    if (qty <= 0) {
      return removeFromCart(medicineId);
    }

    const targetId = (typeof medicineId === 'object' ? medicineId?._id : medicineId).toString();

    if (isAuthenticated && isCustomer) {
      try {
        const res = await api.put(`/cart/items/${targetId}`, { quantity: qty });
        if (res.success && res.data) {
          setCart(res.data.cart);
          saveCartToStorage(res.data.cart);
          return true;
        }
      } catch (error) {
        showToast(error.message || 'Failed to update quantity', 'error');
        return false;
      }
    } else {
      // Guest update
      const currentItems = [...(cart.items || [])];
      const idx = currentItems.findIndex((item) => {
        const itemMedId = typeof item.medicineId === 'object' ? item.medicineId?._id : item.medicineId;
        return (itemMedId && itemMedId.toString() === targetId) || (item._id && item._id.toString() === targetId);
      });

      if (idx > -1) {
        currentItems[idx] = { ...currentItems[idx], quantity: qty };
        const totalItems = currentItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const hasPrescriptionRequiredItems = currentItems.some((item) => item.requiresPrescription);

        const updatedCart = {
          ...cart,
          items: currentItems,
          totalItems,
          subtotal,
          hasPrescriptionRequiredItems
        };

        setCart(updatedCart);
        saveCartToStorage(updatedCart);
        return true;
      }
    }
    return false;
  };

  const removeFromCart = async (medicineId) => {
    if (!medicineId) return false;
    const targetId = (typeof medicineId === 'object' ? medicineId?._id : medicineId).toString();

    if (isAuthenticated && isCustomer) {
      try {
        const res = await api.delete(`/cart/items/${targetId}`);
        if (res.success && res.data) {
          setCart(res.data.cart);
          saveCartToStorage(res.data.cart);
          showToast('Item removed from cart', 'info');
          return true;
        }
      } catch (error) {
        showToast(error.message || 'Failed to remove item', 'error');
        return false;
      }
    } else {
      // Guest removal
      const currentItems = (cart.items || []).filter((item) => {
        const itemMedId = typeof item.medicineId === 'object' ? item.medicineId?._id : item.medicineId;
        return (itemMedId && itemMedId.toString() === targetId) ? false : (item._id && item._id.toString() === targetId ? false : true);
      });

      const totalItems = currentItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const hasPrescriptionRequiredItems = currentItems.some((item) => item.requiresPrescription);

      const updatedCart = {
        ...cart,
        items: currentItems,
        totalItems,
        subtotal,
        hasPrescriptionRequiredItems
      };

      setCart(updatedCart);
      saveCartToStorage(updatedCart);
      showToast('Item removed from cart', 'info');
      return true;
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && isCustomer) {
      try {
        const res = await api.delete('/cart');
        if (res.success && res.data) {
          setCart(res.data.cart);
          saveCartToStorage(res.data.cart);
        }
      } catch (error) {
        showToast(error.message || 'Failed to clear cart', 'error');
      }
    } else {
      const empty = {
        items: [],
        totalItems: 0,
        subtotal: 0,
        pharmacyId: null,
        hasPrescriptionRequiredItems: false
      };
      setCart(empty);
      saveCartToStorage(empty);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        stockWarnings,
        loading,
        getItemQuantity,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
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
