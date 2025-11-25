import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export default function QrPayment({ orderId, total, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef(null);

  const handleGenerateQr = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/payments/qr/generate', {
        order_id: orderId,
      });

      setQrData(data);
      startPolling(orderId);
    } catch (err) {
      console.error('Error generando QR:', err);
      onError(
        err?.response?.data?.error ||
          'Error al generar el código QR. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (orderId) => {
    setChecking(true);
    
    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/payments/qr/status/${orderId}`);
        
        if (data.estado === 'pagado') {
          clearInterval(intervalRef.current);
          setChecking(false);
          onSuccess();
        }
      } catch (err) {
        console.error('Error verificando estado:', err);
      }
    }, 5000);
  };

  const handleSimulatePayment = async () => {
    try {
      await api.post('/api/payments/qr/simulate', { order_id: orderId });
      clearInterval(intervalRef.current);
      setChecking(false);
      onSuccess();
    } catch (err) {
      console.error('Error simulando pago:', err);
      onError('Error al simular el pago');
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="qr-payment-container">
      {!qrData ? (
        <div className="info-box" style={{ marginBottom: '1rem' }}>
          <h3 className="info-box__title">📱 Pago con QR</h3>
          <p className="form-note">
            Genera un código QR para pagar con tu aplicación bancaria móvil.
          </p>
          <p className="form-note">
            <strong>Total a pagar:</strong> Bs {total.toFixed(2)}
          </p>
        </div>
      ) : (
        <div className="qr-payment-display">
          <div className="info-box" style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <h3 className="info-box__title">📱 Escanea el código QR</h3>
            <p className="form-note">
              Usa tu aplicación bancaria para escanear y completar el pago
            </p>
            
            <div style={{ 
              margin: '1.5rem auto', 
              padding: '1rem',
              background: 'white',
              borderRadius: '12px',
              display: 'inline-block',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <img 
                src={qrData.qr_image} 
                alt="Código QR de pago" 
                style={{ 
                  display: 'block',
                  width: '300px',
                  height: '300px'
                }}
              />
            </div>

            <div style={{ 
              background: 'var(--color-bg-secondary)', 
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <p className="form-note">
                <strong>Referencia:</strong> {qrData.referencia}
              </p>
              <p className="form-note">
                <strong>Monto:</strong> Bs {Number(qrData.monto).toFixed(2)}
              </p>
              <p className="form-note">
                <strong>Pedido:</strong> #{qrData.order_id}
              </p>
            </div>

            {checking && (
              <div style={{ marginTop: '1.5rem' }}>
                <div className="spinner" style={{ margin: '0 auto 0.5rem' }}></div>
                <p className="form-note">
                  Esperando confirmación del pago...
                </p>
              </div>
            )}

            {import.meta.env.DEV && (
              <button
                type="button"
                className="btn btn--outline-primary"
                onClick={handleSimulatePayment}
                style={{ marginTop: '1rem' }}
              >
                Simular pago (Dev)
              </button>
            )}
          </div>
        </div>
      )}

      {!qrData && (
        <button
          type="button"
          className="btn btn--primary btn--full"
          onClick={handleGenerateQr}
          disabled={loading}
        >
          {loading ? 'Generando QR...' : 'Generar código QR'}
        </button>
      )}

      <p className="form-note" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        <small>
          Pago seguro mediante QR
        </small>
      </p>
    </div>
  );
}
