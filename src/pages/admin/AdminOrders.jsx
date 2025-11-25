import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/format';
import '../../styles/orders.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get('/api/orders/admin');
        if (!mounted) return;

        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error cargando pedidos admin', e);
        if (mounted) {
          setError('No se pudieron cargar los pedidos.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="admin-main">
      <header className="admin-main__header">
        <h1 className="admin-main__title">Pedidos</h1>
        <p className="admin-main__subtitle">
          Listado de todos los pedidos registrados en la plataforma.
        </p>
      </header>

      <section className="orders-page">
        <div className="container">
          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Cargando pedidos...</p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="empty-state">
              <p>Aún no hay pedidos registrados.</p>
            </div>
          )}

          <div className="orders-list">
            {!loading &&
              !error &&
              orders.map((order) => {
                const fecha =
                  order.fecha_pedido || order.fecha_creacion || null;

                const fechaTexto = fecha
                  ? new Date(fecha).toLocaleString('es-BO')
                  : '';

                const clienteLabel =
                  order.cliente_nombre ||
                  (order.usuario_id
                    ? `Cliente #${order.usuario_id}`
                    : 'Cliente no asignado');

                return (
                  <article key={order.id} className="order-card">
                    <header className="order-card__header">
                      <div className="order-card__title-block">
                        <h2 className="order-card__title">
                          Pedido #{order.id}
                        </h2>
                        <p className="order-card__meta">
                          {clienteLabel}
                          {fechaTexto && ` · ${fechaTexto}`}
                        </p>
                      </div>

                      <div className="order-card__status">
                        <span className="badge badge--success">
                          {order.estado || 'pendiente'}
                        </span>
                        <span className="order-card__total">
                          {formatCurrency(order.total || 0)}
                        </span>
                      </div>
                    </header>

                    <div className="order-card__body">
                      <div className="order-items-wrapper">
                        <table
                          className="order-items-table"
                          aria-label={`Resumen del pedido ${order.id}`}
                        >
                          <thead>
                            <tr>
                              <th>Cliente</th>
                              <th>Estado</th>
                              <th>Total</th>
                              <th>Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{clienteLabel}</td>
                              <td>{order.estado || 'pendiente'}</td>
                              <td>{formatCurrency(order.total || 0)}</td>
                              <td>{fechaTexto}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
}
