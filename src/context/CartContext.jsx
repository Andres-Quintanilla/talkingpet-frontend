// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../utils/format';
import { useAuth } from './AuthContext';

const CartCtx = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  // Clave de storage por usuario (si no hay usuario, carrito anónimo)
  const storageKey = user?.id ? `tp_cart_user_${user.id}` : 'tp_cart_anon';

  const [items, setItems] = useState([]);

  // Cargar carrito desde localStorage cuando cambia el usuario / storageKey
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          setItems(parsed);
          return;
        }
      }

      // Si no hay nada guardado o está mal, dejamos carrito vacío
      setItems([]);
    } catch (err) {
      console.error('Error leyendo carrito de localStorage:', err);
      setItems([]);
    }
  }, [storageKey]);

  // Guardar carrito cuando cambian los items
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.error('Error guardando carrito en localStorage:', err);
    }
  }, [items, storageKey]);

  // === Mantengo tu misma API ===

  // p: producto completo que ya usas en el proyecto (id, nombre, precio, imagen_url, etc.)
  // src/context/CartContext.jsx
  const add = (p, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === p.id);

      // stock conocido (del producto nuevo o del que ya está en el carrito)
      const stock =
        typeof p.stock === 'number'
          ? p.stock
          : typeof existing?.stock === 'number'
            ? existing.stock
            : null; // null = sin límite (servicios, cursos, etc.)

      if (existing) {
        const others = prev.filter((x) => x.id !== p.id);
        let newQty = existing.qty + qty;

        if (stock !== null) {
          newQty = Math.min(newQty, stock);
        }

        return [...others, { ...existing, ...p, qty: newQty }];
      }

      // No existía en el carrito
      let initialQty = qty;
      if (stock !== null) {
        initialQty = Math.min(qty, stock);
      }

      return [...prev, { ...p, qty: initialQty }];
    });
  };


  const remove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clear = () => setItems([]);

  const setQty = (id, qty) => {
    if (qty <= 0) return remove(id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  };

  const totals = useMemo(() => {
    const total = items.reduce((s, i) => s + (i.precio || 0) * (i.qty || 1), 0);
    // count = número de líneas, igual que antes
    return {
      total,
      totalLabel: formatCurrency(total),
      count: items.length,
    };
  }, [items]);

  return (
    <CartCtx.Provider value={{ items, add, remove, clear, setQty, totals }}>
      {children}
    </CartCtx.Provider>
  );
};

export const useCart = () => useContext(CartCtx);
