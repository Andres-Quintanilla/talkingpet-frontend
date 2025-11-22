import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <>
      <SEO title="Pago Cancelado" noIndex={true} />
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <XCircle size={80} color="var(--color-danger)" style={{ margin: '0 auto 1.5rem' }} />
        <h1 className="page-header__title">Pago Cancelado</h1>
        <p className="page-header__subtitle" style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
          Tu pago fue cancelado o no se pudo procesar.
          <br />
          Tu carrito sigue guardado por si quieres intentarlo de nuevo.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/carrito" className="btn btn--primary">
            Volver al carrito
          </Link>
          <Link to="/" className="btn btn--outline-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </>
  );
}