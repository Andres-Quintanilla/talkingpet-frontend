import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';

export default function ResetPassword() {
    const [sp] = useSearchParams();
    const token = sp.get('token') || '';
    const [pwd, setPwd] = useState('');
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        await api.post('/api/auth/reset', { token, nueva: pwd });
        nav('/login');
    };

    return (
        <>
            <SEO title="Restablecer contraseña" description="Crea una nueva contraseña" url="http://localhost:5173/reset" />
            <main className="main">
                <section className="auth-section">
                    <div className="auth-form-wrapper">
                        <h1 className="auth-form__title">Nueva contraseña</h1>
                        <form className="auth-form" onSubmit={submit}>
                            <div className="form-group">
                                <label className="form-label">Contraseña nueva</label>
                                <input className="form-input" type="password" value={pwd} onChange={e => setPwd(e.target.value)} required />
                            </div>
                            <button className="btn btn--primary btn--full">Guardar</button>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}
