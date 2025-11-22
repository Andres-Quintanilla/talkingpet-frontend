import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';

const serviceIcons = {
  baño: '🛁',
  peluqueria: '✂️',
  veterinaria: '⚕️',
  adiestramiento: '🎓',
};

export default function Services() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/services', {
          params: { _ts: Date.now() },
        });
        setServicios(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServicios();
  }, []);

  return (
    <>
      <SEO
        title="Nuestros Servicios - TalkingPet"
        description="Servicios profesionales para mascotas: baño, peluqueria, veterinaria y adiestramiento en Santa Cruz, Bolivia."
        url="http://localhost:5173/servicios"
      />

      <main className="main" role="main">
        <section className="page-header">
          <div className="container">
            <h1 className="page-header__title">Nuestros Servicios Profesionales</h1>
            <p className="page-header__subtitle">
              Todo lo que necesitas para el bienestar de tu mascota, en un solo lugar.
            </p>
          </div>
        </section>

        <section className="services-page">
          <div className="container">
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando servicios...</p>
              </div>
            )}

            {!loading && servicios.length === 0 && (
              <div className="empty-state">
                <p>No hay servicios disponibles en este momento.</p>
              </div>
            )}

            <div className="featured-grid">
              {!loading &&
                servicios.map((s) => (
                  <article key={s.id} className="service-card">
                    <div className="service-card__media">
                      {s.imagen_url ? (
                        <img
                          src={s.imagen_url}
                          alt={s.nombre}
                          className="service-card__img"
                        />
                      ) : (
                        <div className="service-card__icon" aria-hidden="true">
                          {serviceIcons[s.tipo] || '🐾'}
                        </div>
                      )}
                    </div>

                    <h3 className="service-card__title">{s.nombre}</h3>

                    <p className="service-card__description">
                      {s.descripcion || 'Servicio para el bienestar de tu mascota.'}
                    </p>

                    <p className="service-card__price">
                      Desde {formatCurrency(Number(s.precio_base || 0))}
                    </p>

                    <Link
                      to="/agendar"
                      state={{ servicioId: s.id }}
                      className="btn btn--primary"
                    >
                      Agendar Ahora
                    </Link>
                  </article>
                ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
