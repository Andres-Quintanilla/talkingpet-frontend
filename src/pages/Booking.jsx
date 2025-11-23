// src/pages/Booking.jsx
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// Componente hijo para seleccionar ubicación en el mapa
function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(
    value || { lat: -17.7833, lng: -63.1821 }
  );

  const map = useMapEvents({
    click(e) {
      const next = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(next);
      onChange(next);
    },
  });

  useEffect(() => {
    if (value && value.lat && value.lng) {
      setPosition(value);
      map.setView([value.lat, value.lng], map.getZoom());
    }
  }, [value, map]);

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { add } = useCart();

  const preselectedServiceId = location.state?.servicioId || null;

  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingPets, setLoadingPets] = useState(true);
  const [error, setError] = useState('');

  // Estado del formulario
  const [serviceId, setServiceId] = useState(preselectedServiceId);
  const [petSelections, setPetSelections] = useState([{ idMascota: '' }]);
  const [modalidad, setModalidad] = useState('local');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [comentarios, setComentarios] = useState('');

  // Dirección / ubicación
  const [direccionReferencia, setDireccionReferencia] = useState('');
  const [numeroCasa, setNumeroCasa] = useState('');
  const [manzano, setManzano] = useState('');
  const [ubicacion, setUbicacion] = useState(null);
  const [locating, setLocating] = useState(false);

  // Dirección guardada
  const [savedAddress, setSavedAddress] = useState(null);
  const [addressMode, setAddressMode] = useState('new'); // 'saved' | 'new'

  // Disponibilidad (demo)
  const [availability, setAvailability] = useState({
    slots: [],
  });

  // === Cargar servicios ===
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const { data } = await api.get('/api/services', {
          params: { _ts: Date.now() },
        });
        const items = Array.isArray(data) ? data : [];
        setServices(items);
        if (preselectedServiceId && !serviceId) {
          setServiceId(preselectedServiceId);
        }
      } catch (err) {
        console.error('Error cargando servicios:', err);
        setError('No se pudo cargar la lista de servicios.');
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, [preselectedServiceId, serviceId]);

  // === Cargar mascotas del usuario ===
  useEffect(() => {
    const loadPets = async () => {
      try {
        setLoadingPets(true);
        const { data } = await api.get('/api/medical/mis-mascotas', {
          params: { _ts: Date.now() },
        });
        setPets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando mascotas:', err);
        setError('No se pudieron cargar tus mascotas.');
      } finally {
        setLoadingPets(false);
      }
    };
    loadPets();
  }, []);

  // === Cargar dirección guardada del cliente (si existe) ===
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const { data } = await api.get('/api/customers/service-address', {
          params: { _ts: Date.now() },
        });
        if (data) {
          setSavedAddress(data);
          setAddressMode('saved');

          setDireccionReferencia(data.referencia || '');
          setNumeroCasa(data.numero_casa || '');
          setManzano(data.manzano || '');
          if (data.lat && data.lng) {
            setUbicacion({
              lat: Number(data.lat),
              lng: Number(data.lng),
            });
          }
        }
      } catch (err) {
        if (err?.response?.status !== 404) {
          console.error('Error cargando dirección guardada:', err);
        }
      }
    };
    loadSavedAddress();
  }, []);

  // === Disponibilidad horaria demo ===
  useEffect(() => {
    const loadAvailability = async () => {
      if (!serviceId) return;
      try {
        const demoSlots = [];
        const startHour = 9;
        const endHour = 17;
        for (let h = startHour; h <= endHour; h++) {
          ['00', '30'].forEach((min) => {
            const label = `${String(h).padStart(2, '0')}:${min}`;
            const noDisponiblesDemo = ['12:00', '12:30', '15:30'];
            const disponible = !noDisponiblesDemo.includes(label);
            demoSlots.push({ hora: label, disponible });
          });
        }
        setAvailability({ slots: demoSlots });
      } catch (err) {
        console.error('Error cargando disponibilidad:', err);
      }
    };
    loadAvailability();
  }, [serviceId]);

  const selectedService = useMemo(
    () => services.find((s) => String(s.id) === String(serviceId)),
    [services, serviceId]
  );

  const availablePets = pets;

  const selectedPetIds = useMemo(
    () =>
      petSelections
        .map((ps) => (ps.idMascota ? String(ps.idMascota) : null))
        .filter(Boolean),
    [petSelections]
  );

  const canSubmit = useMemo(() => {
    const validPets = petSelections.some((ps) => ps.idMascota);
    const necesitaDireccion = modalidad !== 'local';
    const direccionOK = !necesitaDireccion
      ? true
      : direccionReferencia && ubicacion;

    return !!(
      selectedService &&
      validPets &&
      fecha &&
      hora &&
      direccionOK
    );
  }, [selectedService, petSelections, fecha, hora, modalidad, ubicacion, direccionReferencia]);

  const handlePetChange = (index, value) => {
    setPetSelections((prev) => {
      const copy = [...prev];
      copy[index] = { idMascota: value };
      return copy;
    });
  };

  const addAnotherPet = () => {
    setPetSelections((prev) => [...prev, { idMascota: '' }]);
  };

  const removePetSelection = (index) => {
    setPetSelections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUseCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUbicacion(next);
        setLocating(false);
      },
      (err) => {
        console.error('Error obteniendo ubicación:', err);
        alert('No se pudo obtener tu ubicación. Revisa los permisos del navegador.');
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleAddressModeChange = (mode) => {
    setAddressMode(mode);
    if (mode === 'saved' && savedAddress) {
      setDireccionReferencia(savedAddress.referencia || '');
      setNumeroCasa(savedAddress.numero_casa || '');
      setManzano(savedAddress.manzano || '');
      if (savedAddress.lat && savedAddress.lng) {
        setUbicacion({
          lat: Number(savedAddress.lat),
          lng: Number(savedAddress.lng),
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    const mascotasSeleccionadas = petSelections
      .map((ps) => pets.find((p) => String(p.id) === String(ps.idMascota)))
      .filter(Boolean);

    if (mascotasSeleccionadas.length === 0) {
      setError('Debes seleccionar al menos una mascota.');
      return;
    }

    const basePrecio = Number(selectedService?.precio_base || 0);
    const totalServicio = basePrecio * mascotasSeleccionadas.length;

    // Guardar/actualizar dirección habitual si no es en local
    if (modalidad !== 'local') {
      try {
        await api.post('/api/customers/service-address', {
          referencia: direccionReferencia,
          numero_casa: numeroCasa || null,
          manzano: manzano || null,
          lat: ubicacion?.lat || null,
          lng: ubicacion?.lng || null,
        });
      } catch (err) {
        console.error('No se pudo guardar la dirección del cliente:', err);
      }
    }

    // ==== AQUÍ ES DONDE MANDAMOS LA IMAGEN AL CARRITO ====
    const cartItem = {
      id: `svc-${selectedService.id}-${Date.now()}`,
      tipo_item: 'servicio',
      servicio_id: selectedService.id,
      nombre: `Servicio: ${selectedService.nombre}`,
      descripcion: `Modalidad: ${modalidad}. Mascotas: ${mascotasSeleccionadas
        .map((m) => m.nombre)
        .join(', ')}. Fecha: ${fecha} Hora: ${hora}.`,
      precio: totalServicio,

      // 👇 imagen del servicio para que el carrito la muestre
      // usa la columna imagen_url de la tabla "servicio"
      imagen_url:
        selectedService.imagen_url ||
        '/static/services/servicio-generico.png', // pon aquí tu imagen por defecto

      detalle_servicio: {
        servicio: {
          id: selectedService.id,
          nombre: selectedService.nombre,
          tipo: selectedService.tipo,
        },
        mascotas: mascotasSeleccionadas.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          especie: m.especie,
        })),
        modalidad,
        fecha,
        hora,
        comentarios,
        direccion: {
          referencia: direccionReferencia || null,
          numero_casa: numeroCasa || null,
          manzano: manzano || null,
          lat: ubicacion?.lat || null,
          lng: ubicacion?.lng || null,
        },
      },
    };

    add(cartItem, 1);
    navigate('/carrito');
  };

  return (
    <>
      <SEO
        title="Agendar servicio - TalkingPet"
        description="Agenda servicios de baño, peluquería, veterinaria o adiestramiento para tu mascota."
        url="http://localhost:5173/agendar"
      />

      <main className="main">
        <section className="booking-section">
          <div className="container">
            <div className="booking-layout">
              {/* ===== FORMULARIO PRINCIPAL ===== */}
              <div className="booking-form-wrapper">
                <h1 className="booking-form__title">Agendar Servicio</h1>
                <p className="booking-form__subtitle">
                  Elige el servicio, tu(s) mascota(s), modalidad y horario. Luego lo
                  añadiremos a tu carrito para que completes el pago junto con
                  productos y cursos.
                </p>

                {error && <p className="form-error">{error}</p>}

                <form className="booking-form" onSubmit={handleSubmit}>
                  {/* Servicio */}
                  <fieldset className="form-fieldset">
                    <legend className="form-fieldset__legend">1. Servicio</legend>

                    {loadingServices ? (
                      <div className="loading-state" style={{ minHeight: 'unset' }}>
                        <div className="spinner"></div>
                        <p>Cargando servicios...</p>
                      </div>
                    ) : services.length === 0 ? (
                      <p className="form-note">
                        No hay servicios configurados en este momento.
                      </p>
                    ) : (
                      <div className="form-group">
                        <label className="form-label" htmlFor="servicio">
                          Servicio *
                        </label>
                        <select
                          id="servicio"
                          className="form-input form-input--select"
                          value={serviceId || ''}
                          onChange={(e) => setServiceId(e.target.value || null)}
                          required
                        >
                          <option value="">Selecciona un servicio</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nombre} —{' '}
                              {formatCurrency(Number(s.precio_base || 0))}
                            </option>
                          ))}
                        </select>
                        {selectedService && (
                          <p className="form-note">
                            Precio base:{' '}
                            {formatCurrency(
                              Number(selectedService.precio_base || 0)
                            )}{' '}
                            por mascota.
                          </p>
                        )}
                      </div>
                    )}
                  </fieldset>

                  {/* Mascotas */}
                  <fieldset className="form-fieldset">
                    <legend className="form-fieldset__legend">2. Mascota(s)</legend>

                    {loadingPets ? (
                      <div className="loading-state" style={{ minHeight: 'unset' }}>
                        <div className="spinner"></div>
                        <p>Cargando tus mascotas...</p>
                      </div>
                    ) : availablePets.length === 0 ? (
                      <>
                        <p className="form-note">
                          Aún no tienes mascotas registradas. Es necesario registrar
                          al menos una para agendar un servicio.
                        </p>
                        <Link to="/mis-mascotas" className="btn btn--primary">
                          Agregar mascota
                        </Link>
                      </>
                    ) : (
                      <>
                        {petSelections.map((ps, index) => {
                          const currentId = ps.idMascota
                            ? String(ps.idMascota)
                            : null;
                          const optionsForSelect = availablePets.filter(
                            (m) =>
                              !selectedPetIds.includes(String(m.id)) ||
                              String(m.id) === currentId
                          );

                          return (
                            <div className="form-row" key={index}>
                              <div className="form-group" style={{ flex: 1 }}>
                                <label
                                  className="form-label"
                                  htmlFor={`mascota-${index}`}
                                >
                                  Mascota {index + 1} *
                                </label>
                                <select
                                  id={`mascota-${index}`}
                                  className="form-input form-input--select"
                                  value={ps.idMascota}
                                  onChange={(e) =>
                                    handlePetChange(index, e.target.value)
                                  }
                                  required
                                >
                                  <option value="">Selecciona una mascota</option>
                                  {optionsForSelect.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.nombre} ({m.especie})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {petSelections.length > 1 && (
                                <div
                                  className="form-group"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    maxWidth: '120px',
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="btn btn--outline-danger btn--sm"
                                    onClick={() => removePetSelection(index)}
                                  >
                                    Quitar
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={addAnotherPet}
                          style={{ marginTop: '0.5rem' }}
                        >
                          + Añadir otra mascota al servicio
                        </button>

                        <p className="form-note" style={{ marginTop: '0.5rem' }}>
                          Si quieres añadir una nueva mascota, puedes hacerlo en{' '}
                          <Link to="/mis-mascotas">Mis Mascotas</Link>.
                        </p>
                      </>
                    )}
                  </fieldset>

                  {/* Modalidad y ubicación */}
                  <fieldset className="form-fieldset">
                    <legend className="form-fieldset__legend">
                      3. Modalidad y ubicación
                    </legend>

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
                          <div>
                            <strong>Atención en local TalkingPet</strong>
                            <p className="form-note">
                              Llevarás a tu mascota a nuestra sucursal.
                            </p>
                          </div>
                        </label>

                        <label className="radio-option">
                          <input
                            type="radio"
                            name="modalidad"
                            value="domicilio"
                            checked={modalidad === 'domicilio'}
                            onChange={(e) => setModalidad(e.target.value)}
                          />
                          <div>
                            <strong>Servicio a domicilio</strong>
                            <p className="form-note">
                              Iremos a tu casa a realizar el servicio.
                            </p>
                          </div>
                        </label>

                        <label className="radio-option">
                          <input
                            type="radio"
                            name="modalidad"
                            value="retiro_entrega"
                            checked={modalidad === 'retiro_entrega'}
                            onChange={(e) => setModalidad(e.target.value)}
                          />
                          <div>
                            <strong>Recojo y entrega</strong>
                            <p className="form-note">
                              Pasaremos a recoger a tu mascota y la devolveremos
                              después del servicio.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {(modalidad === 'domicilio' ||
                      modalidad === 'retiro_entrega') && (
                      <>
                        {savedAddress && (
                          <div className="form-group">
                            <label className="form-label">Ubicación</label>
                            <div className="radio-group">
                              <label className="radio-option">
                                <input
                                  type="radio"
                                  name="addressMode"
                                  value="saved"
                                  checked={addressMode === 'saved'}
                                  onChange={() => handleAddressModeChange('saved')}
                                />
                                <div>
                                  <strong>Usar ubicación guardada</strong>
                                  <p className="form-note">
                                    {savedAddress.referencia ||
                                      'Dirección guardada previamente.'}
                                  </p>
                                </div>
                              </label>
                              <label className="radio-option">
                                <input
                                  type="radio"
                                  name="addressMode"
                                  value="new"
                                  checked={addressMode === 'new'}
                                  onChange={() => handleAddressModeChange('new')}
                                />
                                <div>
                                  <strong>Añadir nueva ubicación</strong>
                                  <p className="form-note">
                                    Podrás actualizar tu dirección habitual.
                                  </p>
                                </div>
                              </label>
                            </div>
                          </div>
                        )}

                        <div className="form-group">
                          <label className="form-label" htmlFor="direccion_ref">
                            Referencia de la dirección *
                          </label>
                          <input
                            id="direccion_ref"
                            className="form-input"
                            placeholder="Ej. Calle 3, casa amarilla, cerca de la plaza..."
                            value={direccionReferencia}
                            onChange={(e) =>
                              setDireccionReferencia(e.target.value)
                            }
                            required
                            disabled={addressMode === 'saved'}
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label" htmlFor="numero_casa">
                              Número de casa
                            </label>
                            <input
                              id="numero_casa"
                              className="form-input"
                              value={numeroCasa}
                              onChange={(e) => setNumeroCasa(e.target.value)}
                              disabled={addressMode === 'saved'}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" htmlFor="manzano">
                              Manzano / Bloque
                            </label>
                            <input
                              id="manzano"
                              className="form-input"
                              value={manzano}
                              onChange={(e) => setManzano(e.target.value)}
                              disabled={addressMode === 'saved'}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Ubicación en el mapa *
                          </label>
                          <p className="form-note">
                            Haz clic en el mapa para marcar el punto donde debemos
                            ir o usa tu ubicación actual.
                          </p>

                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={handleUseCurrentLocation}
                            disabled={locating || addressMode === 'saved'}
                            style={{ marginBottom: '0.75rem' }}
                          >
                            {locating
                              ? 'Obteniendo tu ubicación...'
                              : 'Usar mi ubicación actual'}
                          </button>

                          <div
                            style={{
                              height: 320,
                              borderRadius: 12,
                              overflow: 'hidden',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            <MapContainer
                              center={
                                ubicacion
                                  ? [ubicacion.lat, ubicacion.lng]
                                  : [-17.7833, -63.1821]
                              }
                              zoom={13}
                              style={{ height: '100%', width: '100%' }}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <LocationPicker
                                value={ubicacion}
                                onChange={setUbicacion}
                              />
                            </MapContainer>
                          </div>
                        </div>
                      </>
                    )}
                  </fieldset>

                  {/* Fecha y hora */}
                  <fieldset className="form-fieldset">
                    <legend className="form-fieldset__legend">
                      4. Fecha y hora
                    </legend>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="fecha">
                          Fecha *
                        </label>
                        <input
                          id="fecha"
                          type="date"
                          className="form-input"
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          required
                        />
                        <p className="form-note">
                          En una versión más avanzada, aquí se podrían mostrar en
                          naranja los días con espacio y en gris los sin
                          disponibilidad según la agenda.
                        </p>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Hora *</label>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          {availability.slots.map((slot) => (
                            <button
                              key={slot.hora}
                              type="button"
                              onClick={() =>
                                slot.disponible && setHora(slot.hora)
                              }
                              className="btn btn--sm"
                              style={{
                                borderColor: slot.disponible
                                  ? hora === slot.hora
                                    ? 'var(--color-primary)'
                                    : 'var(--color-accent)'
                                  : 'var(--color-border)',
                                backgroundColor: slot.disponible
                                  ? hora === slot.hora
                                    ? 'var(--color-primary)'
                                    : 'var(--color-bg)'
                                  : 'var(--color-bg-alt)',
                                color: slot.disponible
                                  ? hora === slot.hora
                                    ? 'var(--color-text-inverted)'
                                    : 'var(--color-text)'
                                  : 'var(--color-text-light)',
                                cursor: slot.disponible
                                  ? 'pointer'
                                  : 'not-allowed',
                                opacity: slot.disponible ? 1 : 0.6,
                              }}
                              disabled={!slot.disponible}
                            >
                              {slot.hora}
                            </button>
                          ))}
                        </div>
                        {!hora && (
                          <p className="form-note">
                            Selecciona uno de los horarios disponibles (naranja).
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="comentarios">
                        Comentarios sobre tu mascota (opcional)
                      </label>
                      <textarea
                        id="comentarios"
                        className="form-input"
                        placeholder="Ej. Es nervioso con el ruido, por favor tengan paciencia."
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                      />
                    </div>
                  </fieldset>

                  {/* Acciones */}
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn--primary btn--full"
                      disabled={!canSubmit}
                    >
                      Añadir al carrito
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => navigate(-1)}
                    >
                      Volver
                    </button>
                  </div>
                </form>
              </div>

              {/* ===== SIDEBAR / RESUMEN ===== */}
              <aside className="booking-sidebar">
                <div className="info-box">
                  <h2 className="info-box__title">Resumen de tu cita</h2>
                  <ul className="info-box__list">
                    <li>
                      <strong>Servicio:</strong>{' '}
                      {selectedService ? selectedService.nombre : 'Sin seleccionar'}
                    </li>
                    <li>
                      <strong>Mascotas:</strong>{' '}
                      {petSelections
                        .map((ps) =>
                          pets.find((p) => String(p.id) === String(ps.idMascota))
                        )
                        .filter(Boolean)
                        .map((m) => m.nombre)
                        .join(', ') || 'Sin seleccionar'}
                    </li>
                    <li>
                      <strong>Modalidad:</strong>{' '}
                      {modalidad === 'local'
                        ? 'Atención en local'
                        : modalidad === 'domicilio'
                        ? 'Servicio a domicilio'
                        : 'Recojo y entrega'}
                    </li>
                    <li>
                      <strong>Fecha y hora:</strong>{' '}
                      {fecha && hora ? `${fecha} a las ${hora}` : 'Sin seleccionar'}
                    </li>
                    {selectedService && (
                      <li>
                        <strong>Total estimado:</strong>{' '}
                        {formatCurrency(
                          Number(selectedService.precio_base || 0) *
                            petSelections.filter((ps) => ps.idMascota).length
                        )}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="info-box">
                  <h2 className="info-box__title">¿Cómo se confirma?</h2>
                  <p className="form-note">
                    Este formulario solo arma la cita y la añade a tu carrito. En el
                    carrito podrás:
                  </p>
                  <ul className="info-box__list">
                    <li>Elegir el método de pago (efectivo, QR, etc.).</li>
                    <li>Combinar tu cita con productos y cursos.</li>
                    <li>
                      Una vez procesado el pago, verás tu cita en{' '}
                      <strong>Mis Citas</strong>.
                    </li>
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
