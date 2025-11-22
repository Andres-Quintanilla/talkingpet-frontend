import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';

const STATUS_LABELS = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
    realizada: 'Realizada',
    no_asistio: 'No asistió',
};

const STATUS_CLASS = {
    pendiente: 'badge badge--warning',
    confirmada: 'badge badge--success',
    realizada: 'badge badge--success',
    cancelada: 'badge badge--danger',
    no_asistio: 'badge badge--neutral',
};

function buildDateTime(fecha, hora) {
    if (!fecha || !hora) return null;
    return new Date(`${fecha}T${hora}`);
}

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await api.get('/api/bookings/mine', {
                    params: { _ts: Date.now() },
                });
                setBookings(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error cargando mis citas', err);
                setError('No se pudieron cargar tus citas.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const { upcoming, past } = useMemo(() => {
        const now = new Date();
        const future = [];
        const previous = [];

        for (const b of bookings) {
            const dt = buildDateTime(b.fecha, b.hora);
            if (!dt || dt >= now) future.push(b);
            else previous.push(b);
        }

        future.sort((a, b) =>
            buildDateTime(a.fecha, a.hora) - buildDateTime(b.fecha, b.hora)
        );
        previous.sort((a, b) =>
            buildDateTime(b.fecha, b.hora) - buildDateTime(a.fecha, a.hora)
        );

        return { upcoming: future, past: previous };
    }, [bookings]);

    return (
        <>
            <SEO
                title="Mis Citas - TalkingPet"
                description="Consulta el estado de tus citas."
                url="http://localhost:5173/mis-citas"
            />

            <main className="main" role="main">
                <section className="page-section">
                    <div className="container">
                        <header className="page-header">
                            <h1 className="page-title">Mis Citas</h1>
                            <p className="page-subtitle">
                                Aquí puedes ver tus reservas de servicios y su estado.
                            </p>
                        </header>

                        {loading && <div className="page-loading">Cargando tus citas...</div>}

                        {error && !loading && <div className="page-error">{error}</div>}

                        {!loading && !error && bookings.length === 0 && (
                            <div className="empty-state">
                                <p>Aún no tienes citas registradas.</p>
                                <Link to="/servicios" className="btn btn--primary">
                                    Reservar un servicio
                                </Link>
                            </div>
                        )}

                        {!loading && !error && bookings.length > 0 && (
                            <div className="bookings-layout">

                                <section className="bookings-section">
                                    <h2 className="bookings-section__title">Próximas citas</h2>
                                    {upcoming.length === 0 ? (
                                        <p className="bookings-section__empty">No tienes citas futuras.</p>
                                    ) : (
                                        <div className="bookings-grid">
                                            {upcoming.map((b) => (
                                                <BookingCard key={b.id} booking={b} />
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <section className="bookings-section">
                                    <h2 className="bookings-section__title">Historial</h2>
                                    {past.length === 0 ? (
                                        <p className="bookings-section__empty">Tu historial está vacío.</p>
                                    ) : (
                                        <div className="bookings-grid">
                                            {past.map((b) => (
                                                <BookingCard key={b.id} booking={b} isPast />
                                            ))}
                                        </div>
                                    )}
                                </section>

                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

function BookingCard({ booking, isPast = false }) {
    const status = booking.estado || 'pendiente';

    const badgeClass = STATUS_CLASS[status] || 'badge badge--neutral';

    const fechaLocal = booking.fecha
        ? new Date(booking.fecha).toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : '-';

    const horaLocal = booking.hora?.slice(0, 5) || '-';

    return (
        <article className={`booking-card ${isPast ? 'booking-card--past' : ''}`}>
            <header className="booking-card__header">
                <div>
                    <h3 className="booking-card__title">
                        {booking.servicio_nombre || 'Servicio'}
                    </h3>
                    <p className="booking-card__subtitle">
                        {booking.mascota_nombre
                            ? `Mascota: ${booking.mascota_nombre}`
                            : 'Sin mascota asociada'}
                    </p>
                </div>
                <span className={badgeClass}>{STATUS_LABELS[status]}</span>
            </header>

            <div className="booking-card__body">
                <div className="booking-card__row">
                    <span>Fecha</span>
                    <strong>{fechaLocal}</strong>
                </div>
                <div className="booking-card__row">
                    <span>Hora</span>
                    <strong>{horaLocal}</strong>
                </div>
                <div className="booking-card__row">
                    <span>Modalidad</span>
                    <strong>{booking.modalidad || '-'}</strong>
                </div>

                {booking.comentarios && (
                    <div className="booking-card__row booking-card__row--comment">
                        <span>Comentarios</span>
                        <p>{booking.comentarios}</p>
                    </div>
                )}
            </div>

            <footer className="booking-card__footer">
                <Link
                    to="/agendar"
                    state={{ servicioId: booking.servicio_id }}
                    className="btn btn--outline-primary btn--sm"
                >
                    Reprogramar
                </Link>
            </footer>
        </article>
    );
}
