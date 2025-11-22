// src/pages/Checkout.jsx
import { useState } from 'react';
import SEO from '../components/SEO';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/format';



export default function Checkout() {
  const { items, totals, clear: clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [direccion, setDireccion] = useState('');
  const navigate = useNavigate();

  // 1. Pagar con Stripe (Tarjeta)
  const handleStripePay = async () => {
    if (!direccion.trim()) {
      setError('Por favor, ingresa tu dirección de envío.');
      return;
    }
    if (!items.length) {
      setError('Tu carrito está vacío.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Paso 1: Crear la orden
      const { data: orderData } = await api.post('/api/orders/checkout', {
        direccion_envio: direccion,
      });
      const order_id = orderData.order.id;

      // Paso 2: Crear la sesión de pago en Stripe
      // --- CORRECCIÓN ---
      const { data: stripeData } = await api.post(
        '/api/payments/stripe/create-session', // <-- RUTA CORREGIDA
        { order_id }
      );
      // ------------------

      // Paso 3: Redirigir a Stripe
      // La URL de sesión ahora está en stripeData.url (no stripeData.sessionId)
      // Y Stripe (visto en tu log) espera que sea la URL completa.
      // PERO, tu backend controller (payment.controller.js) devuelve { url: session.url }
      // Así que stripeData.url ES la URL de checkout.
      // El código original del backend de stripe.redirectToCheckout espera el ID, no la URL
      // Vamos a asumir que tu backend devuelve el ID.
      
      // --- CORRECCIÓN 2 (Basado en tu backend `payment.controller.js`) ---
      // Tu backend devuelve { url: session.url }, no el ID.
      // ¡Así que no podemos usar redirectToCheckout! Debemos redirigir manualmente.
      
      // await stripe.redirectToCheckout({ sessionId: stripeData.sessionId }); // <- Esto fallará
      
      // Esto es lo correcto para tu backend actual:
      if (stripeData.url) {
           window.location.href = stripeData.url; // Redirige a la página de Stripe
      } else {
           throw new Error("No se recibió URL de Stripe.");
      }
      // ------------------------------------------------------------------
      
    } catch (err) {
      console.error('Error en checkout:', err);
      setError(
        err.response?.data?.error || 'No se pudo procesar el pago.'
      );
      setLoading(false);
    }
  };

  // 2. Pagar con QR (Simulado)
  const handleQrPay = async () => {
    if (!direccion.trim()) {
      setError('Por favor, ingresa tu dirección de envío.');
      return;
    }
    if (!items.length) {
      setError('Tu carrito está vacío.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Paso 1: Crear la orden
      const { data: orderData } = await api.post('/api/orders/checkout', {
        direccion_envio: direccion,
      });
      const order_id = orderData.order.id;

      // Paso 2: Simular el pago QR
      await api.post('/api/payments/simulate/qr', { order_id });
      
      // Paso 3: Redirigir a éxito
      clearCart();
      navigate(`/pago/exitoso?pid=${order_id}`);

    } catch (err) {
      console.error('Error en pago QR:', err);
      setError(
        err.response?.data?.error || 'No se pudo procesar el pago QR.'
      );
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Checkout - TalkingPet"
        description="Completa tu pago de forma segura."
        url="http://localhost:5173/checkout"
      />
      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">💳 Checkout</h1>
        </div>
      </div>

      <section className="checkout-section">
        <div className="container checkout-layout">
          <div className="checkout-form">
            <h2 className="section-subtitle">Completa tu Información</h2>
            
            {error && <p className="form-error">{error}</p>}

            <fieldset className="form-fieldset">
              <legend className="form-fieldset__legend">1. Dirección de Envío</legend>
              <div className="form-group">
                <label htmlFor="direccion" className="form-label">
                  Dirección, Nro. de Casa, y Referencias *
                </label>
                <textarea
                  id="direccion"
                  className="form-input"
                  rows="3"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Av. Banzer, 4to anillo, Condominio Las Palmas II, Casa #25. Portón rojo."
                  required
                />
              </div>
            </fieldset>

            <fieldset className="form-fieldset">
              <legend className="form-fieldset__legend">2. Método de Pago</legend>
              <div className="checkout-payment-methods">
                <button 
                  className="btn btn--primary btn--lg btn--full" 
                  onClick={handleStripePay}
                  disabled={loading || !items.length}
                >
                  {loading ? 'Procesando...' : `Pagar ${totals.totalLabel} con Tarjeta`}
                </button>
                <button 
                  className="btn btn--secondary btn--lg btn--full"
                  onClick={handleQrPay}
                  disabled={loading || !items.length}
                >
                  {loading ? 'Procesando...' : `Pagar ${totals.totalLabel} con QR (Simulado)`}
                </button>
              </div>
            </fieldset>
          </div>

          <aside className="checkout-summary">
            <h3>Resumen de tu compra</h3>
            {items.map((i) => (
              <div key={i.id} className="summary-item">
                <img
                  className="summary-item__image"
                  src={
                    i.imagen_url ||
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' dominant-baseline='middle' text-anchor='middle' font-size='10'%3EProducto%3C/text%3E%3C/svg%3E"
                  }
                  alt={i.nombre}
                />
                <div className="summary-item__details">
                  <span className="summary-item__name">{i.nombre}</span>
                  <span className="summary-item__price">
                    {i.qty} x {formatCurrency(i.precio)}
                  </span>
                </div>
                <span className="summary-item__total">
                  {formatCurrency(i.qty * i.precio)}
                </span>
              </div>
            ))}
            <div className="cart-summary__total">
              <span>Total (Envío inc.)</span>
              <span>{totals.totalLabel > 0 ? formatCurrency(totals.total + 15) : formatCurrency(0)}</span>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}