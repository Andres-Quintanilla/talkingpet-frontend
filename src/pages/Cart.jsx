import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

export default function Cart() {
    const { items, setQty, remove } = useCart();

    const subtotal = items.reduce((acc, it) => acc + it.precio * it.qty, 0);
    const shipping = items.length > 0 ? 15 : 0; 
    const total = subtotal + shipping;

    return (
        <>
            <SEO
                title="Carrito de Compras - TalkingPet"
                description="Revisa y actualiza los productos de tu carrito antes de proceder al pago."
                url="http://localhost:5173/carrito"
            />

            <div className="page-header">
                <div className="container">
                    <h1 className="page-header__title">🛒 Carrito de Compras</h1>
                </div>
            </div>

            <section className="cart-section">
                <div className="container">
                    <div className="cart-layout">
                        <div className="cart-items">
                            <table className="cart-table">
                                <thead className="cart-table__head">
                                    <tr>
                                        <th colSpan="2">Producto</th>
                                        <th>Precio</th>
                                        <th>Cantidad</th>
                                        <th>Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody className="cart-table__body">
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '1rem' }}>
                                                Tu carrito está vacío. <Link to="/productos" className="breadcrumb__link">Ver productos</Link>
                                            </td>
                                        </tr>
                                    )}

                                    {items.map((it) => (
                                        <tr key={it.id}>
                                            <td className="cart-item__image">
                                                <img
                                                    src={
                                                        it.imagen_url ||
                                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' dominant-baseline='middle' text-anchor='middle' font-size='10'%3EProducto%3C/text%3E%3C/svg%3E"
                                                    }
                                                    alt={it.nombre}
                                                />
                                            </td>

                                            <td className="cart-item__name">
                                                {it.nombre}
                                            </td>

                                            <td className="cart-item__price">{formatCurrency(it.precio)}</td>

                                            <td className="cart-item__quantity">
                                                <input
                                                    type="number"
                                                    className="form-input quantity-input"
                                                    value={it.qty}
                                                    min={1}
                                                    max={99}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value || 1);
                                                        if (val >= 1 && val <= 99) setQty(it.id, val);
                                                    }}
                                                />
                                            </td>

                                            <td className="cart-item__subtotal">
                                                {formatCurrency(it.precio * it.qty)}
                                            </td>

                                            <td className="cart-item__remove">
                                                <button
                                                    className="btn-remove"
                                                    title="Quitar item"
                                                    onClick={() => remove(it.id)}
                                                    aria-label={`Quitar ${it.nombre}`}
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <aside className="cart-summary">
                            <h2 className="cart-summary__title">Resumen del Pedido</h2>

                            <div className="cart-summary__row">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>

                            <div className="cart-summary__row">
                                <span>Envío</span>
                                <span>{formatCurrency(shipping)}</span>
                            </div>

                            <div className="cart-summary__total">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>

                            <div className="cart-summary__actions">
                                <Link to="/checkout" className="btn btn--primary btn--lg btn--full">
                                    Ir a Pagar
                                </Link>
                                <Link to="/productos" className="btn btn--outline-primary btn--lg btn--full">
                                    Seguir Comprando
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
