import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';

const courseIcons = {
  presencial: '🐾',
  virtual: '💻',
};

export default function Courses() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/courses');
        setCursos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  return (
    <>
      <SEO
        title="Cursos - TalkingPet"
        description="Cursos para dueños de mascotas: adiestramiento básico, primeros auxilios, nutrición canina y bienestar felino en Santa Cruz, Bolivia."
        url="http://localhost:5173/cursos"
      />

      <main className="main" role="main">
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
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando cursos...</p>
              </div>
            )}

            {!loading && cursos.length === 0 && (
              <div className="empty-state">
                <p>No hay cursos disponibles en este momento.</p>
              </div>
            )}

            <div className="courses-grid">
              {!loading &&
                cursos.map((c) => {
                  const isVirtual = c.modalidad === 'virtual';
                  const icon = courseIcons[c.modalidad] || '🎓';
                  const precio =
                    c.precio != null ? formatCurrency(Number(c.precio)) : 'Gratis';

                  const fechaPresencial =
                    !isVirtual && c.fecha_inicio_presencial
                      ? new Date(c.fecha_inicio_presencial).toLocaleDateString('es-BO')
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
                        <div className="course-card__icon" aria-hidden="true">
                          {icon}
                        </div>
                      )}

                      <h3 className="course-card__title">{c.titulo}</h3>

                      {desc && (
                        <p className="course-card__description">{desc}</p>
                      )}

                      <ul className="course-card__details">
                        <li>
                          <strong>Modalidad:</strong>{' '}
                          <span
                            className={`badge ${
                              isVirtual ? 'badge--primary' : 'badge--accent'
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
        </section>
      </main>
    </>
  );
}
