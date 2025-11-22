import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
    const [emailOrUser, setV] = useState('');
    const [pwd, setPwd] = useState('');
    const { login } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const returnTo = loc.state?.returnTo || '/admin';

    const submit = async (e) => {
        e.preventDefault();
        await login({ email: emailOrUser, nombre: emailOrUser, contrasena: pwd });
        nav(returnTo, { replace: true });
    };

    return (
        <>
            <SEO title="Admin Login" description="Acceso administrador" url="http://localhost:5173/admin/login" />
            <main className="main">
                <section className="auth-section auth-section--full">
                    <div className="auth-form-wrapper">
                        <h1 className="auth-form__title">Panel Admin</h1>
                        <form className="auth-form" onSubmit={submit}>
                            <div className="form-group">
                                <label className="form-label">Email o usuario</label>
                                <input className="form-input" value={emailOrUser} onChange={e => setV(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contraseña</label>
                                <input className="form-input" type="password" value={pwd} onChange={e => setPwd(e.target.value)} required />
                            </div>
                            <button className="btn btn--primary btn--full">Entrar</button>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}
