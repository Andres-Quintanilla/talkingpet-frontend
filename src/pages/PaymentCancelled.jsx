// src/pages/PaymentCancelled.jsx
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function PaymentCancelled() {
  return (
    <>
      <SEO
        title="Pago Cancelado - TalkingPet"
        description="El pago ha sido cancelado"
        url="http://localhost:5173/pago/cancelado"
      />

      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">Pago Cancelado</h1>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div className="info-box" style={{ marginBottom: '2rem' }}>
            <h2 className="info-box__title">❌ El pago fue cancelado</h2>
            <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>
              No se ha realizado ningún cargo. Puedes intentar nuevamente cuando estés listo.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/checkout" className="btn btn--primary">
              Volver al checkout
            </Link>
            <Link to="/carrito" className="btn btn--secondary">
              Ver carrito
            </Link>
            <Link to="/" className="btn btn--secondary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
