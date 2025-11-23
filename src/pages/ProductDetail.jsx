import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/api/products/${id}`);
      setP(data);
    })();
  }, [id]);

  if (!p) return null;

  const imageUrl = p.imagen_url || '/images/dog-food.svg';

  const handleAddToCart = () => {
    const item = {
      ...p,
      imagen_url: imageUrl,
    };
    add(item, qty);
  };

  return (
    <>
      <SEO
        title={p.nombre}
        description={p.descripcion?.slice(0, 150) || 'Producto'}
        url={`http://localhost:5173/productos/${p.id}`}
        image={imageUrl}
      />

      <div className="container product-detail">
        <div className="product-detail__layout">
          {/* Imagen principal */}
          <div className="product-gallery__main">
            <img
              src={imageUrl}
              alt={p.nombre}
              className="product-gallery__img"
            />
          </div>

          {/* Info del producto */}
          <div className="product-info">
            <h1 className="product-info__title">{p.nombre}</h1>

            <div className="product-info__price">
              <span className="product-info__price-current">
                {formatCurrency(p.precio)}
              </span>
            </div>

            <div className="product-info__description">
              <h2 className="product-info__subtitle">Descripción</h2>
              <p>{p.descripcion || 'Sin descripción.'}</p>
            </div>

            {/* Cantidad + botón */}
            <div className="form-group" style={{ maxWidth: 220 }}>
              <label className="form-label" htmlFor="product-qty">
                Cantidad
              </label>
              <div className="quantity-box">
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>

                <input
                  id="product-qty"
                  type="number"
                  className="quantity-input"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) => {
                    const val = Number(e.target.value || 1);
                    if (val >= 1 && val <= 99) setQty(val);
                  }}
                />

                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-info__buttons">
              <button
                className="btn btn--primary btn--lg"
                onClick={handleAddToCart}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
