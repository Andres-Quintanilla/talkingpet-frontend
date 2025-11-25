// src/pages/CourseViewer.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, CheckSquare } from 'lucide-react';

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
      return `${base.replace(/\/$/, '')}${url}`;
    }

    // Si viene "uploads/archivo.mp4" sin slash al inicio
    if (url.startsWith('uploads/')) {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      return `${base.replace(/\/$/, '')}/${url}`;
    }

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

        // Normalizamos el contenido
        let contenido = Array.isArray(cursoData.contenido)
          ? [...cursoData.contenido]
          : [];

        // Si no hay contenido pero sí tenemos trailer_url,
        // creamos un "capítulo" virtual con ese video
        if ((!contenido || contenido.length === 0) && cursoData.trailer_url) {
          contenido = [
            {
              id: 'main-video',
              tipo: 'video',
              titulo: cursoData.titulo || 'Video principal',
              duracion_minutos: cursoData.duracion_minutos || 0,
              url: cursoData.trailer_url,
            },
          ];
        }

        const cursoFinal = { ...cursoData, contenido };
        setCurso(cursoFinal);

        // 3) Elegir contenido inicial
        let initial = null;
        if (cursoFinal.contenido && cursoFinal.contenido.length > 0) {
          const initialId = location.state?.initialContentId;
          if (initialId) {
            initial =
              cursoFinal.contenido.find((x) => x.id === initialId) ||
              cursoFinal.contenido[0];
          } else {
            initial = cursoFinal.contenido[0];
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

  // URL del contenido activo
  const activeUrl = activeContent ? resolveContentUrl(activeContent.url) : '';

  console.log('[CourseViewer] URL de video activa:', activeUrl);

  return (
    <>
      <SEO
        title={`Viendo: ${curso.titulo}`}
        description="Plataforma de estudio TalkingPet"
        noIndex={true}
      />

      <div className="course-viewer-layout">
        {/* Sidebar con capítulos */}
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

        {/* Contenido principal: SOLO el video */}
        <main className="course-viewer-main">
          {activeContent && activeUrl ? (
            <>
              <h1 className="course-viewer-main__title">
                {activeContent.titulo}
              </h1>

              <div className="video-player-wrapper">
                <video
                  src={activeUrl}
                  controls
                  style={{ width: '100%', maxHeight: '70vh', background: 'black' }}
                >
                  <track kind="captions" />
                </video>
              </div>
            </>
          ) : (
            <div className="video-player-wrapper-placeholder">
              <h2>Este contenido no tiene video configurado.</h2>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
