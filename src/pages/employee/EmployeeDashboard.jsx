// src/pages/employee/EmployeeDashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

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

// Normaliza fecha (Date o string) a 'YYYY-MM-DD'
function normalizeDateStr(fecha) {
  if (!fecha) return '';
  if (fecha instanceof Date) {
    return fecha.toISOString().slice(0, 10);
  }
  const s = String(fecha);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

// Construye un Date válido a partir de fecha + hora
function buildDateTime(fecha, hora) {
  if (!fecha || !hora) return null;
  const f = normalizeDateStr(fecha);
  return new Date(`${f}T${hora}`);
}

// Compara si la fecha de la cita es igual a la seleccionada
function isSameDate(fecha, targetStr) {
  if (!fecha || !targetStr) return false;
  return normalizeDateStr(fecha) === targetStr;
}

export default function EmployeeDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // El backend ya filtra por rol (peluquero, vet, adiestrador, etc.)
        const { data } = await api.get('/api/bookings/all', {
          params: { _ts: Date.now() },
        });
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando citas empleado (dashboard)', err);

        if (err.response?.status === 403) {
          setError(
            'No tienes permiso para ver estas citas. Consulta con el administrador.'
          );
        } else if (err.response?.status === 404) {
          setError(
            'Endpoint de citas no encontrado. Verifica la ruta /api/bookings/all en el backend.'
          );
        } else {
          setError('No se pudieron cargar las citas.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // KPIs de HOY (fecha actual)
  const stats = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    let totalHoy = 0;
    let pendientes = 0;
    let confirmadas = 0;

    bookings.forEach((b) => {
      const dt = buildDateTime(b.fecha, b.hora);
      if (!dt || Number.isNaN(dt.getTime())) return;

      if (dt >= startOfDay && dt < endOfDay) {
        totalHoy++;
        if (b.estado === 'pendiente') pendientes++;
        if (b.estado === 'confirmada') confirmadas++;
      }
    });

    return { totalHoy, pendientes, confirmadas };
  }, [bookings]);

  // Citas para la fecha seleccionada en el calendario
  const bookingsByDate = useMemo(() => {
    return bookings
      .filter((b) => isSameDate(b.fecha, selectedDate))
      .sort(
        (a, b2) =>
          (buildDateTime(a.fecha, a.hora)?.getTime() || 0) -
          (buildDateTime(b2.fecha, b2.hora)?.getTime() || 0)
      );
  }, [bookings, selectedDate]);

  return (
    <>
      <header className="admin-main__header admin-header">
        <div>
          <h1 className="admin-main__title">Dashboard empleado</h1>
          <p className="admin-main__subtitle">
            Resumen de tus citas del día y agenda rápida.
          </p>
        </div>
      </header>

      {loading && (
        <div className="admin-dashboard__loading">Cargando datos...</div>
      )}

      {error && !loading && (
        <div className="admin-dashboard__error">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Tarjetas de KPIs */}
          <section className="admin-dashboard__cards">
            <div className="admin-card">
              <h3>Citas de hoy</h3>
              <p className="admin-card__value">{stats.totalHoy}</p>
            </div>
            <div className="admin-card">
              <h3>Pendientes</h3>
              <p className="admin-card__value">{stats.pendientes}</p>
            </div>
            <div className="admin-card">
              <h3>Confirmadas</h3>
              <p className="admin-card__value">{stats.confirmadas}</p>
            </div>
          </section>

          {/* Agenda por fecha */}
          <section className="admin-section">
            <div
              className="admin-main__header"
              style={{ marginBottom: '1rem' }}
            >
              <div>
                <h2 className="admin-main__title admin-main__title--sm">
                  Agenda por fecha
                </h2>
                <p className="admin-main__subtitle">
                  Selecciona un día para ver todas tus citas.
                </p>
              </div>

              <div>
                <label className="form-label" htmlFor="fecha">
                  Fecha
                </label>
                <input
                  id="fecha"
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Servicio</th>
                    <th>Mascota</th>
                    <th>Cliente</th>
                    <th>Modalidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsByDate.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No tienes citas para esta fecha.</td>
                    </tr>
                  ) : (
                    bookingsByDate.map((b) => {
                      const horaLocal = b.hora?.slice(0, 5) || '-';
                      return (
                        <tr key={b.id}>
                          <td>{horaLocal}</td>
                          <td>{b.servicio_nombre}</td>
                          <td>{b.mascota_nombre || '-'}</td>
                          <td>{b.cliente_nombre || '-'}</td>
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
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
