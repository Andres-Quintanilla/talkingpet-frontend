// src/pages/Checkout.jsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export default function Checkout() {
  const { items, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dirección habitual guardada (Booking)
  const [savedAddress, setSavedAddress] = useState(null);
  const [mapPosition, setMapPosition] = useState(null);

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + (it.precio || 0) * (it.qty || 1), 0),
    [items]
  );
  const shipping = items.length > 0 ? 15 : 0;
  const total = subtotal + shipping;

  const tieneServicios = items.some((it) => it.tipo_item === 'servicio');
  const tieneProductos = items.some((it) => it.tipo_item === 'producto');
  const soloCursos = items.every((it) => it.tipo_item === 'curso');

  // === Cargar dirección habitual al entrar a Checkout ===
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const { data } = await api.get('/api/customers/service-address', {
          params: { _ts: Date.now() },
        });

        if (data) {
          setSavedAddress(data);

          if (data.lat && data.lng) {
            setMapPosition({
              lat: Number(data.lat),
              lng: Number(data.lng),
            });
          }

          // Texto para el textarea (se puede editar si hay productos)
          const composedLines = [
            data.referencia || '',
            data.numero_casa ? `Casa Nº ${data.numero_casa}` : '',
            data.manzano ? `Manzano ${data.manzano}` : '',
          ].filter(Boolean);

          setDireccionEnvio(composedLines.join(' - '));
        }
      } catch (error) {
        // Si no hay dirección guardada, simplemente no mostramos el mapa
        console.error('Error cargando dirección habitual:', error);
      }
    };

    loadSavedAddress();
  }, []);

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

      const payload = {
        items: normalizedItems,
        subtotal,
        shipping,
        total,
        metodo_pago: metodoPago,
        // si solo son cursos, no guardamos dirección
        direccion_envio: soloCursos ? null : direccionEnvio || null,
      };

      const { data } = await api.post('/api/orders/checkout', payload);

      clear();
      navigate('/mis-pedidos', { state: { orderId: data?.order?.id } });
    } catch (err) {
      console.error('Error creando pedido:', err);
      setError(
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
          {/* Columna izquierda */}
          <div className="checkout-main">
            {error && <p className="form-error">{error}</p>}

            <form onSubmit={handleSubmit} className="checkout-form">
              {/* 1. Resumen de carrito */}
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

                          {/* Datos del servicio igual que en Booking */}
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
                                {it.detalle_servicio.direccion && (
                                  <>
                                    <p className="form-note">
                                      <strong>Referencia:</strong>{' '}
                                      {
                                        it.detalle_servicio.direccion
                                          .referencia
                                      }
                                    </p>
                                    {(it.detalle_servicio.direccion
                                      .numero_casa ||
                                      it.detalle_servicio.direccion.manzano) && (
                                      <p className="form-note">
                                        <strong>Detalle:</strong>{' '}
                                        {[
                                          it.detalle_servicio.direccion
                                            .numero_casa
                                            ? `Casa Nº ${it.detalle_servicio.direccion.numero_casa}`
                                            : '',
                                          it.detalle_servicio.direccion.manzano
                                            ? `Manzano ${it.detalle_servicio.direccion.manzano}`
                                            : '',
                                        ]
                                          .filter(Boolean)
                                          .join(' - ')}
                                      </p>
                                    )}
                                    {it.detalle_servicio.direccion.lat &&
                                      it.detalle_servicio.direccion.lng && (
                                        <p className="form-note">
                                          <strong>Ubicación mapa:</strong>{' '}
                                          (
                                          {
                                            it.detalle_servicio.direccion.lat
                                          }
                                          ,{' '}
                                          {
                                            it.detalle_servicio.direccion.lng
                                          }
                                          )
                                        </p>
                                      )}
                                  </>
                                )}
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

              {/* 2. Dirección de envío + mapa (si NO es solo cursos) */}
              {!soloCursos && (
                <fieldset className="form-fieldset">
                  <legend className="form-fieldset__legend">
                    2. Dirección de envío / servicio
                  </legend>

                  {savedAddress ? (
                    <>
                      <p className="form-note">
                        Esta es la dirección que seleccionaste en el mapa al
                        agendar tu servicio. Revísala antes de confirmar.
                      </p>

                      {/* Mapa solo de lectura para confirmar la ubicación */}
                      {mapPosition && (
                        <div
                          style={{
                            height: 260,
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: '1px solid var(--color-border)',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <MapContainer
                            center={[mapPosition.lat, mapPosition.lng]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                            dragging={false}
                            zoomControl={false}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker
                              position={[mapPosition.lat, mapPosition.lng]}
                            />
                          </MapContainer>
                        </div>
                      )}

                      <div className="info-box" style={{ marginBottom: '1rem' }}>
                        <h3 className="info-box__title">Detalle de dirección</h3>
                        <ul className="info-box__list">
                          <li>
                            <strong>Referencia:</strong>{' '}
                            {savedAddress.referencia}
                          </li>
                          {savedAddress.numero_casa && (
                            <li>
                              <strong>Número de casa:</strong>{' '}
                              {savedAddress.numero_casa}
                            </li>
                          )}
                          {savedAddress.manzano && (
                            <li>
                              <strong>Manzano / Bloque:</strong>{' '}
                              {savedAddress.manzano}
                            </li>
                          )}
                          {savedAddress.lat && savedAddress.lng && (
                            <li>
                              <strong>Coordenadas:</strong> ({savedAddress.lat},{' '}
                              {savedAddress.lng})
                            </li>
                          )}
                        </ul>
                      </div>

                      {tieneProductos && (
                        <>
                          <p className="form-note">
                            Si también tienes productos físicos, puedes ajustar
                            el texto de envío aquí abajo (por ejemplo, agregar
                            departamento, referencia extra, etc.).
                          </p>
                          <textarea
                            className="form-input"
                            value={direccionEnvio}
                            onChange={(e) => setDireccionEnvio(e.target.value)}
                            placeholder="Ej. Calle 3, casa amarilla..."
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="form-note">
                        No encontramos una dirección habitual guardada. Escribe
                        aquí la dirección para el envío / servicio.
                      </p>
                      <textarea
                        className="form-input"
                        value={direccionEnvio}
                        onChange={(e) => setDireccionEnvio(e.target.value)}
                        placeholder="Ej. Calle 3, casa amarilla..."
                      />
                    </>
                  )}
                </fieldset>
              )}

              {/* 3. Método de pago */}
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
                    <option value="efectivo">Efectivo</option>
                    <option value="qr">QR en Bs</option>
                    <option value="tarjeta">Tarjeta (demo)</option>
                  </select>
                </div>

                {tieneServicios && (
                  <p className="form-note">
                    Para servicios, la confirmación final se realizará por
                    WhatsApp o llamada, según la agenda del local.
                  </p>
                )}
              </fieldset>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn--primary btn--full"
                  disabled={loading || items.length === 0}
                >
                  {loading ? 'Procesando...' : 'Confirmar pedido'}
                </button>

                <Link to="/carrito" className="btn btn--secondary">
                  Volver al carrito
                </Link>
              </div>
            </form>
          </div>

          {/* Columna derecha: resumen */}
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
