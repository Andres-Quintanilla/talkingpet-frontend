import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/api/products/${id}`);
      setP(data);
    })();
  }, [id]);

  useEffect(() => {
    if (p) {
      setQty(p.stock > 0 ? 1 : 0);
    }
  }, [p]);

  if (!p) return null;

  const imageUrl = p.imagen_url || '/images/dog-food.svg';
  const inStock = p.stock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;

    const stock = p.stock || 0;

    const existing = items.find((i) => i.id === p.id);
    const currentQty = existing?.qty || 0;

    const maxToAdd = stock - currentQty;
    if (maxToAdd <= 0) {
      return;
    }

    const safeQty = Math.min(qty, maxToAdd);
    if (safeQty <= 0) return;

    const item = {
      ...p,
      imagen_url: imageUrl,
    };
    add(item, safeQty);
  };

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nombre,
    description: p.descripcion || 'Producto para mascotas de calidad',
    image: imageUrl.startsWith('http')
      ? imageUrl
      : `http://localhost:5173${imageUrl}`,
    brand: {
      '@type': 'Brand',
      name: 'TalkingPet',
    },
    offers: {
      '@type': 'Offer',
      price: p.precio,
      priceCurrency: 'BOB',
      availability:
        p.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `http://localhost:5173/productos/${p.id}`,
    },
    aggregateRating: p.calificacion
      ? {
        '@type': 'AggregateRating',
        ratingValue: p.calificacion,
        reviewCount: p.total_reviews || 1,
      }
      : undefined,
  };

  const handleChangeQty = (value) => {
    if (!inStock) return;
    const max = p.stock || 0;
    let v = Number(value || 1);
    if (Number.isNaN(v)) v = 1;
    v = Math.max(1, Math.min(max, v));
    setQty(v);
  };

  const handleDecrease = () => {
    if (!inStock) return;
    setQty((q) => Math.max(1, Math.min(p.stock, q - 1)));
  };

  const handleIncrease = () => {
    if (!inStock) return;
    setQty((q) => Math.min(p.stock, q + 1));
  };

  return (
    <>
      <SEO
        title={`${p.nombre} - Productos para Mascotas`}
        description={
          p.descripcion?.slice(0, 155) ||
          `${p.nombre} - Producto de calidad para tu mascota. Disponible en TalkingPet Bolivia.`
        }
        url={`/productos/${p.id}`}
        image={imageUrl}
        type="product"
        keywords={`${p.nombre}, ${p.categoria || 'productos mascotas'
          }, comprar ${p.nombre}, ${p.nombre} Bolivia`}
        structuredData={productStructuredData}
      />

      <div className="container product-detail">
        <div className="product-detail__layout">
          <div className="product-gallery__main">
            <img
              src={imageUrl}
              alt={p.nombre}
              className="product-gallery__img"
            />
          </div>

          <div className="product-info">
            <h1 className="product-info__title">{p.nombre}</h1>

            <div className="product-info__price">
              <span className="product-info__price-current">
                {formatCurrency(p.precio)}
              </span>
            </div>

            <p
              className={`product-info__stock ${inStock
                  ? 'product-info__stock--available'
                  : 'product-info__stock--out'
                }`}
            >
              {inStock
                ? `Quedan ${p.stock} unidades disponibles`
                : 'Sin stock disponible'}
            </p>

            <div className="product-info__description">
              <h2 className="product-info__subtitle">Descripción</h2>
              <p>{p.descripcion || 'Sin descripción.'}</p>
            </div>

            <div className="product-info__purchase">
              <div className="form-group" style={{ maxWidth: 220 }}>
                <label className="form-label" htmlFor="product-qty">
                  Cantidad
                </label>
                <div className="quantity-box">
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={handleDecrease}
                    disabled={!inStock}
                  >
                    −
                  </button>

                  <input
                    id="product-qty"
                    type="number"
                    className="quantity-input"
                    min={1}
                    max={inStock ? p.stock : 0}
                    value={qty}
                    disabled={!inStock}
                    onChange={(e) => handleChangeQty(e.target.value)}
                  />

                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={handleIncrease}
                    disabled={!inStock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="product-info__buttons">
                <button
                  className="btn btn--primary btn--lg"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  {inStock ? 'Agregar al carrito' : 'Sin stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
