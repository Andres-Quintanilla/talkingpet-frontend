// src/pages/CourseViewer.jsx
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

  // Normaliza la URL del contenido para reproducirla
  const resolveContentUrl = (url) => {
    if (!url) return '';

    // Si ya es absoluta (http/https), la usamos tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Si viene algo tipo "/uploads/archivo.mp4"
    if (url.startsWith('/')) {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      return `${base}${url}`;
    }

    // Si viene "uploads/archivo.mp4" sin slash al inicio
    if (url.startsWith('uploads/')) {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      return `${base}/${url}`;
    }

    // Cualquier otro caso raro, lo devolvemos igual
    return url;
  };

  useEffect(() => {
    const fetchCurso = async () => {
      if (!user) {
        navigate('/login', { state: { returnTo: `/mis-cursos/${id}/ver` } });
        return;
      }

      try {
        setLoading(true);
        const numericId = Number(id);

        // 1) Verificar que el usuario esté inscrito en este curso
        const { data: misCursos } = await api.get('/api/courses/mine', {
          params: { _ts: Date.now() },
        });

        const puedeVer = Array.isArray(misCursos)
          ? misCursos.some((c) => {
              const cid = c.curso_id ?? c.id;
              return Number(cid) === numericId;
            })
          : false;

        if (!puedeVer) {
          setError('No estás inscrito en este curso.');
          setLoading(false);
          return;
        }

        // 2) Traer la info completa del curso + contenido
        const { data: cursoData } = await api.get(`/api/courses/${numericId}`);
        setCurso(cursoData);

        // 3) Elegir contenido inicial
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

  // Si hay contenido activo, resolvemos la URL aquí una sola vez
  const activeUrl = activeContent ? resolveContentUrl(activeContent.url) : '';
  const isYouTube =
    activeUrl.includes('youtube.com') || activeUrl.includes('youtu.be');

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
            {curso.contenido && curso.contenido.length > 0 ? (
              curso.contenido.map((item) => (
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
              ))
            ) : (
              <p className="form-note">
                Este curso todavía no tiene contenido cargado.
              </p>
            )}
          </div>
        </aside>

        <main className="course-viewer-main">
          {activeContent ? (
            <>
              <h1 className="course-viewer-main__title">
                {activeContent.titulo}
              </h1>

              {activeContent.tipo === 'video' ? (
                activeUrl ? (
                  <div className="video-player-wrapper">
                    {isYouTube ? (
                      <ReactPlayer
                        url={activeUrl}
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
                    ) : (
                      <video
                        className="react-player"
                        controls
                        style={{ width: '100%', height: '100%' }}
                      >
                        <source src={activeUrl} type="video/mp4" />
                        Tu navegador no soporta la reproducción de este video.
                      </video>
                    )}
                  </div>
                ) : (
                  <div className="video-player-wrapper-placeholder">
                    <p>Este contenido no tiene URL de video configurada.</p>
                  </div>
                )
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
