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

    useEffect(() => {
        (async () => {
            const { data } = await api.get(`/api/products/${id}`);
            setP(data);
        })();
    }, [id]);

    if (!p) return null;

    return (
        <>
            <SEO
                title={p.nombre}
                description={p.descripcion?.slice(0, 150) || 'Producto'}
                url={`http://localhost:5173/productos/${p.id}`}
                image={p.imagen_url || '/images/dog-food.svg'}
            />
            <div className="container product-detail">
                <div className="product-detail__layout">
                    <div className="product-gallery__main">
                        <img src={p.imagen_url || '/images/dog-food.svg'} alt={p.nombre} />
                    </div>
                    <div className="product-info">
                        <h1 className="product-info__title">{p.nombre}</h1>
                        <div className="product-info__price">
                            <span className="product-info__price-current">{formatCurrency(p.precio)}</span>
                        </div>
                        <div className="product-info__description">
                            <h2 className="product-info__subtitle">Descripción</h2>
                            <p>{p.descripcion || 'Sin descripción.'}</p>
                        </div>
                        <div className="product-info__buttons">
                            <button className="btn btn--primary btn--lg" onClick={() => add(p, 1)}>Agregar al carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
