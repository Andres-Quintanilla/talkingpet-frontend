import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, CheckSquare } from 'lucide-react';
import ReactPlayer from 'react-player';

export default function CourseViewer() {
  const { id } = useParams(); 
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeContent, setActiveContent] = useState(null);

  useEffect(() => {
    const fetchCurso = async () => {
      if (!user) {
        navigate('/login', { state: { returnTo: `/cursos/${id}` } });
        return;
      }
      try {
        setLoading(true);

        const { data: misCursos } = await api.get('/api/courses/mine');
        if (!misCursos.some((c) => c.curso_id === Number(id))) {
          setError('No estás inscrito en este curso.');
          setLoading(false);
          return;
        }

        const { data: cursoData } = await api.get(`/api/courses/${id}`);
        setCurso(cursoData);

        let initial = null;
        if (cursoData.contenido && cursoData.contenido.length > 0) {
          const initialId = location.state?.initialContentId;
          if (initialId) {
            initial =
              cursoData.contenido.find((x) => x.id === initialId) ||
              cursoData.contenido[0];
          } else {
            initial = cursoData.contenido[0];
          }
        }
        setActiveContent(initial);

        setError(null);
      } catch (err) {
        console.error('Error fetching curso:', err);
        setError('No se pudo cargar el curso.');
      } finally {
        setLoading(false);
      }
    };
    fetchCurso();
  }, [id, user, navigate, location.state]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando tu curso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h2>Acceso Denegado</h2>
        <p>{error}</p>
        <Link to="/cursos" className="btn btn--primary">
          Ver Cursos
        </Link>
      </div>
    );
  }

  if (!curso) return null;

  return (
    <>
      <SEO
        title={`Viendo: ${curso.titulo}`}
        description="Plataforma de estudio TalkingPet"
        noIndex={true}
      />

      <div className="course-viewer-layout">
        <aside className="course-viewer-sidebar">
          <h2 className="course-viewer-sidebar__title">{curso.titulo}</h2>
          <div className="course-content-list">
            {curso.contenido.map((item) => (
              <button
                key={item.id}
                className={`course-content-item ${
                  activeContent?.id === item.id
                    ? 'course-content-item--active'
                    : ''
                }`}
                onClick={() => setActiveContent(item)}
              >
                <div className="course-content-item__icon">
                  {item.tipo === 'video' ? (
                    <PlayCircle size={20} />
                  ) : (
                    <CheckSquare size={20} />
                  )}
                </div>
                <div className="course-content-item__title">
                  {item.titulo}
                </div>
                <div className="course-content-item__duration">
                  {item.duracion_minutos} min
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="course-viewer-main">
          {activeContent ? (
            <>
              <h1 className="course-viewer-main__title">
                {activeContent.titulo}
              </h1>
              {activeContent.tipo === 'video' ? (
                <div className="video-player-wrapper">
                  <ReactPlayer
                    url={activeContent.url}
                    className="react-player"
                    controls
                    width="100%"
                    height="100%"
                    config={{
                      youtube: {
                        playerVars: { showinfo: 1 },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="video-player-wrapper-placeholder">
                  <p>Contenido tipo "{activeContent.tipo}" (ej. PDF).</p>
                </div>
              )}

              <div className="course-viewer-main__description">
                <p>Descripción del video o material (aún no en BD).</p>
              </div>
            </>
          ) : (
            <div className="video-player-wrapper-placeholder">
              <h2>Selecciona un capítulo</h2>
              <p>Elige un video de la lista para comenzar a aprender.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
