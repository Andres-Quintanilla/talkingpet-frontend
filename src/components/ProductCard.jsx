import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

function badgeFor(stock = 0, activo = true) {
    if (!activo || stock <= 0) return { cls: 'product-card__badge--out', label: 'Agotado' };
    if (stock < 5) return { cls: 'product-card__badge--low', label: 'Poco stock' };
    return { cls: 'product-card__badge--stock', label: 'En stock' };
}

export default function ProductCard({ p }) {
    const { add } = useCart();
    const badge = badgeFor(p.stock, p.activo);

    return (
        <article className="product-card">
            <div className="product-card__img-wrapper">
                <span className={`product-card__badge ${badge.cls}`}>{badge.label}</span>
                <img
                    className="product-card__img"
                    src={p.imagen_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3ESin%20imagen%3C/text%3E%3C/svg%3E"}
                    alt={p.nombre}
                    loading="lazy"
                />
            </div>

            <div className="product-card__body">
                <h3 className="product-card__title">{p.nombre}</h3>
                <p className="product-card__price">{formatCurrency(p.precio)}</p>

                <div className="product-card__actions">
                    <button
                        className={`btn btn--accent btn--sm${(!p.activo || p.stock <= 0) ? ' btn--disabled' : ''}`}
                        onClick={() => add(p)}
                        disabled={!p.activo || p.stock <= 0}
                    >
                        Agregar
                    </button>

                    <Link to={`/productos/${p.id}`} className="btn btn--outline-primary btn--sm">
                        Ver detalle
                    </Link>
                </div>
            </div>
        </article>
    );
}
