import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';

export default function MyCourses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/courses/mine', {
          params: { _ts: Date.now() },
        });
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching my courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <>
      <SEO
        title="Mis Cursos - TalkingPet"
        description="Accede a todos los cursos que has comprado o a los que te has inscrito."
        url="http://localhost:5173/mis-cursos"
      />

      <main className="main" role="main">
        <section className="page-header">
          <div className="container">
            <h1 className="page-header__title">Mis Cursos</h1>
            <p className="page-header__subtitle">
              Aquí encontrarás todos tus cursos virtuales y talleres presenciales.
            </p>
          </div>
        </section>

        <section className="courses-page">
          <div className="container">
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando tus cursos...</p>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="empty-state">
                <p>No estás inscrito en ningún curso.</p>
                <Link to="/cursos" className="btn btn--primary">
                  Ver Cursos Disponibles
                </Link>
              </div>
            )}

            <div className="courses-grid">
              {!loading &&
                items.map((c) => {
                  const isVirtual = c.modalidad === 'virtual';
                  const pagado = c.precio_snapshot ?? c.precio;
                  const cursoId = c.curso_id || c.id;

                  const thumbnail =
                    c.portada_url ||
                    c.portada ||
                    c.imagen_url ||
                    '/static/courses/default-course.jpg';

                  return (
                    <article key={c.id} className="course-card">
                      <div className="course-card__image-wrapper">
                        <img
                          src={thumbnail}
                          alt={c.titulo}
                          className="course-card__image"
                          loading="lazy"
                        />
                      </div>

                      <h3 className="course-card__title">{c.titulo}</h3>

                      <ul className="course-card__details">
                        <li>
                          <strong>Modalidad:</strong>{' '}
                          <span
                            className={`badge ${
                              isVirtual ? 'badge--primary' : 'badge--accent'
                            }`}
                          >
                            {isVirtual ? 'virtual' : 'presencial'}
                          </span>
                        </li>
                        <li>
                          <strong>Progreso:</strong> {c.progreso ?? 0}%
                        </li>
                        <li>
                          <strong>Pagado:</strong>{' '}
                          {pagado != null ? formatCurrency(pagado) : '0,00'}
                        </li>
                      </ul>

                      <Link
                        to={isVirtual ? `/mis-cursos/${cursoId}/ver` : '#'}
                        className={`btn ${
                          isVirtual
                            ? 'btn--primary'
                            : 'btn--secondary btn--disabled'
                        }`}
                        title={
                          isVirtual
                            ? 'Empezar a ver'
                            : 'Taller presencial, no requiere visor'
                        }
                      >
                        {isVirtual ? 'Empezar a ver' : 'Inscripción Confirmada'}
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
