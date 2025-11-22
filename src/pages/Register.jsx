import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({ nombre: '', email: '', contrasena: '' });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const { register } = useAuth();
    const nav = useNavigate();

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name === 'Username') return setForm((f) => ({ ...f, nombre: value }));
        if (name === 'email') return setForm((f) => ({ ...f, email: value }));
        if (name === 'password') return setForm((f) => ({ ...f, contrasena: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        try {
            await register(form);
            nav('/');
        } catch {
            setMsg('No se pudo registrar. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SEO
                title="Registro - TalkingPet"
                description="Crea tu cuenta para comprar productos, agendar servicios y acceder a cursos en TalkingPet."
                url="http://localhost:5173/registro"
            />

            <main className="main" role="main">
                <section className="auth-section auth-section--full">
                    <div className="auth-form-wrapper">
                        <h1 className="auth-form__title">Crear Cuenta</h1>

                        {msg && <p className="form-error" role="alert">{msg}</p>}

                        <form className="auth-form" onSubmit={onSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="Username" className="form-label">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    id="Username"
                                    name="Username"
                                    className="form-input"
                                    placeholder="Nombre de Usuario"
                                    value={form.nombre}
                                    onChange={onChange}
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="tu@email.com"
                                    value={form.email}
                                    onChange={onChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Crea una contraseña segura"
                                    value={form.contrasena}
                                    onChange={onChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
                                {loading ? 'Creando cuenta…' : 'Registrarme'}
                            </button>
                        </form>

                        <p className="auth-form__link">
                            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
