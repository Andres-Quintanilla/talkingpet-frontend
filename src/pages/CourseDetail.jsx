// src/pages/CourseDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { CheckCircle, Clock, Users, PlayCircle, Lock } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        setLoading(true);

        // 1) SIEMPRE traer el curso primero
        const { data } = await api.get(`/api/courses/${id}`);
        setCurso(data);
      } catch (err) {
        console.error('Error fetching curso:', err);
        setError('No se pudo cargar el curso.');
        setLoading(false);
        return;
      }

      // 2) Si hay usuario, verificar inscripción
      if (user) {
        try {
          const { data: misCursos } = await api.get('/api/courses/mine');

          if (Array.isArray(misCursos)) {
            if (misCursos.some((c) => c.curso_id === Number(id))) {
              setIsEnrolled(true);
            }
          }
        } catch (err) {
          console.warn('Error cargando /mine, pero no se rompe:', err);
        }
      }

      setLoading(false);
    };

    fetchCurso();
  }, [id, user]);

  const handleBuyOrEnroll = () => {
    if (!curso) return;

    // Si no está logueado, lo mandamos a login
    if (!user) {
      navigate('/login', { state: { returnTo: `/cursos/${id}` } });
      return;
    }

    setEnrolling(true);

    // Añadir el curso al carrito local
    add(
      {
        id: `curso-${curso.id}`,       // id único dentro del carrito
        nombre: curso.titulo,
        precio: curso.precio ?? 0,
        tipo_item: 'curso',
        imagen_url: curso.portada_url || null,
        curso_id: curso.id,           // para que Checkout sepa que es curso
      },
      1
    );

    setEnrolling(false);
    navigate('/carrito');
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando curso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/cursos" className="btn btn--primary">
          Volver a Cursos
        </Link>
      </div>
    );
  }

  if (!curso) return null;

  const isVirtual = curso.modalidad === 'virtual';
  const contenido = Array.isArray(curso.contenido) ? curso.contenido : [];

  return (
    <>
      <SEO
        title={curso.titulo}
        description={(curso.descripcion || '').substring(0, 160)}
        url={`http://localhost:5173/cursos/${id}`}
      />

      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav className="breadcrumb" aria-label="Ruta de navegación">
            <Link to="/" className="breadcrumb__link">Inicio</Link>
            <span className="breadcrumb__separator">/</span>
            <Link to="/cursos" className="breadcrumb__link">Cursos</Link>
            <span className="breadcrumb__separator">/</span>
            <span className="breadcrumb__current">{curso.titulo}</span>
          </nav>
        </div>
      </div>

      <div className="course-detail-layout container">
        <div className="course-detail-main">
          <h1 className="course-detail__title">{curso.titulo}</h1>

          <p className="course-detail__instructor">
            Por: <strong>{curso.instructor_nombre || 'TalkingPet'}</strong>
          </p>

          <p className="course-detail__description">{curso.descripcion}</p>

          <h2 className="course-detail__subtitle">
            {isVirtual ? 'Contenido del Curso' : 'Detalles del Taller'}
          </h2>

          {/* CONTENIDO */}
          {isVirtual ? (
            <div className="course-content-list">
              {contenido.length === 0 && (
                <p className="course-content-empty">
                  Próximamente agregaremos el contenido de este curso.
                </p>
              )}

              {contenido.map((item, index) => (
                <div key={item.id} className="course-content-item">
                  <div className="course-content-item__icon">
                    {isEnrolled ? (
                      <PlayCircle size={20} color="var(--color-primary)" />
                    ) : (
                      <Lock size={20} color="var(--color-text-light)" />
                    )}
                  </div>

                  <div className="course-content-item__title">
                    {index + 1}. {item.titulo}
                  </div>

                  <div className="course-content-item__duration">
                    {item.duracion_minutos} min
                  </div>

                  {isEnrolled && item.url && (
                    <button
                      type="button"
                      className="course-content-item__link"
                      onClick={() =>
                        navigate(`/mis-cursos/${id}/ver`, {
                          state: { initialContentId: item.id },
                        })
                      }
                    >
                      Ver clase
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="course-content-list">
              <div className="course-content-item">
                <div className="course-content-item__icon">🗓️</div>
                <div className="course-content-item__title">
                  <strong>Fecha:</strong>{' '}
                  {curso.fecha_inicio_presencial
                    ? new Date(curso.fecha_inicio_presencial).toLocaleDateString('es-BO')
                    : 'Por confirmar'}
                </div>
              </div>

              <div className="course-content-item">
                <div className="course-content-item__icon">📍</div>
                <div className="course-content-item__title">
                  <strong>Lugar:</strong> Local TalkingPet (Av. Ejemplo #123)
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="course-detail-sidebar">
          <div className="course-buy-box">
            <div className="course-buy-box__icon">
              {isVirtual ? '💻' : '🐾'}
            </div>

            <div className="course-buy-box__price">
              {curso.precio != null ? formatCurrency(curso.precio) : 'Gratis'}
            </div>

            {isEnrolled ? (
              <Link
                to={isVirtual ? `/mis-cursos/${id}/ver` : '/mis-cursos'}
                className="btn btn--success btn--lg btn--full"
              >
                {isVirtual ? 'Comenzar a ver' : 'Ver inscripción'}
              </Link>
            ) : (
              <button
                className="btn btn--primary btn--lg btn--full"
                onClick={handleBuyOrEnroll}
                disabled={enrolling}
              >
                {enrolling
                  ? 'Procesando...'
                  : isVirtual
                  ? 'Comprar Curso Ahora'
                  : 'Inscribirse al Taller'}
              </button>
            )}

            <div className="course-buy-box__meta">
              <div className="meta-item">
                <CheckCircle size={16} />
                <span>Modalidad {curso.modalidad}</span>
              </div>

              <div className="meta-item">
                <Clock size={16} />
                <span>Acceso de por vida</span>
              </div>

              <div className="meta-item">
                <Users size={16} />
                <span>
                  {isVirtual
                    ? 'Acceso individual'
                    : `${curso.cupos_totales || 'N/A'} cupos`}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
