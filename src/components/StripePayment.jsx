import { useState } from 'react';
import api from '../api/axios';

export default function StripePayment({ orderId, total, onError }) {
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/payments/stripe/create-session', {
        order_id: orderId,
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        onError('No se pudo crear la sesión de pago');
      }
    } catch (err) {
      console.error('Error al crear sesión de Stripe:', err);
      onError(
        err?.response?.data?.error ||
          'Error al procesar el pago. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-payment-container">
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <h3 className="info-box__title">💳 Pago con Tarjeta</h3>
        <p className="form-note">
          Serás redirigido a la pasarela segura de Stripe para completar tu pago.
        </p>
        <p className="form-note">
          <strong>Total a pagar:</strong> Bs {total.toFixed(2)}
        </p>
      </div>

      <button
        type="button"
        className="btn btn--primary btn--full"
        onClick={handleStripePayment}
        disabled={loading}
      >
        {loading ? 'Procesando...' : 'Pagar con tarjeta'}
      </button>

      <p className="form-note" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        <small>
          Pago seguro procesado por Stripe
        </small>
      </p>
    </div>
  );
}
