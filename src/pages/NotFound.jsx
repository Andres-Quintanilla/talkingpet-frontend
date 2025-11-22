import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <>
            <SEO title="Página no encontrada" description="La página solicitada no existe." url="http://localhost:5173/404" />
            <section className="hero">
                <div className="container hero__content">
                    <h1 className="hero__title">404</h1>
                    <p className="hero__subtitle">La página no existe.</p>
                    <Link to="/" className="btn btn--primary">Volver al inicio</Link>
                </div>
            </section>
        </>
    );
}
