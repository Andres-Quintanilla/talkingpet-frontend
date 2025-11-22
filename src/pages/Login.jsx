import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [emailOrUser, setEmailOrUser] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const returnTo = loc.state?.returnTo || '/';

    const submit = async (e) => {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        try {
            await login({ email: emailOrUser, nombre: emailOrUser, contrasena });
            nav(returnTo, { replace: true });
        } catch {
            setMsg('Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SEO title="Ingresar" description="Accede a tu cuenta TalkingPet" url="http://localhost:5173/login" />
            <main className="main" role="main">
                <section className="auth-section auth-section--full">
                    <div className="auth-form-wrapper">
                        <h1 className="auth-form__title">Iniciar Sesión</h1>

                        {msg && <p className="form-error" role="alert">{msg}</p>}

                        <form className="auth-form" onSubmit={submit} noValidate>
                            <div className="form-group">
                                <label className="form-label" htmlFor="loginUser">Correo o Usuario</label>
                                <input
                                    id="loginUser"
                                    className="form-input"
                                    value={emailOrUser}
                                    onChange={(e) => setEmailOrUser(e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="tu@email.com o tuUsuario"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="loginPass">Contraseña</label>
                                <input
                                    id="loginPass"
                                    className="form-input"
                                    type="password"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="Contraseña"
                                />
                            </div>

                            <button className="btn btn--primary btn--full" disabled={loading}>
                                {loading ? 'Ingresando…' : 'Ingresar'}
                            </button>
                        </form>

                        <div className="auth-form__link">
                            ¿Olvidaste tu contraseña? <Link to="/forgot">Recuperar</Link>
                        </div>
                        <p className="auth-form__link">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
                    </div>
                </section>
            </main>
        </>
    );
}
