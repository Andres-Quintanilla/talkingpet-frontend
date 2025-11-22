import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/format';
import ImageUploader from '../../components/ImageUploader';
import ConfirmModal from '../../components/ConfirmModal';

const EMPTY_FORM = {
    nombre: '',
    tipo: 'baño',
    descripcion: '',
    precio_base: '',
    duracion_minutos: 60,
    imagen_url: '',
};

const TIPO_OPTIONS = [
    { value: 'baño', label: 'Baño y Secado' },
    { value: 'peluqueria', label: 'Peluquería' },
    { value: 'veterinaria', label: 'Consulta Veterinaria' },
    { value: 'adiestramiento', label: 'Adiestramiento' },
];

export default function AdminServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    const loadServices = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { _ts: Date.now() };
            if (search.trim()) {
                params.search = search.trim();
            }
            const res = await api.get('/api/services', { params });
            const items = Array.isArray(res.data) ? res.data : [];
            setServices(items);
        } catch (e) {
            console.error('Error cargando servicios admin', e);
            setError('No se pudieron cargar los servicios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const filteredServices = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return services;
        return services.filter((s) => {
            const nombre = (s.nombre || '').toLowerCase();
            const tipo = (s.tipo || '').toLowerCase();
            return nombre.includes(term) || tipo.includes(term);
        });
    }, [services, search]);

    const handleNew = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setFormError('');
        setShowForm(true);
    };

    const handleEdit = (service) => {
        setForm({
            nombre: service.nombre ?? '',
            tipo: service.tipo ?? 'baño',
            descripcion: service.descripcion ?? '',
            precio_base: service.precio_base ?? '',
            duracion_minutos: service.duracion_minutos ?? 60,
            imagen_url: service.imagen_url ?? '',
        });
        setEditingId(service.id);
        setFormError('');
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFormError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!form.nombre.trim()) {
            return 'El nombre es obligatorio.';
        }
        if (!form.tipo) {
            return 'El tipo de servicio es obligatorio.';
        }
        if (
            form.precio_base === '' ||
            isNaN(Number(form.precio_base)) ||
            Number(form.precio_base) <= 0
        ) {
            return 'El precio base debe ser un número mayor a 0.';
        }
        if (
            form.duracion_minutos === '' ||
            isNaN(Number(form.duracion_minutos)) ||
            Number(form.duracion_minutos) <= 0
        ) {
            return 'La duración debe ser un número mayor a 0.';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const msg = validateForm();
        if (msg) {
            setFormError(msg);
            return;
        }

        setSaving(true);
        setFormError('');

        const payload = {
            nombre: form.nombre.trim(),
            tipo: form.tipo,
            descripcion: form.descripcion.trim() || null,
            precio_base: Number(form.precio_base),
            duracion_minutos: Number(form.duracion_minutos),
            imagen_url: form.imagen_url?.trim() || null,
        };

        try {
            if (editingId) {
                const { data: updated } = await api.put(
                    `/api/services/${editingId}`,
                    payload
                );

                setServices((prev) =>
                    prev.map((s) => (s.id === updated.id ? updated : s))
                );
            } else {
                const { data: created } = await api.post('/api/services', payload);
                setServices((prev) => [created, ...prev]);
            }

            handleCancel();
        } catch (e) {
            console.error('Error guardando servicio', e);
            const msgServer =
                e.response?.data?.error || 'No se pudo guardar el servicio.';
            setFormError(msgServer);

            if (e.response?.status === 401 || e.response?.status === 403) {
                alert(
                    `No tienes permiso para esta acción (status ${e.response.status}). ` +
                    'Vuelve a iniciar sesión como admin.'
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (service) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!serviceToDelete) return;

        try {
            await api.delete(`/api/services/${serviceToDelete.id}`);

            setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
        } catch (e) {
            console.error('Error eliminando servicio', e);
            alert(
                e.response?.data?.error ||
                `No se pudo eliminar el servicio (status ${e.response?.status || '??'
                }).`
            );
        } finally {
            setShowDeleteModal(false);
            setServiceToDelete(null);
        }
    };

    const getTipoLabel = (tipoValue) => {
        const found = TIPO_OPTIONS.find((t) => t.value === tipoValue);
        return found?.label || tipoValue || '-';
    };

    return (
        <>
            <header className="admin-main__header admin-header">
                <div>
                    <h1 className="admin-main__title">Servicios</h1>
                    <p className="admin-main__subtitle">
                        Gestión de servicios de baño, peluquería, veterinaria y
                        adiestramiento.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o tipo..."
                        className="form-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ minWidth: '240px' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                loadServices();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={loadServices}
                    >
                        Buscar
                    </button>
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleNew}
                    >
                        + Nuevo servicio
                    </button>
                </div>
            </header>

            {loading && (
                <div className="admin-dashboard__loading">Cargando servicios...</div>
            )}

            {error && !loading && (
                <div className="admin-dashboard__error">{error}</div>
            )}

            {showForm && (
                <section
                    className="admin-form"
                    style={{ marginBottom: 'var(--space-xl)' }}
                >
                    <form onSubmit={handleSubmit}>
                        <fieldset className="form-fieldset">
                            <legend className="form-fieldset__legend">
                                {editingId ? 'Editar servicio' : 'Nuevo servicio'}
                            </legend>

                            {formError && <div className="form-error">{formError}</div>}

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="nombre">
                                        Nombre *
                                    </label>
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        className="form-input"
                                        value={form.nombre}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="tipo">
                                        Tipo *
                                    </label>
                                    <select
                                        id="tipo"
                                        name="tipo"
                                        className="form-input form-input--select"
                                        value={form.tipo}
                                        onChange={handleChange}
                                    >
                                        {TIPO_OPTIONS.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="precio_base">
                                        Precio base (Bs.) *
                                    </label>
                                    <input
                                        id="precio_base"
                                        name="precio_base"
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={form.precio_base}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="duracion_minutos">
                                        Duración (minutos) *
                                    </label>
                                    <input
                                        id="duracion_minutos"
                                        name="duracion_minutos"
                                        type="number"
                                        className="form-input"
                                        value={form.duracion_minutos}
                                        onChange={handleChange}
                                    />
                                    <p className="form-note">
                                        Tiempo estimado de la cita (ej: 45, 60, 90).
                                    </p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" htmlFor="descripcion">
                                        Descripción
                                    </label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        className="form-input"
                                        rows={3}
                                        value={form.descripcion}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group" style={{ flex: 1 }}>
                                    <ImageUploader
                                        value={form.imagen_url}
                                        onChange={(url) =>
                                            setForm((prev) => ({ ...prev, imagen_url: url }))
                                        }
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
                                {saving
                                    ? 'Guardando...'
                                    : editingId
                                        ? 'Guardar cambios'
                                        : 'Crear servicio'}
                            </button>
                            <button
                                type="button"
                                className="btn btn--secondary"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {!loading && !error && (
                <section className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Servicio</th>
                                <th>Tipo</th>
                                <th>Precio base</th>
                                <th>Duración</th>
                                <th style={{ width: '160px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>No se encontraron servicios.</td>
                                </tr>
                            ) : (
                                filteredServices.map((s) => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {s.imagen_url && (
                                                    <img
                                                        src={s.imagen_url}
                                                        alt={s.nombre}
                                                        style={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: '999px',
                                                            objectFit: 'cover',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{s.nombre}</div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            color: 'var(--color-text-light)',
                                                        }}
                                                    >
                                                        {(s.descripcion || '').slice(0, 60)}
                                                        {s.descripcion && s.descripcion.length > 60 && '...'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getTipoLabel(s.tipo)}</td>
                                        <td>{formatCurrency(Number(s.precio_base || 0))}</td>
                                        <td>{s.duracion_minutos} min</td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    type="button"
                                                    className="btn btn--secondary btn--sm"
                                                    onClick={() => handleEdit(s)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn--outline-danger btn--sm"
                                                    onClick={() => handleDelete(s)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </section>
            )}

            <ConfirmModal
                open={showDeleteModal}
                title="Eliminar servicio"
                message={
                    serviceToDelete
                        ? `¿Seguro que deseas eliminar el servicio "${serviceToDelete.nombre}"?`
                        : '¿Seguro que deseas eliminar este servicio?'
                }
                onCancel={() => {
                    setShowDeleteModal(false);
                    setServiceToDelete(null);
                }}
                onConfirm={confirmDelete}
            />
        </>
    );
}
