import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../utils/format';

const serviceIcons = {
    baño: '🛁',
    peluqueria: '✂️',
    veterinaria: '⚕️',
    adiestramiento: '🎓',
};

const courseIcons = {
    virtual: '💻',
    presencial: '🎓',
};

export default function Home() {
    const [destacados, setDestacados] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [cursos, setCursos] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const { data: prodData } = await api.get(
                    '/api/products?page=1&limit=20'
                );

                const prodItems = Array.isArray(prodData?.items)
                    ? prodData.items
                    : Array.isArray(prodData)
                        ? prodData
                        : [];

                let dest = prodItems.filter(
                    (p) => p.estado === 'publicado' && p.es_destacado
                );

                if (dest.length === 0) {
                    dest = prodItems
                        .filter((p) => p.estado === 'publicado')
                        .slice(0, 4);
                } else {
                    dest = dest.slice(0, 4);
                }

                setDestacados(dest);

                const { data: servData } = await api.get('/api/services');
                const servItems = Array.isArray(servData) ? servData : [];
                setServicios(servItems.slice(0, 4));

                const { data: courseData } = await api.get('/api/courses');
                const courseItems = Array.isArray(courseData) ? courseData : [];
                setCursos(courseItems.slice(0, 3));
            } catch (e) {
                console.error('Error cargando datos del Home:', e);
            }
        })();
    }, []);

    return (
        <>
            <SEO
                title="Bienvenido a TalkingPet - Todo para tu Mascota"
                description="Encuentra todo lo que necesitas para tu mascota en un solo lugar: productos de calidad, servicios profesionales y el mejor trato."
                url="http://localhost:5173/"
            />

            <section className="hero">
                <div className="hero__content container">
                    <h1 className="hero__title">El mejor cuidado para tu mejor amigo</h1>
                    <p className="hero__subtitle">
                        Encuentra todo lo que necesitas para la felicidad y salud de tu
                        mascota.
                    </p>
                    <div className="hero__actions">
                        <Link to="/productos" className="btn btn--primary btn--lg">
                            Ver Productos
                        </Link>
                        <Link to="/servicios" className="btn btn--outline-primary btn--lg">
                            Ver Servicios
                        </Link>
                    </div>
                </div>
            </section>

            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Productos Destacados</h2>
                    </div>

                    {destacados.length === 0 ? (
                        <p>No hay productos destacados disponibles en este momento.</p>
                    ) : (
                        <div className="featured-grid">
                            {destacados.map((p) => (
                                <ProductCard key={p.id} p={p} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section
                className="featured-section"
                style={{ backgroundColor: 'var(--color-bg-alt)' }}
            >
                <div className="container">
                    <h2 className="section-title">Nuestros Servicios</h2>

                    {servicios.length === 0 ? (
                        <p>No hay servicios disponibles en este momento.</p>
                    ) : (
                        <div className="featured-grid">
                            {servicios.map((s) => {
                                const icon = serviceIcons[s.tipo] || '🐾';

                                return (
                                    <article key={s.id} className="product-card">
                                        <div className="product-card__img-wrapper">
                                            {s.imagen_url ? (
                                                <img
                                                    src={s.imagen_url}
                                                    alt={s.nombre}
                                                    className="product-card__img"
                                                />
                                            ) : (
                                                <div
                                                    className="product-card__img"
                                                    aria-hidden
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '3rem',
                                                    }}
                                                >
                                                    {icon}
                                                </div>
                                            )}
                                        </div>

                                        <div className="product-card__body">
                                            <h3 className="product-card__title">{s.nombre}</h3>
                                            {s.descripcion && <p>{s.descripcion}</p>}
                                            <div className="product-card__actions">
                                                <Link
                                                    to="/agendar"
                                                    className="btn btn--accent btn--sm"
                                                >
                                                    Agendar
                                                </Link>
                                                <Link
                                                    to="/servicios"
                                                    className="btn btn--outline-primary btn--sm"
                                                >
                                                    Ver detalle
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="featured-section">
                <div className="container">
                    <h2 className="section-title">Algunos Cursos</h2>

                    {cursos.length === 0 ? (
                        <p>No hay cursos publicados en este momento.</p>
                    ) : (
                        <div className="courses-preview-grid">
                            {cursos.map((c) => {
                                const icon = courseIcons[c.modalidad] || '🎓';
                                const desc =
                                    (c.descripcion || '').length > 140
                                        ? `${c.descripcion.slice(0, 140)}…`
                                        : c.descripcion;
                                const precioLabel =
                                    c.precio != null ? formatCurrency(Number(c.precio)) : 'Gratis';

                                return (
                                    <article key={c.id} className="product-card">
                                        <div className="product-card__img-wrapper">
                                            {c.portada_url ? (
                                                <img
                                                    src={c.portada_url}
                                                    alt={c.titulo}
                                                    className="product-card__img"
                                                />
                                            ) : (
                                                <div
                                                    className="product-card__img"
                                                    aria-hidden
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '3rem',
                                                    }}
                                                >
                                                    {icon}
                                                </div>
                                            )}
                                        </div>

                                        <div className="product-card__body">
                                            <h3 className="product-card__title">{c.titulo}</h3>
                                            {desc && (
                                                <p className="product-card__description">{desc}</p>
                                            )}

                                            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
                                                {precioLabel}
                                            </p>

                                            <div className="product-card__actions">
                                                <Link
                                                    to={`/cursos/${c.id}`}
                                                    className="btn btn--accent btn--sm"
                                                >
                                                    Inscribirse
                                                </Link>
                                                <Link
                                                    to={`/cursos/${c.id}`}
                                                    className="btn btn--outline-primary btn--sm"
                                                >
                                                    Más Información
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
