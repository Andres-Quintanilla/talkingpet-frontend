import { useEffect, useState } from 'react';
import api from '../../api/axios';

const EMPTY_FORM = {
    id: null,
    peso_kg: '',
    castrado: false,
    vacunas: '',
    proxima_vacuna_fecha: '',
    notas: '',
};

export default function EmployeeMedical() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await api.get('/api/medical/records', {
                    params: { _ts: Date.now() },
                });
                setRecords(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error cargando historiales', err);
                setError('No se pudieron cargar los historiales médicos.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleSelect = (rec) => {
        setSelected(rec);
        setForm({
            id: rec.id,
            peso_kg: rec.peso_kg ?? '',
            castrado: !!rec.castrado,
            vacunas: rec.vacunas || '',
            proxima_vacuna_fecha: rec.proxima_vacuna_fecha || '',
            notas: rec.notas || '',
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.id) return;

        setSaving(true);
        try {
            const { data: updated } = await api.patch(
                `/api/medical/records/${form.id}`,
                {
                    peso_kg: form.peso_kg ? Number(form.peso_kg) : null,
                    castrado: !!form.castrado,
                    vacunas: form.vacunas || '',
                    proxima_vacuna_fecha: form.proxima_vacuna_fecha || null,
                    notas: form.notas || '',
                }
            );

            setRecords((prev) =>
                prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
            );
            setSelected((prev) => (prev && prev.id === updated.id ? updated : prev));
            alert('Historial actualizado correctamente.');
        } catch (err) {
            console.error('Error guardando historial', err);
            alert(
                err.response?.data?.error ||
                'No se pudo guardar el historial médico.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <header className="admin-main__header admin-header">
                <div>
                    <h1 className="admin-main__title">Historial Médico</h1>
                    <p className="admin-main__subtitle">
                        Edita información clínica relevante de las mascotas: peso, castración, vacunas y próximas citas.
                    </p>
                </div>
            </header>

            {loading && (
                <div className="admin-dashboard__loading">
                    Cargando historiales...
                </div>
            )}
            {error && !loading && (
                <div className="admin-dashboard__error">{error}</div>
            )}

            {!loading && !error && (
                <div className="admin-medical-layout">
                    <section className="admin-table-wrapper admin-medical-list">
                        <h2 className="admin-main__title admin-main__title--sm">
                            Mascotas
                        </h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Mascota</th>
                                    <th>Especie</th>
                                    <th>Raza</th>
                                    <th>Cliente</th>
                                    <th>Peso (kg)</th>
                                    <th>Próx. vacuna</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>No hay registros médicos.</td>
                                    </tr>
                                ) : (
                                    records.map((r) => (
                                        <tr key={r.id}>
                                            <td>{r.mascota_nombre}</td>
                                            <td>{r.mascota_especie || '-'}</td>
                                            <td>{r.mascota_raza || '-'}</td>
                                            <td>{r.cliente_nombre || '-'}</td>
                                            <td>{r.peso_kg ?? '-'}</td>
                                            <td>
                                                {r.proxima_vacuna_fecha
                                                    ? new Date(
                                                        r.proxima_vacuna_fecha
                                                    ).toLocaleDateString('es-BO')
                                                    : '-'}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn--secondary btn--sm"
                                                    onClick={() => handleSelect(r)}
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>

                    <section className="admin-form admin-medical-form">
                        <h2 className="admin-main__title admin-main__title--sm">
                            Detalle médico
                        </h2>

                        {!selected ? (
                            <p>Selecciona una mascota para editar su historial.</p>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <fieldset className="form-fieldset">
                                    <legend className="form-fieldset__legend">
                                        {selected.mascota_nombre} – {selected.cliente_nombre}
                                    </legend>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="peso_kg">
                                                Peso actual (kg)
                                            </label>
                                            <input
                                                id="peso_kg"
                                                name="peso_kg"
                                                type="number"
                                                step="0.1"
                                                className="form-input"
                                                value={form.peso_kg}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="castrado">
                                                Castrado / Esterilizado
                                            </label>
                                            <label
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginTop: '0.5rem',
                                                }}
                                            >
                                                <input
                                                    id="castrado"
                                                    name="castrado"
                                                    type="checkbox"
                                                    checked={form.castrado}
                                                    onChange={handleChange}
                                                />
                                                <span>{form.castrado ? 'Sí' : 'No'}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="vacunas">
                                                Vacunas aplicadas
                                            </label>
                                            <textarea
                                                id="vacunas"
                                                name="vacunas"
                                                className="form-input"
                                                rows={3}
                                                placeholder="Ej: Rabia (2024-01-10), Sextuple (2024-02-15)..."
                                                value={form.vacunas}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label
                                                className="form-label"
                                                htmlFor="proxima_vacuna_fecha"
                                            >
                                                Fecha próxima vacuna
                                            </label>
                                            <input
                                                id="proxima_vacuna_fecha"
                                                name="proxima_vacuna_fecha"
                                                type="date"
                                                className="form-input"
                                                value={form.proxima_vacuna_fecha || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="notas">
                                                Notas adicionales
                                            </label>
                                            <textarea
                                                id="notas"
                                                name="notas"
                                                className="form-input"
                                                rows={4}
                                                placeholder="Observaciones clínicas, recomendaciones al dueño, etc."
                                                value={form.notas}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </fieldset>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn btn--primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </>
    );
}
