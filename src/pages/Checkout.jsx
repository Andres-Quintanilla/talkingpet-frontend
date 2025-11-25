import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import StripePayment from '../components/StripePayment';
import QrPayment from '../components/QrPayment';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

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

export default function Checkout() {
  const { items, clear } = useCart();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [metodoPago, setMetodoPago] = useState('saldo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [showStripePayment, setShowStripePayment] = useState(false);

  const [savedAddress, setSavedAddress] = useState(null);
  const [addressMode, setAddressMode] = useState('saved');
  const [shippingMode, setShippingMode] = useState('domicilio'); 

  const [direccionReferencia, setDireccionReferencia] = useState('');
  const [numeroCasa, setNumeroCasa] = useState('');
  const [manzano, setManzano] = useState('');
  const [mapPosition, setMapPosition] = useState(null);
  const [locating, setLocating] = useState(false);

  const [lastOrderCourseIds, setLastOrderCourseIds] = useState([]);

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + (it.precio || 0) * (it.qty || 1), 0),
    [items]
  );

  const tieneProductos = items.some((it) => it.tipo_item === 'producto');
  const tieneServicios = items.some((it) => it.tipo_item === 'servicio');

  const shipping = tieneProductos ? 15 : 0;
  const total = subtotal + shipping;

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
            setMapPosition({
              lat: Number(data.lat),
              lng: Number(data.lng),
            });
          }
        } else {
          setAddressMode('new');
        }
      } catch (error) {
        console.error('Error cargando dirección habitual:', error);
        setAddressMode('new');
      }
    };

    if (tieneProductos) {
      loadSavedAddress();
    }
  }, [tieneProductos]);

  const autoEnrollCourses = async (courseIds) => {
    if (!courseIds || courseIds.length === 0) return;

    for (const rawId of courseIds) {
      const courseId = Number(rawId);
      if (Number.isNaN(courseId)) continue;

      try {
        await api.post(`/api/courses/${courseId}/enroll`);
      } catch (err) {
        console.error('Error auto-inscribiendo al curso', courseId, err);
      }
    }
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
        setMapPosition(next);
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
        setMapPosition({
          lat: Number(savedAddress.lat),
          lng: Number(savedAddress.lng),
        });
      }
    }
    if (mode === 'new') {
      // podrías limpiar si quisieras empezar de cero
      // setDireccionReferencia('');
      // setNumeroCasa('');
      // setManzano('');
      // setMapPosition(null);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (createdOrderId) {
        try {
          await api.post(`/api/orders/${createdOrderId}/mark-paid`);
        } catch (err) {
          console.error('Error marcando pedido como pagado:', err);
        }
      }

      if (lastOrderCourseIds.length > 0) {
        await autoEnrollCourses(lastOrderCourseIds);
      }
    } finally {
      clear();
      navigate('/pago/exitoso', { state: { orderId: createdOrderId } });
    }
  };

  const handlePaymentError = (errorMsg) => {
    setError(errorMsg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Debes iniciar sesión para completar tu pedido.');
      return;
    }

    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    if (tieneProductos && shippingMode === 'domicilio') {
      if (!direccionReferencia.trim()) {
        setError('Por favor indica la referencia de la dirección.');
        return;
      }
      if (!mapPosition) {
        setError('Por favor marca tu ubicación en el mapa o usa tu ubicación actual.');
        return;
      }
    }

    setLoading(true);
    try {
      const normalizedItems = items.map((it) => ({
        id: it.id,
        tipo_item: it.tipo_item || 'producto',
        producto_id:
          it.producto_id || (it.tipo_item === 'producto' ? it.id : null),
        servicio_id: it.servicio_id || null,
        curso_id: it.curso_id || null,
        nombre: it.nombre,
        precio: Number(it.precio || 0),
        qty: Number(it.qty || 1),
        detalle_servicio: it.detalle_servicio || null,
      }));

      let direccionEnvio = null;

      if (tieneProductos) {
        if (shippingMode === 'tienda') {
          direccionEnvio =
            'Recoger en tienda TalkingPet - Calle Ejemplo #123, Santa Cruz';
        } else {
          const partes = [
            direccionReferencia || '',
            numeroCasa ? `Casa Nº ${numeroCasa}` : '',
            manzano ? `Manzano ${manzano}` : '',
          ].filter(Boolean);
          direccionEnvio = partes.join(' - ');

          if (addressMode === 'new') {
            try {
              await api.post('/api/customers/service-address', {
                referencia: direccionReferencia,
                numero_casa: numeroCasa || null,
                manzano: manzano || null,
                lat: mapPosition?.lat || null,
                lng: mapPosition?.lng || null,
              });
            } catch (err) {
              console.error('No se pudo guardar la dirección del cliente:', err);
            }
          }
        }
      }

      const payload = {
        items: normalizedItems,
        subtotal,
        shipping,
        total,
        metodo_pago: metodoPago,
        direccion_envio: direccionEnvio,
      };

      const { data } = await api.post('/api/orders', payload);

      if (metodoPago === 'saldo' && updateUser) {
        try {
          const { data: freshUser } = await api.get('/api/auth/me', {
            params: { _ts: Date.now() },
          });
          if (freshUser) updateUser(freshUser);
        } catch (err) {
          console.error('No se pudo refrescar el usuario tras pagar con saldo', err);
        }
      }

      const courseIds = normalizedItems
        .filter((it) => it.tipo_item === 'curso')
        .map((it) => Number(it.curso_id || it.id))
        .filter((id) => !Number.isNaN(id));

      setLastOrderCourseIds(courseIds);

      if (metodoPago === 'tarjeta' || metodoPago === 'qr') {
        setCreatedOrderId(data?.id);
        setShowStripePayment(metodoPago === 'tarjeta');
        return;
      }

      if (courseIds.length > 0) {
        await autoEnrollCourses(courseIds);
      }

      clear();
      navigate('/mis-pedidos', { state: { orderId: data?.id } });
    } catch (err) {
      console.error('Error creando pedido:', err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Ocurrió un error al procesar tu pedido. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Checkout - TalkingPet"
        description="Completa tu pedido de productos, servicios y cursos para tu mascota."
        url="http://localhost:5173/checkout"
      />

      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">Finalizar compra</h1>
        </div>
      </div>

      <section className="checkout-section">
        <div className="container checkout-layout">
          <div className="checkout-main">
            {error && <p className="form-error">{error}</p>}

            <form onSubmit={handleSubmit} className="checkout-form">
              <fieldset className="form-fieldset">
                <legend className="form-fieldset__legend">
                  1. Resumen de carrito
                </legend>

                {items.length === 0 ? (
                  <p className="form-note">
                    Tu carrito está vacío.{' '}
                    <Link to="/productos" className="breadcrumb__link">
                      Ver productos
                    </Link>
                  </p>
                ) : (
                  <ul className="checkout-items-list">
                    {items.map((it) => (
                      <li key={it.id} className="checkout-item">
                        <div className="checkout-item__info">
                          <strong>{it.nombre}</strong>{' '}
                          <span className="tag">
                            {it.tipo_item === 'servicio'
                              ? 'Servicio'
                              : it.tipo_item === 'curso'
                              ? 'Curso'
                              : 'Producto'}
                          </span>

                          {it.tipo_item === 'servicio' &&
                            it.detalle_servicio && (
                              <div className="checkout-item__details">
                                <p className="form-note">
                                  <strong>Mascotas:</strong>{' '}
                                  {it.detalle_servicio.mascotas
                                    .map((m) => m.nombre)
                                    .join(', ')}
                                </p>
                                <p className="form-note">
                                  <strong>Modalidad:</strong>{' '}
                                  {it.detalle_servicio.modalidad === 'local'
                                    ? 'Atención en local'
                                    : it.detalle_servicio.modalidad ===
                                      'domicilio'
                                    ? 'Servicio a domicilio'
                                    : 'Recojo y entrega'}
                                </p>
                                <p className="form-note">
                                  <strong>Fecha y hora:</strong>{' '}
                                  {it.detalle_servicio.fecha} a las{' '}
                                  {it.detalle_servicio.hora}
                                </p>
                              </div>
                            )}
                        </div>

                        <div className="checkout-item__price">
                          {formatCurrency((it.precio || 0) * (it.qty || 1))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </fieldset>

              {tieneProductos && (
                <fieldset className="form-fieldset">
                  <legend className="form-fieldset__legend">
                    2. Dirección de envío
                  </legend>

                  <div className="form-group">
                    <label className="form-label">Forma de entrega</label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="shippingMode"
                          value="domicilio"
                          checked={shippingMode === 'domicilio'}
                          onChange={() => setShippingMode('domicilio')}
                        />
                        <div>
                          <strong>Entrega a domicilio</strong>
                          <p className="form-note">
                            Usaremos tu ubicación guardada o una nueva dirección.
                          </p>
                        </div>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="shippingMode"
                          value="tienda"
                          checked={shippingMode === 'tienda'}
                          onChange={() => setShippingMode('tienda')}
                        />
                        <div>
                          <strong>Recoger en tienda TalkingPet</strong>
                          <p className="form-note">
                            No necesitamos tu ubicación, recogerás tu pedido en el
                            local.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {shippingMode === 'tienda' ? (
                    <div className="info-box">
                      <h3 className="info-box__title">
                        Dirección del local TalkingPet
                      </h3>
                      <p className="form-note">
                        Calle Ejemplo #123, Barrio Central, Santa Cruz.
                        (Cambia este texto por la dirección real de tu tienda).
                      </p>
                      <p className="form-note">
                        Te avisaremos por WhatsApp cuando tu pedido esté listo
                        para recoger.
                      </p>
                    </div>
                  ) : (
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
                          onChange={(e) => setDireccionReferencia(e.target.value)}
                          required={shippingMode === 'domicilio'}
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
                            height: 260,
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          <MapContainer
                            center={
                              mapPosition
                                ? [mapPosition.lat, mapPosition.lng]
                                : [-17.7833, -63.1821]
                            }
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationPicker
                              value={mapPosition}
                              onChange={setMapPosition}
                            />
                          </MapContainer>
                        </div>
                      </div>
                    </>
                  )}
                </fieldset>
              )}

              <fieldset className="form-fieldset">
                <legend className="form-fieldset__legend">
                  3. Método de pago
                </legend>

                <div className="form-group">
                  <label className="form-label">Método de pago</label>
                  <select
                    className="form-input form-input--select"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    <option value="saldo">
                      Saldo en cuenta (B/. {Number(user?.saldo || 0).toFixed(2)})
                    </option>
                    <option value="qr">QR en Bs</option>
                    <option value="tarjeta">Tarjeta (demo)</option>
                  </select>
                </div>

                {metodoPago === 'tarjeta' &&
                  showStripePayment &&
                  createdOrderId && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <StripePayment
                        orderId={createdOrderId}
                        total={total}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  )}

                {metodoPago === 'qr' && createdOrderId && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <QrPayment
                      orderId={createdOrderId}
                      total={total}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                )}

                {tieneServicios && (
                  <p className="form-note">
                    Para servicios, la confirmación final se realizará por
                    WhatsApp o llamada, según la agenda del local.
                  </p>
                )}
              </fieldset>

              <div className="form-actions">
                {!createdOrderId && (
                  <button
                    type="submit"
                    className="btn btn--primary btn--full"
                    disabled={loading || items.length === 0}
                  >
                    {loading
                      ? 'Procesando...'
                      : metodoPago === 'tarjeta'
                      ? 'Continuar al pago con tarjeta'
                      : metodoPago === 'qr'
                      ? 'Continuar al pago con QR'
                      : 'Confirmar pedido'}
                  </button>
                )}

                <Link to="/carrito" className="btn btn--secondary">
                  Volver al carrito
                </Link>
              </div>
            </form>
          </div>

          <aside className="checkout-summary">
            <h2 className="cart-summary__title">Resumen del Pedido</h2>

            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="cart-summary__row">
              <span>Envío</span>
              <span>{formatCurrency(shipping)}</span>
            </div>

            <div className="cart-summary__total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
