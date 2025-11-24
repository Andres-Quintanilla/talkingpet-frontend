import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/format';
import '../../styles/admin-dashboard.css';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totals: {
      products: 0,
      services: 0,
      courses: 0,
      orders: 0,
      ingresos: 0,
      bookings: 0,
    },
    latestOrders: [],
    latestBookings: [],
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // 🔥 Solo usamos endpoints que sí existen en tu backend v3
        const [
          productsRes,
          servicesRes,
          coursesRes,
          summaryRes,
          bookingsRes,
        ] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/services'),
          api.get('/api/courses'),
          api.get('/api/orders/admin/summary'),
          api.get('/api/bookings/all'),
        ]);

        if (!mounted) return;

        const products = productsRes.data || [];
        const services = servicesRes.data || [];
        const courses = coursesRes.data || [];
        const bookings = bookingsRes.data || [];

        const kpi = summaryRes.data.kpis || {};
        const recientes = summaryRes.data.recientes || [];

        const latestBookings = bookings.slice(0, 5);

        setSummary({
          totals: {
            products: products.length,
            services: services.length,
            courses: courses.length,
            orders: Number(kpi.total_pedidos || 0),
            ingresos: Number(kpi.total_ingresos || 0),
            bookings: bookings.length,
          },
          latestOrders: recientes,
          latestBookings,
        });
      } catch (e) {
        console.error('Error cargando dashboard admin', e);
        setError('No se pudo cargar el resumen. Intenta nuevamente.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const { totals, latestOrders, latestBookings } = summary;

  return (
    <div className="admin-main">
      <header className="admin-main__header">
        <h1 className="admin-main__title">Dashboard</h1>
        <p className="admin-main__subtitle">Resumen general de TalkingPet.</p>
      </header>

      {loading && (
        <div className="admin-dashboard__loading">Cargando resumen...</div>
      )}

      {error && !loading && (
        <div className="admin-dashboard__error">{error}</div>
      )}

      {!loading && !error && (
        <div className="admin-dashboard">
          {/* KPIs */}
          <section className="admin-kpi-grid">
            <article className="admin-kpi-card">
              <p className="admin-kpi-label">Productos activos</p>
              <p className="admin-kpi-value">{totals.products}</p>
              <p className="admin-kpi-sub">En catálogo de la tienda</p>
            </article>

            <article className="admin-kpi-card">
              <p className="admin-kpi-label">Servicios</p>
              <p className="admin-kpi-value">{totals.services}</p>
              <p className="admin-kpi-sub">
                Baños, peluquería, vet, adiestramiento
              </p>
            </article>

            <article className="admin-kpi-card">
              <p className="admin-kpi-label">Cursos</p>
              <p className="admin-kpi-value">{totals.courses}</p>
              <p className="admin-kpi-sub">Cursos virtuales / talleres</p>
            </article>

            <article className="admin-kpi-card">
              <p className="admin-kpi-label">Pedidos totales</p>
              <p className="admin-kpi-value">{totals.orders}</p>
              <p className="admin-kpi-sub">Pedidos registrados en el sistema</p>
            </article>

            <article className="admin-kpi-card">
              <p className="admin-kpi-label">Citas</p>
              <p className="admin-kpi-value">{totals.bookings}</p>
              <p className="admin-kpi-sub">Citas agendadas en total</p>
            </article>

            <article className="admin-kpi-card">
              <p className="admin-kpi-label">Ingresos</p>
              <p className="admin-kpi-value">
                {formatCurrency(totals.ingresos)}
              </p>
              <p className="admin-kpi-sub">Total de pedidos pagados</p>
            </article>
          </section>

          {/* Últimos pedidos + Últimas citas */}
          <section className="admin-dashboard__grid">
            {/* Últimos pedidos */}
            <article className="admin-panel">
              <header className="admin-panel__header">
                <h2 className="admin-panel__title">Últimos pedidos</h2>
                <p className="admin-panel__subtitle">
                  Pedidos más recientes registrados en la plataforma.
                </p>
              </header>

              {latestOrders.length === 0 ? (
                <p className="admin-panel__empty">
                  Aún no hay pedidos registrados.
                </p>
              ) : (
                <ul className="admin-panel__list">
                  {latestOrders.map((order) => (
                    <li key={order.id} className="admin-panel__list-item">
                      <div>
                        <p className="admin-panel__list-primary">
                          Pedido #{order.id} ·{' '}
                          {formatCurrency(Number(order.total || 0))}
                        </p>
                        <p className="admin-panel__list-secondary">
                          Estado: {order.estado} ·{' '}
                          {order.fecha_pedido
                            ? new Date(order.fecha_pedido).toLocaleString()
                            : 'Sin fecha'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            {/* Últimas citas */}
            <article className="admin-panel">
              <header className="admin-panel__header">
                <h2 className="admin-panel__title">Últimas citas</h2>
                <p className="admin-panel__subtitle">
                  Citas más recientemente agendadas.
                </p>
              </header>

              {latestBookings.length === 0 ? (
                <p className="admin-panel__empty">
                  Aún no hay citas registradas.
                </p>
              ) : (
                <ul className="admin-panel__list">
                  {latestBookings.map((b) => (
                    <li key={b.id} className="admin-panel__list-item">
                      <div>
                        <p className="admin-panel__list-primary">
                          {b.servicio_nombre || 'Servicio'} ·{' '}
                          {b.mascota_nombre || 'Mascota'}
                        </p>
                        <p className="admin-panel__list-secondary">
                          {b.fecha}{' '}
                          {b.hora ? b.hora.slice(0, 5) : ''} · Estado:{' '}
                          {b.estado}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        </div>
      )}
    </div>
  );
}
