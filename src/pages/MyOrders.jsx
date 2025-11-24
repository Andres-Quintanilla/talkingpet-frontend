// src/pages/MyOrders.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';
import '../styles/orders.css';

function formatItemType(tipo) {
  if (tipo === 'curso') return 'Curso';
  if (tipo === 'servicio') return 'Servicio';
  return 'Producto';
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/orders/mine');
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching my orders:', err);
        setError('No se pudieron cargar tus pedidos.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <>
      <SEO
        title="Mis Pedidos - TalkingPet"
        description="Revisa el historial de pedidos de tus productos, servicios y cursos."
        url="http://localhost:5173/mis-pedidos"
      />

      <main className="main" role="main">
        <section className="page-header">
          <div className="container">
            <h1 className="page-header__title">Mis Pedidos</h1>
            <p className="page-header__subtitle">
              Aquí encontrarás todos los productos, servicios y cursos que has
              comprado.
            </p>
          </div>
        </section>

        <section className="orders-page">
          <div className="container">
            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <p>Cargando tus pedidos...</p>
              </div>
            )}

            {!loading && error && (
              <div className="empty-state">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && orders.length === 0 && (
              <div className="empty-state">
                <p>Aún no tienes pedidos realizados.</p>
                <Link to="/productos" className="btn btn--primary">
                  Ver productos
                </Link>
              </div>
            )}

            <div className="orders-list">
              {!loading &&
                !error &&
                orders.map((order) => (
                  <article key={order.id} className="order-card">
                    {/* CABECERA DEL PEDIDO */}
                    <header className="order-card__header">
                      <div className="order-card__title-block">
                        <h2 className="order-card__title">
                          Pedido #{order.id}
                        </h2>
                        <p className="order-card__meta">
                          {order.fecha_creacion
                            ? new Date(order.fecha_creacion).toLocaleString(
                                'es-BO'
                              )
                            : ''}
                        </p>
                      </div>

                      <div className="order-card__status">
                        <span className="badge badge--success">
                          {order.estado || 'pagado'}
                        </span>
                        <span className="order-card__total-label">
                          Total pagado
                        </span>
                        <span className="order-card__total">
                          {formatCurrency(order.total || 0)}
                        </span>
                      </div>
                    </header>

                    {/* LISTA DE ITEMS */}
                    <div className="order-card__body">
                      <div className="order-items-wrapper">
                        <table
                          className="order-items-table"
                          aria-label={`Items del pedido ${order.id}`}
                        >
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map((it) => {
                              // Intentamos distintos nombres de campo para la imagen
                              const thumbnail =
                                it.imagen_url ||
                                it.imagen ||
                                it.portada_url ||
                                '/static/products/default-product.jpg';

                              return (
                                <tr key={it.id}>
                                  <td className="order-item__product">
                                    <div className="order-item__thumb">
                                      <img
                                        src={thumbnail}
                                        alt={it.nombre}
                                        loading="lazy"
                                      />
                                    </div>
                                    <div className="order-item__info">
                                      <span className="order-item__name">
                                        {it.nombre}
                                      </span>
                                      <span className="order-item__type">
                                        {formatItemType(it.tipo_item)}
                                      </span>
                                    </div>
                                  </td>
                                  <td>{it.qty}</td>
                                  <td>
                                    {formatCurrency(it.precio_unitario || 0)}
                                  </td>
                                  <td>
                                    {formatCurrency(
                                      (it.precio_unitario || 0) *
                                        (it.qty || 1)
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* FOOTER CON RESUMEN (POR SI QUIERES DESTACAR MÁS) */}
                      <div className="order-card__footer">
                        <span className="order-card__footer-label">
                          Total del pedido
                        </span>
                        <span className="order-card__footer-total">
                          {formatCurrency(order.total || 0)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
