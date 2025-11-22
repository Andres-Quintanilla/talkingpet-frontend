import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

const ESTADO_OPTIONS = [
    'todos',
    'pendiente',
    'confirmada',
    'realizada',
    'cancelada',
    'no_asistio',
];

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

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('todos');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await api.get('/api/bookings/all', {
                    params: { _ts: Date.now() },
                });
                setBookings(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error cargando citas admin', err);
                setError('No se pudieron cargar las citas.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return bookings.filter((b) => {
            const matchEstado =
                estadoFilter === 'todos' || b.estado === estadoFilter;

            const blob = (
                (b.servicio_nombre || '') +
                ' ' +
                (b.mascota_nombre || '') +
                ' ' +
                (b.cliente_nombre || '') +
                ' ' +
                (b.cliente_telefono || '')
            )
                .toLowerCase()
                .includes(term);

            return matchEstado && (!term || blob);
        });
    }, [bookings, search, estadoFilter]);

    const handleChangeStatus = async (booking, newStatus) => {
        if (booking.estado === newStatus) return;

        const ok = window.confirm(
            `¿Seguro que quieres cambiar el estado de la cita #${booking.id} a "${STATUS_LABELS[newStatus] || newStatus}"?`
        );
        if (!ok) return;

        try {
            setSaving(true);
            const { data: updated } = await api.patch(
                `/api/bookings/${booking.id}/status`,
                { estado: newStatus }
            );
            setBookings((prev) =>
                prev.map((b) => (b.id === updated.id ? updated : b))
            );
        } catch (err) {
            console.error('Error actualizando estado de cita', err);
            alert(
                err.response?.data?.error ||
                'No se pudo actualizar el estado de la cita.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <header className="admin-main__header admin-header">
                <div>
                    <h1 className="admin-main__title">Citas</h1>
                    <p className="admin-main__subtitle">
                        Gestión de citas de servicios (baño, peluquería, veterinaria y
                        adiestramiento).
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}
                >
                    <input
                        type="text"
                        placeholder="Buscar por cliente, mascota o servicio..."
                        className="form-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ minWidth: '260px' }}
                    />
                    <select
                        className="form-input form-input--select"
                        value={estadoFilter}
                        onChange={(e) => setEstadoFilter(e.target.value)}
                    >
                        {ESTADO_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt === 'todos'
                                    ? 'Todos los estados'
                                    : STATUS_LABELS[opt] || opt}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            {loading && (
                <div className="admin-dashboard__loading">
                    Cargando citas...
                </div>
            )}

            {error && !loading && (
                <div className="admin-dashboard__error">{error}</div>
            )}

            {!loading && !error && (
                <section className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha / Hora</th>
                                <th>Servicio</th>
                                <th>Mascota</th>
                                <th>Cliente</th>
                                <th>Modalidad</th>
                                <th>Estado</th>
                                <th style={{ width: '220px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>No se encontraron citas.</td>
                                </tr>
                            ) : (
                                filtered.map((b) => {
                                    const dt = buildDateTime(b.fecha, b.hora);
                                    const fechaLocal = b.fecha
                                        ? new Date(b.fecha).toLocaleDateString('es-BO', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })
                                        : '-';
                                    const horaLocal = b.hora?.slice(0, 5) || '-';

                                    return (
                                        <tr key={b.id}>
                                            <td>{b.id}</td>
                                            <td>
                                                <div>{fechaLocal}</div>
                                                <div
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        color: 'var(--color-text-light)',
                                                    }}
                                                >
                                                    {horaLocal}
                                                    {dt && ` (${dt.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })})`}
                                                </div>
                                            </td>
                                            <td>
                                                <div>{b.servicio_nombre}</div>
                                                <div
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        color: 'var(--color-text-light)',
                                                    }}
                                                >
                                                    {b.servicio_tipo}
                                                </div>
                                            </td>
                                            <td>{b.mascota_nombre || '-'}</td>
                                            <td>
                                                <div>{b.cliente_nombre || '-'}</div>
                                                <div
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        color: 'var(--color-text-light)',
                                                    }}
                                                >
                                                    {b.cliente_telefono || ''}
                                                </div>
                                            </td>
                                            <td>{b.modalidad || '-'}</td>
                                            <td>
                                                <span
                                                    className={
                                                        STATUS_CLASS[b.estado] || 'badge badge--neutral'
                                                    }
                                                >
                                                    {STATUS_LABELS[b.estado] || b.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions">
                                                    <select
                                                        className="form-input form-input--select"
                                                        value={b.estado}
                                                        disabled={saving}
                                                        onChange={(e) =>
                                                            handleChangeStatus(b, e.target.value)
                                                        }
                                                    >
                                                        <option value="pendiente">Pendiente</option>
                                                        <option value="confirmada">Confirmada</option>
                                                        <option value="realizada">Realizada</option>
                                                        <option value="cancelada">Cancelada</option>
                                                        <option value="no_asistio">No asistió</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </section>
            )}
        </>
    );
}
