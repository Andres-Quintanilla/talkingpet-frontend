import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../utils/format';

const CartCtx = createContext();

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tp_cart') || '[]'); }
        catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('tp_cart', JSON.stringify(items));
    }, [items]);

    const add = (p, qty = 1) => {
        setItems((prev) => {
            const i = prev.findIndex(x => x.id === p.id);
            if (i >= 0) {
                const copy = [...prev];
                copy[i].qty += qty;
                return copy;
            }
            return [...prev, { ...p, qty }];
        });
    };

    const remove = (id) => setItems(items.filter(i => i.id !== id));
    const clear = () => setItems([]);
    const setQty = (id, qty) => {
        if (qty <= 0) return remove(id);
        setItems(items.map(i => i.id === id ? { ...i, qty } : i));
    };

    const totals = useMemo(() => {
        const total = items.reduce((s, i) => s + i.precio * i.qty, 0);
        return { total, totalLabel: formatCurrency(total), count: items.length };
    }, [items]);

    return (
        <CartCtx.Provider value={{ items, add, remove, clear, setQty, totals }}>
            {children}
        </CartCtx.Provider>
    );
};

export const useCart = () => useContext(CartCtx);
