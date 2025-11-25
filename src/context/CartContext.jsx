import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../utils/format';
import { useAuth } from './AuthContext';

const CartCtx = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const storageKey = user?.id ? `tp_cart_user_${user.id}` : 'tp_cart_anon';

  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error leyendo carrito de localStorage:', err);
      setItems([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.error('Error guardando carrito en localStorage:', err);
    }
  }, [items, storageKey]);

  const add = (p, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === p.id);

      const stock =
        typeof p.stock === 'number'
          ? p.stock
          : typeof existing?.stock === 'number'
            ? existing.stock
            : null; 

      if (stock !== null && stock <= 0) {
        return prev;
      }

      let safeQty = parseInt(qty, 10);
      if (!Number.isFinite(safeQty) || safeQty <= 0) safeQty = 1;

      if (existing) {
        const others = prev.filter((x) => x.id !== p.id);
        let newQty = existing.qty + safeQty;

        if (stock !== null) {
          newQty = Math.min(newQty, stock);
        }

        return [
          ...others,
          {
            ...existing,
            ...p,
            stock: stock ?? existing.stock,
            qty: newQty,
          },
        ];
      } else {
        let initialQty = safeQty;

        if (stock !== null) {
          initialQty = Math.min(initialQty, stock);
        }

        return [
          ...prev,
          {
            ...p,
            stock,
            qty: initialQty,
          },
        ];
      }
    });
  };

  const setQty = (id, qty) => {
    setItems((prev) => {
      const item = prev.find((x) => x.id === id);
      if (!item) return prev;

      const stock =
        typeof item.stock === 'number' ? item.stock : null;

      let newQty = parseInt(qty, 10);
      if (!Number.isFinite(newQty) || newQty <= 0) newQty = 1;

      if (stock !== null) {
        if (stock <= 0) {
          return prev.filter((x) => x.id !== id);
        }
        newQty = Math.min(newQty, stock);
      }

      if (newQty <= 0) {
        return prev.filter((x) => x.id !== id);
      }

      return prev.map((x) =>
        x.id === id ? { ...x, qty: newQty } : x
      );
    });
  };

  const remove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const total = items.reduce(
      (acc, it) => acc + (it.precio || 0) * (it.qty || 1),
      0
    );

    return {
      total,
      totalLabel: formatCurrency(total),
      count: items.length,
    };
  }, [items]);

  return (
    <CartCtx.Provider
      value={{ items, add, remove, clear, setQty, totals }}
    >
      {children}
    </CartCtx.Provider>
  );
};

export const useCart = () => useContext(CartCtx);
