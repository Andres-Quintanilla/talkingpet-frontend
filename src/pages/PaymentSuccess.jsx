import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('pid');
  const { clear } = useCart(); 

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <>
      <SEO title="Pago Exitoso" noIndex={true} />
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <CheckCircle size={80} color="var(--color-success)" style={{ margin: '0 auto 1.5rem' }} />
        <h1 className="page-header__title">¡Pago Exitoso!</h1>
        <p className="page-header__subtitle" style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
          Tu pago fue procesado correctamente. Hemos recibido tu orden
          {orderId && ` #${orderId}`}.
          <br />
          Recibirás un correo de confirmación pronto.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/mis-pedidos" className="btn btn--primary">
            Ver mis pedidos
          </Link>
          <Link to="/" className="btn btn--outline-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </>
  );
}