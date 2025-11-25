import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';

const courseIcons = {
  presencial: '',
  virtual: '',
};

export default function Courses() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');

  const [modalidades, setModalidades] = useState({
    virtual: false,
    presencial: false,
  });

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/courses', {
          params: { _ts: Date.now() },
        });
        setCursos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    const activos = Object.entries(modalidades)
      .filter(([, v]) => v)
      .map(([k]) => k); 

    return cursos.filter((c) => {
      const titulo = (c.titulo || '').toLowerCase();
      const desc = (c.descripcion || '').toLowerCase();
      const modalidad = (c.modalidad || '').toLowerCase();

      const matchQ =
        !term || titulo.includes(term) || desc.includes(term);

      const matchMod =
        !activos.length || activos.includes(modalidad);

      return matchQ && matchMod;
    });
  }, [cursos, q, modalidades]);

  const toggleModalidad = (name) => {
    setModalidades((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <>
      <SEO
        title="Cursos de Adiestramiento y Cuidado de Mascotas"
        description="Cursos profesionales para dueños de mascotas en Bolivia: adiestramiento canino, primeros auxilios veterinarios, nutrición animal, cuidados especiales. Modalidad presencial y virtual. Inscripciones abiertas."
        url="/cursos"
        keywords="cursos adiestramiento perros, cursos mascotas Bolivia, primeros auxilios mascotas, nutrición canina, cursos cuidado mascotas, entrenamiento perros, educación canina"
        type="website"
      />

      <section className="page-header">
        <div className="container">
          <h1 className="page-header__title">Cursos de Capacitación</h1>
          <p className="page-header__subtitle">
            Aprende a cuidar, entender y fortalecer el vínculo con tu mascota.
          </p>
        </div>
      </section>

      <section className="courses-page">
        <div className="container">
          <div className="products-page__layout">
            <aside
              className="sidebar"
              role="complementary"
              aria-label="Filtros de cursos"
            >
              <div className="filter-group">
                <h2 className="filter-group__title">Búsqueda</h2>
                <div className="filter-group__content">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar cursos..."
                    aria-label="Buscar cursos"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <h2 className="filter-group__title">Modalidad</h2>
                <div className="filter-group__content">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      className="checkbox__input"
                      checked={modalidades.virtual}
                      onChange={() => toggleModalidad('virtual')}
                    />
                    Virtual
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      className="checkbox__input"
                      checked={modalidades.presencial}
                      onChange={() => toggleModalidad('presencial')}
                    />
                    Presencial
                  </label>
                </div>
              </div>

              <div className="filter-group">
                <button
                  className="btn btn--primary btn--full"
                  type="button"
                  onClick={() =>
                    setModalidades({
                      virtual: false,
                      presencial: false,
                    })
                  }
                >
                  Limpiar filtros
                </button>
                <p className="form-note" style={{ marginTop: '0.5rem' }}>
                  Los filtros se aplican automáticamente al escribir
                  o marcar modalidades.
                </p>
              </div>
            </aside>

            <div className="products-content">
              <div className="products-header">
                <p className="products-header__results">
                  {loading ? (
                    'Cargando cursos...'
                  ) : (
                    <>
                      Mostrando{' '}
                      <strong>{filtrados.length} resultados</strong>
                    </>
                  )}
                </p>
              </div>

              <div className="courses-grid">
                {loading && (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando cursos...</p>
                  </div>
                )}

                {!loading && filtrados.length === 0 && (
                  <div className="empty-state">
                    <p>No hay cursos que coincidan con los filtros.</p>
                  </div>
                )}

                {!loading &&
                  filtrados.map((c) => {
                    const isVirtual = c.modalidad === 'virtual';
                    const icon = courseIcons[c.modalidad] || '🎓';
                    const precio =
                      c.precio != null
                        ? formatCurrency(Number(c.precio))
                        : 'Gratis';

                    const fechaPresencial =
                      !isVirtual && c.fecha_inicio_presencial
                        ? new Date(
                            c.fecha_inicio_presencial
                          ).toLocaleDateString('es-BO')
                        : null;

                    const desc =
                      (c.descripcion || '').length > 140
                        ? `${c.descripcion.slice(0, 140)}…`
                        : c.descripcion;

                    return (
                      <article key={c.id} className="course-card">
                        {c.portada_url ? (
                          <div className="course-card__media">
                            <img
                              src={c.portada_url}
                              alt={c.titulo}
                              className="course-card__img"
                            />
                          </div>
                        ) : (
                          <div
                            className="course-card__icon"
                            aria-hidden="true"
                          >
                            {icon}
                          </div>
                        )}

                        <h3 className="course-card__title">{c.titulo}</h3>

                        {desc && (
                          <p className="course-card__description">
                            {desc}
                          </p>
                        )}

                        <ul className="course-card__details">
                          <li>
                            <strong>Modalidad:</strong>{' '}
                            <span
                              className={`badge ${
                                isVirtual
                                  ? 'badge--primary'
                                  : 'badge--accent'
                              }`}
                            >
                              {isVirtual ? 'Virtual' : 'Presencial'}
                            </span>
                          </li>

                          <li>
                            <strong>Costo:</strong> {precio}
                          </li>

                          {!isVirtual && c.cupos_totales != null && (
                            <li>
                              <strong>Cupos:</strong> {c.cupos_totales}
                            </li>
                          )}

                          {!isVirtual && fechaPresencial && (
                            <li>
                              <strong>Fecha:</strong> {fechaPresencial}
                            </li>
                          )}
                        </ul>

                        <Link
                          to={`/cursos/${c.id}`}
                          className="btn btn--primary"
                        >
                          Ver detalles
                        </Link>
                      </article>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
