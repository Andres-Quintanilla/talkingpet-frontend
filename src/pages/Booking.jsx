import { Link, useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const [servicios, setServicios] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [horarios, setHorarios] = useState([]);

  const [servicioId, setServicioId] = useState(location.state?.servicioId || '');
  const [mascotaId, setMascotaId] = useState('');
  const [modalidad, setModalidad] = useState('local');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [comentarios, setComentarios] = useState('');

  const [loadingServicios, setLoadingServicios] = useState(true);
  const [loadingMascotas, setLoadingMascotas] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingServicios(true);
        const { data: srvData } = await api.get('/api/services');
        setServicios(srvData);
      } catch (err) {
        setError('No se pudieron cargar los servicios.', err);
      } finally {
        setLoadingServicios(false);
      }

      try {
        setLoadingMascotas(true);
        const { data: petData } = await api.get('/api/medical/mis-mascotas');
        setMascotas(petData);
        if (petData.length === 1) {
          setMascotaId(petData[0].id);
        }
      } catch (err) {
        setError('No se pudieron cargar tus mascotas.', err);
      } finally {
        setLoadingMascotas(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!fecha || !servicioId) {
      setHorarios([]);
      return;
    }

    const fetchAvailability = async () => {
      setLoadingHorarios(true);
      setHora('');
      try {
        const { data } = await api.get(
          `/api/bookings/availability?fecha=${fecha}&servicio_id=${servicioId}`
        );
        setHorarios(data);
        if (data.length === 0) {
          setError('No hay horarios disponibles para este día. Por favor, elige otra fecha.');
        } else {
          setError('');
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('No se pudo cargar la disponibilidad.');
      } finally {
        setLoadingHorarios(false);
      }
    };

    fetchAvailability();
  }, [fecha, servicioId]);


  const onSubmit = async (e) => {
    e.preventDefault();
    if (!servicioId || !mascotaId || !modalidad || !fecha || !hora) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoadingSubmit(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/bookings', {
        servicio_id: Number(servicioId),
        mascota_id: Number(mascotaId),
        modalidad,
        fecha,
        hora,
        comentarios
      });
      setSuccess('¡Cita agendada! Revisa "Mis Servicios" para ver el estado.');
      setServicioId('');
      setMascotaId('');
      setFecha('');
      setHora('');
      setComentarios('');
      setHorarios([]);
      setTimeout(() => navigate('/mis-citas'), 3000);


    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.error || 'No se pudo agendar la cita.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      <SEO
        title="Agendar Servicio - TalkingPet"
        description="Reserva baño, peluquería, veterinaria o adiestramiento para tu mascota."
        url="http://localhost:5173/agendar"
      />

      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav className="breadcrumb" aria-label="Ruta de navegación">
            <Link to="/" className="breadcrumb__link">Inicio</Link>
            <span className="breadcrumb__separator">/</span>
            <Link to="/servicios" className="breadcrumb__link">Servicios</Link>
            <span className="breadcrumb__separator">/</span>
            <span className="breadcrumb__current">Agendar Servicio</span>
          </nav>
        </div>
      </div>

      <main className="main" role="main">
        <section className="booking-section">
          <div className="container">
            <div className="booking-layout">
              <div className="booking-form-wrapper">
                <h1 className="booking-form__title">Agendar Servicio</h1>
                <p className="booking-form__subtitle">
                  Completa el formulario para reservar tu cita.
                </p>

                <form className="booking-form" onSubmit={onSubmit}>
                  {error && <p className="form-error">{error}</p>}
                  {success && <p className="form-success">{success}</p>}

                  <fieldset className="form-fieldset">
                    <legend className="form-fieldset__legend">1. Tu Mascota</legend>
                    <div className="form-group">
                      <label htmlFor="mascota" className="form-label">
                        ¿Para qué mascota es la cita? *
                      </label>
                      <select
                        id="mascota"
                        name="mascota"
                        className="form-input form-input--select"
                        value={mascotaId}
                        onChange={(e) => setMascotaId(e.target.value)}
                        required
                        disabled={loadingMascotas}
                      >
                        <option value="">
                          {loadingMascotas ? 'Cargando mascotas...' : 'Selecciona tu mascota'}
                        </option>
                        {mascotas.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nombre} ({m.especie})
                          </option>
                        ))}
                      </select>
                      {mascotas.length === 0 && !loadingMascotas && (
                        <p className="form-note">
                          No tienes mascotas registradas.
                          <Link to="/mis-mascotas" className="breadcrumb__link"> Registra una aquí</Link>.
                        </p>
                      )}
                    </div>
                  </fieldset>

                  <fieldset className="form-fieldset">
                    <legend className="form-fieldset__legend">2. Servicio</legend>
                    <div className="form-group">
                      <label htmlFor="servicio" className="form-label">
                        Servicio *
                      </label>
                      <select
                        id="servicio"
                        name="servicio"
                        className="form-input form-input--select"
                        value={servicioId}
                        onChange={(e) => setServicioId(e.target.value)}
                        required
                        disabled={loadingServicios}
                      >
                        <option value="">
                          {loadingServicios ? 'Cargando...' : 'Selecciona un servicio'}
                        </option>
                        {servicios.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre} ({formatCurrency(s.precio_base)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Modalidad *</label>
                      <div className="radio-group">
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="modalidad"
                            value="local"
                            checked={modalidad === 'local'}
                            onChange={(e) => setModalidad(e.target.value)}
                          />
                          <span>En el Local</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="modalidad"
                            value="domicilio"
                            checked={modalidad === 'domicilio'}
                            onChange={(e) => setModalidad(e.target.value)}
                          />
                          <span>A Domicilio</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="modalidad"
                            value="retiro_entrega"
                            checked={modalidad === 'retiro_entrega'}
                            onChange={(e) => setModalidad(e.target.value)}
                          />
                          <span>Recojo y Entrega</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="form-fieldset" disabled={!servicioId}>
                    <legend className="form-fieldset__legend">3. Fecha y Hora</legend>
                    {!servicioId && <p className="form-note">Selecciona un servicio para ver la disponibilidad.</p>}

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="fecha" className="form-label">
                          Fecha *
                        </label>
                        <input
                          type="date"
                          id="fecha"
                          name="fecha"
                          className="form-input"
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          required
                          min={today}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="hora" className="form-label">
                          Hora *
                        </label>
                        <select
                          id="hora"
                          name="hora"
                          className="form-input form-input--select"
                          value={hora}
                          onChange={(e) => setHora(e.target.value)}
                          required
                          disabled={loadingHorarios || horarios.length === 0}
                        >
                          <option value="">
                            {loadingHorarios ? 'Buscando...' : 'Elige un horario'}
                          </option>
                          {horarios.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="form-fieldset">
                    <legend className="form-fieldset__legend">4. Comentarios</legend>
                    <div className="form-group">
                      <label htmlFor="comentarios" className="form-label">
                        ¿Algo que debamos saber?
                      </label>
                      <textarea
                        id="comentarios"
                        name="comentarios"
                        className="form-input form-input--textarea"
                        rows="3"
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                        placeholder="Ej: Mi perro se pone nervioso con la secadora."
                      ></textarea>
                    </div>
                  </fieldset>


                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn--primary btn--lg btn--full"
                      disabled={loadingSubmit || !hora || !mascotaId}
                    >
                      {loadingSubmit ? 'Confirmando...' : '✓ Confirmar Reserva'}
                    </button>
                    <Link
                      to="/servicios"
                      className="btn btn--outline-primary btn--lg btn--full"
                    >
                      ← Volver
                    </Link>
                  </div>
                </form>
              </div>

              <aside className="booking-sidebar">
                <div className="info-box">
                  <h3 className="info-box__title">📋 Información Importante</h3>
                  <ul className="info-box__list">
                    <li>Tu cita quedará "Pendiente" hasta ser confirmada.</li>
                    <li>Recibirás una confirmación por email y WhatsApp.</li>
                    <li>Puedes reagendar con 24h de anticipación.</li>
                    <li>El pago del servicio se realiza en el local o al repartidor.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}