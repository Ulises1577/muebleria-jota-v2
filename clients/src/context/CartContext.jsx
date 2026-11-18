import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { COMMERCE, STORAGE_KEYS } from '../config/site';
import { getProductId } from '../utils/inventory';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const readCart = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.cart);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Tope de unidades: el stock informado por la API y el máximo por artículo del negocio. */
const maxUnitsFor = (product) => {
  const stock = Number(product?.stock);
  return Number.isFinite(stock) ? Math.min(stock, COMMERCE.maxQuantityPerItem) : COMMERCE.maxQuantityPerItem;
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
    } catch (error) {
      console.error('Error guardando carrito en localStorage:', error);
    }
  }, [items]);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  /** Devuelve cuántas unidades se agregaron realmente (puede ser menos por stock). */
  const addItem = useCallback((product, quantity = 1) => {
    const id = getProductId(product);
    const prev = itemsRef.current;
    const existing = prev.find((item) => getProductId(item) === id);
    const current = existing?.quantity || 0;
    const next = Math.min(current + quantity, maxUnitsFor(product));
    const added = Math.max(0, next - current);
    if (added === 0) return 0;
    const updated = existing
      ? prev.map((item) => (getProductId(item) === id ? { ...item, ...product, quantity: next } : item))
      : [...prev, { ...product, quantity: next }];
    itemsRef.current = updated;
    setItems(updated);
    return added;
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => getProductId(item) !== id)
        : prev.map((item) =>
            getProductId(item) === id ? { ...item, quantity: Math.min(quantity, maxUnitsFor(item)) } : item
          )
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => getProductId(item) !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    const total = items.reduce((acc, item) => acc + Number(item.precio) * item.quantity, 0);
    return {
      items,
      count,
      total,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clear,
      maxUnitsFor
    };
  }, [items, isOpen, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>.');
  return context;
};

/** Agrega al carrito y avisa cuántas unidades entraron realmente (respeta el stock). */
export const useAddToCart = () => {
  const { addItem } = useCart();
  const { notify } = useToast();
  return useCallback(
    (product, quantity = 1) => {
      const added = addItem(product, quantity);
      if (added === 0) {
        notify(`Ya tenés en el carrito todas las unidades disponibles de ${product.nombre}.`, 'info');
      } else {
        notify(`${added === 1 ? 'Se agregó' : `Se agregaron ${added} unidades de`} ${product.nombre} al carrito.`);
      }
      return added;
    },
    [addItem, notify]
  );
};
