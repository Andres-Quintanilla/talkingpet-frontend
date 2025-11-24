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

// Testimonios de clientes
const testimonios = [
    {
        id: 1,
        nombre: "María González",
        comentario: "Excelente servicio a domicilio. Los tapetes de botones son innovadores y mi perro los adora. Además, llegaron puntuales y el precio fue muy razonable.",
        rating: 5,
        servicio: "Baño a Domicilio"
    },
    {
        id: 2,
        nombre: "Carlos Ramírez",
        comentario: "Me encanta que pueda encontrar todo en un solo lugar: alimento, accesorios y agendar la veterinaria. Ahorro mucho tiempo y los productos son de excelente calidad.",
        rating: 5,
        servicio: "Tienda Online"
    },
    {
        id: 3,
        nombre: "Ana Martínez",
        comentario: "El personal está muy bien capacitado. Confío plenamente en sus veterinarios y el adiestramiento que le dieron a mi mascota fue excepcional.",
        rating: 5,
        servicio: "Veterinaria y Adiestramiento"
    },
    {
        id: 4,
        nombre: "Luis Fernández",
        comentario: "Los precios son muy competitivos y la conveniencia de tener todo en una plataforma es increíble. Recomiendo 100% TalkingPet.",
        rating: 5,
        servicio: "Servicios Integrales"
    },
    {
        id: 5,
        nombre: "Patricia Silva",
        comentario: "Me fascina el servicio de peluquería a domicilio. Mi gato siempre queda hermoso y no tengo que salir de casa. ¡Excelente innovación!",
        rating: 5,
        servicio: "Peluquería a Domicilio"
    }
];

export default function Home() {
    const [destacados, setDestacados] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [currentService, setCurrentService] = useState(0);

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
                setServicios(servItems.slice(0, 6));

                const { data: courseData } = await api.get('/api/courses');
                const courseItems = Array.isArray(courseData) ? courseData : [];
                setCursos(courseItems.slice(0, 3));
            } catch (e) {
                console.error('Error cargando datos del Home:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Carrusel de testimonios
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonios.length);
        }, 5000); // Cambiar cada 5 segundos

        return () => clearInterval(interval);
    }, []);

    // Carrusel de servicios
    useEffect(() => {
        const interval = setInterval(() => {
            if (servicios.length > 0) {
                setCurrentService((prev) => (prev + 1) % servicios.length);
            }
        }, 4000); // Cambiar cada 4 segundos

        return () => clearInterval(interval);
    }, [servicios.length]);

    const nextTestimonial = () => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonios.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonios.length) % testimonios.length);
    };

    const nextService = () => {
        setCurrentService((prev) => (prev + 1) % servicios.length);
    };

    const prevService = () => {
        setCurrentService((prev) => (prev - 1 + servicios.length) % servicios.length);
    };

    const visibleTestimonials = [
        testimonios[currentTestimonial],
        testimonios[(currentTestimonial + 1) % testimonios.length],
        testimonios[(currentTestimonial + 2) % testimonios.length]
    ];

    const visibleServices = servicios.length > 0 ? [
        servicios[currentService],
        servicios[(currentService + 1) % servicios.length],
        servicios[(currentService + 2) % servicios.length]
    ] : [];

    return (
        <>
            <SEO
                title="Bienvenido a TalkingPet - Todo para tu Mascota"
                description="Encuentra todo lo que necesitas para tu mascota en un solo lugar: productos de calidad, servicios profesionales y el mejor trato."
                url="http://localhost:5173/"
            />

            <section className="hero">
                <div className="hero__decorations">
                    <span className="hero__decoration hero__decoration--1">🐾</span>
                    <span className="hero__decoration hero__decoration--2">🐾</span>
                    <span className="hero__decoration hero__decoration--3">🐾</span>
                    <span className="hero__decoration hero__decoration--4">🐾</span>
                </div>
                <div className="hero__content container">
                    <div className="hero__text">
                        <span className="hero__badge">Bienvenido a TalkingPet</span>
                        <h1 className="hero__title">
                            Brindamos <span className="hero__highlight">Veterinaria</span> y el mejor <span className="hero__highlight">Cuidado</span> para tu mejor amigo
                        </h1>
                        <p className="hero__subtitle">
                            Encuentra todo lo que necesitas para la felicidad y salud de tu mascota en un solo lugar.
                        </p>
                        <div className="hero__actions">
                            <Link to="/productos" className="btn btn--primary btn--lg">
                                Tienda Online
                            </Link>
                            <Link to="/servicios" className="btn btn--outline btn--lg">
                                Ver Servicios
                            </Link>
                        </div>
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
                className="services-section"
            >
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Nuestros Expertos</span>
                        <h2 className="section-title">Conoce Nuestros Servicios Profesionales</h2>
                        <p className="section-description">
                            Personal especializado y certificado para el mejor cuidado de tu mascota
                        </p>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                        </div>
                    ) : servicios.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay servicios disponibles en este momento.</p>
                        </div>
                    ) : (
                        <div className="services-carousel">
                            <button 
                                className="carousel-button carousel-button--prev" 
                                onClick={prevService}
                                aria-label="Servicio anterior"
                            >
                                ‹
                            </button>

                            <div className="services-carousel-wrapper">
                                {visibleServices.map((s, index) => {
                                    const icon = serviceIcons[s.tipo] || '🐾';

                                    return (
                                        <article 
                                            key={s.id} 
                                            className={`service-card ${index === 1 ? 'service-card--center' : ''}`}
                                        >
                                            <div className="service-card__image">
                                                {s.imagen_url ? (
                                                    <img
                                                        src={s.imagen_url}
                                                        alt={s.nombre}
                                                        className="service-card__img"
                                                    />
                                                ) : (
                                                    <div className="service-card__icon">
                                                        {icon}
                                                    </div>
                                                )}
                                                <span className="service-card__badge">{s.tipo}</span>
                                            </div>

                                            <div className="service-card__content">
                                                <h3 className="service-card__title">{s.nombre}</h3>
                                                {s.descripcion && (
                                                    <p className="service-card__description">
                                                        {s.descripcion.length > 100 
                                                            ? `${s.descripcion.slice(0, 100)}...` 
                                                            : s.descripcion
                                                        }
                                                    </p>
                                                )}
                                                <div className="service-card__footer">
                                                    {s.precio && (
                                                        <span className="service-card__price">
                                                            {formatCurrency(Number(s.precio))}
                                                        </span>
                                                    )}
                                                    <Link
                                                        to="/agendar"
                                                        className="btn btn--primary btn--sm"
                                                    >
                                                        Agendar Cita
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            <button 
                                className="carousel-button carousel-button--next" 
                                onClick={nextService}
                                aria-label="Siguiente servicio"
                            >
                                ›
                            </button>
                        </div>
                    )}

                    <div className="carousel-indicators">
                        {servicios.map((_, index) => (
                            <button
                                key={index}
                                className={`carousel-indicator ${index === currentService ? 'carousel-indicator--active' : ''}`}
                                onClick={() => setCurrentService(index)}
                                aria-label={`Ir al servicio ${index + 1}`}
                            />
                        ))}
                    </div>

                    <div className="section-cta">
                        <Link to="/servicios" className="btn btn--outline-primary btn--lg">
                            Ver Todos los Servicios
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sección de Propuesta de Valor */}
            <section className="value-proposition-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge section-badge--orange">Nuestra Propuesta</span>
                        <h2 className="section-title">¿Por Qué Elegirnos?</h2>
                        <p className="section-description">
                            Innovación, calidad y conveniencia en un solo lugar
                        </p>
                    </div>

                    <div className="value-grid">
                        <div className="value-card">
                            <div className="value-card__icon">⏰</div>
                            <h3 className="value-card__title">Conveniencia y Ahorro de Tiempo</h3>
                            <p className="value-card__description">
                                Todo lo que necesitas en una sola plataforma: alimento, accesorios, higiene, estética, veterinaria y adiestramiento. Ahorra tiempo y simplifica el cuidado de tu mascota.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-card__icon">🔘</div>
                            <h3 className="value-card__title">Innovación con Tapetes de Botones</h3>
                            <p className="value-card__description">
                                Tecnología de vanguardia para la comunicación con tu mascota. Nuestros tapetes de botones revolucionan la forma en que te conectas con tu mejor amigo.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-card__icon">🏠</div>
                            <h3 className="value-card__title">Servicios a Domicilio</h3>
                            <p className="value-card__description">
                                Baño y peluquería profesional sin salir de casa. Precios competitivos que el mercado acepta, con la comodidad que tú y tu mascota merecen.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-card__icon">🌐</div>
                            <h3 className="value-card__title">Plataforma Unificada</h3>
                            <p className="value-card__description">
                                Integración perfecta entre nuestra tienda física y online. Compra, agenda y gestiona todo desde donde estés, cuando lo necesites.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-card__icon">✅</div>
                            <h3 className="value-card__title">Confianza y Calidad</h3>
                            <p className="value-card__description">
                                Productos certificados de las mejores marcas y personal altamente especializado. Tu mascota merece lo mejor y nosotros lo garantizamos.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-card__icon">💰</div>
                            <h3 className="value-card__title">Precios Competitivos</h3>
                            <p className="value-card__description">
                                Ofertas y promociones constantes. Calidad premium sin comprometer tu presupuesto. ¡Cuida a tu mascota sin gastar de más!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección de Testimonios */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge section-badge--blue">Testimonios</span>
                        <h2 className="section-title">Lo Que Dicen Nuestros Clientes</h2>
                        <p className="section-description">
                            Historias reales de dueños felices y mascotas satisfechas
                        </p>
                    </div>

                    <div className="testimonials-carousel">
                        <button 
                            className="carousel-button carousel-button--prev" 
                            onClick={prevTestimonial}
                            aria-label="Testimonio anterior"
                        >
                            ‹
                        </button>

                        <div className="testimonials-wrapper">
                            {visibleTestimonials.map((testimonio, index) => (
                                <div 
                                    key={testimonio.id} 
                                    className={`testimonial-card ${index === 1 ? 'testimonial-card--center' : ''}`}
                                >
                                    <div className="testimonial-card__stars">
                                        {'⭐'.repeat(testimonio.rating)}
                                    </div>
                                    <p className="testimonial-card__comment">
                                        "{testimonio.comentario}"
                                    </p>
                                    <div className="testimonial-card__author">
                                        <strong>{testimonio.nombre}</strong>
                                        <span className="testimonial-card__service">{testimonio.servicio}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="carousel-button carousel-button--next" 
                            onClick={nextTestimonial}
                            aria-label="Siguiente testimonio"
                        >
                            ›
                        </button>
                    </div>

                    <div className="carousel-indicators">
                        {testimonios.map((_, index) => (
                            <button
                                key={index}
                                className={`carousel-indicator ${index === currentTestimonial ? 'carousel-indicator--active' : ''}`}
                                onClick={() => setCurrentTestimonial(index)}
                                aria-label={`Ir al testimonio ${index + 1}`}
                            />
                        ))}
                    </div>
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
