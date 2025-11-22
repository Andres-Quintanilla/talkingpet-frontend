import { useState } from 'react';
import SEO from '../components/SEO';
import api from '../api/axios';

export default function ForgotPassword() {
    const [emailOrUser, setVal] = useState('');
    const [ok, setOk] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        await api.post('/api/auth/forgot', { emailOrUser });
        setOk(true);
    };

    return (
        <>
            <SEO title="Recuperar contraseña" description="Restablece tu contraseña" url="http://localhost:5173/forgot" />
            <main className="main">
                <section className="auth-section auth-section--full">
                    <div className="auth-form-wrapper">
                        <h1 className="auth-form__title">Recuperar contraseña</h1>
                        {ok ? (
                            <p>Si existe una cuenta, te enviamos instrucciones (en desarrollo: revisa la consola del servidor).</p>
                        ) : (
                            <form className="auth-form" onSubmit={submit}>
                                <div className="form-group">
                                    <label className="form-label">Email o usuario</label>
                                    <input
                                        className="form-input"
                                        value={emailOrUser}
                                        onChange={e => setVal(e.target.value)}
                                        required
                                    />
                                </div>
                                <button className="btn btn--primary btn--full">Enviar</button>
                            </form>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
