import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useEffect, useMemo, useState } from 'react';
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

  // búsqueda por texto
  const [q, setQ] = useState('');

  // filtros por tipo de servicio
  const [tipos, setTipos] = useState({
    baño: false,
    peluqueria: false,
    veterinaria: false,
    adiestramiento: false,
  });

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

  // aplica filtros (texto + tipo)
  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    const activos = Object.entries(tipos)
      .filter(([, v]) => v)
      .map(([k]) => k);

    return servicios.filter((s) => {
      const nombre = (s.nombre || '').toLowerCase();
      const desc = (s.descripcion || '').toLowerCase();
      const tipo = (s.tipo || '').toLowerCase();

      const matchQ =
        !term || nombre.includes(term) || desc.includes(term);

      const matchTipo =
        !activos.length || activos.includes(tipo);

      return matchQ && matchTipo;
    });
  }, [servicios, q, tipos]);

  const toggleTipo = (name) => {
    setTipos((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <>
      <SEO
        title="Servicios Veterinarios y Peluquería - A Domicilio"
        description="Servicios profesionales para mascotas en Bolivia: veterinaria con personal certificado, peluquería canina, baño a domicilio, adiestramiento profesional. Precios competitivos y atención de calidad. Agenda tu cita."
        url="/servicios"
        keywords="veterinaria Bolivia, peluquería canina domicilio, baño mascotas domicilio, adiestramiento perros, servicios mascotas profesionales, veterinario certificado, grooming mascotas"
        type="website"
      />

      <div className="services-page">
        <div className="container">
          {/* usamos el mismo estilo de título que productos */}
          <h1 className="products-page__title">
            Nuestros Servicios Profesionales
          </h1>

          {/* mismo layout que productos: sidebar + listado */}
          <div className="products-page__layout">
            {/* SIDEBAR DE FILTROS */}
            <aside
              className="sidebar"
              role="complementary"
              aria-label="Filtros de servicios"
            >
              <div className="filter-group">
                <h2 className="filter-group__title">Búsqueda</h2>
                <div className="filter-group__content">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar servicios..."
                    aria-label="Buscar servicios"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <h2 className="filter-group__title">Tipo de servicio</h2>
                <div className="filter-group__content">
                  {Object.keys(tipos).map((tipo) => (
                    <label key={tipo} className="checkbox">
                      <input
                        type="checkbox"
                        className="checkbox__input"
                        checked={tipos[tipo]}
                        onChange={() => toggleTipo(tipo)}
                      />
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <button
                  className="btn btn--primary btn--full"
                  type="button"
                  onClick={() => {
                    // solo resetea a filtros por defecto
                    setQ('');
                    setTipos({
                      baño: false,
                      peluqueria: false,
                      veterinaria: false,
                      adiestramiento: false,
                    });
                  }}
                >
                  Limpiar filtros
                </button>
                <p className="form-note" style={{ marginTop: '0.5rem' }}>
                  Los filtros se aplican automáticamente al escribir
                  o marcar tipos de servicio.
                </p>
              </div>
            </aside>

            {/* LISTADO DE SERVICIOS */}
            <div className="products-content">
              <div className="products-header">
                <p className="products-header__results">
                  {loading
                    ? 'Cargando...'
                    : (
                      <>
                        Mostrando{' '}
                        <strong>{filtrados.length} resultados</strong>
                      </>
                    )}
                </p>
              </div>

              <div className="products-grid">
                {loading && (
                  <div className="loading-state">
                    <div className="spinner" />
                    <p>Cargando servicios...</p>
                  </div>
                )}

                {!loading && filtrados.length === 0 && (
                  <div className="empty-state">
                    <p>No hay servicios que coincidan con los filtros.</p>
                  </div>
                )}

                {!loading &&
                  filtrados.map((s) => (
                    <article key={s.id} className="service-card">
                      <div className="service-card__media">
                        {s.imagen_url ? (
                          <img
                            src={s.imagen_url}
                            alt={s.nombre}
                            className="service-card__img"
                          />
                        ) : (
                          <div
                            className="service-card__icon"
                            aria-hidden="true"
                          >
                            {serviceIcons[s.tipo] || '🐾'}
                          </div>
                        )}
                      </div>

                      <h3 className="service-card__title">{s.nombre}</h3>

                      <p className="service-card__description">
                        {s.descripcion ||
                          'Servicio para el bienestar de tu mascota.'}
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
          </div>
        </div>
      </div>
    </>
  );
}
