import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

const EMPTY_FORM = {
    id: null,
    tipo: 'video', 
    titulo: '',
    descripcion: '',
    url_video: '',
    fecha: '',
    lugar: '',
    estado: 'activo', 
};

export default function EmployeeTraining() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [filterTipo, setFilterTipo] = useState('todos');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await api.get('/api/training/resources', {
                    params: { _ts: Date.now() },
                });
                setItems(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error cargando recursos de adiestramiento', err);
                setError('No se pudieron cargar los recursos de adiestramiento.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = useMemo(() => {
        if (filterTipo === 'todos') return items;
        return items.filter((i) => i.tipo === filterTipo);
    }, [items, filterTipo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            id: item.id,
            tipo: item.tipo,
            titulo: item.titulo || '',
            descripcion: item.descripcion || '',
            url_video: item.url_video || '',
            fecha: item.fecha || '',
            lugar: item.lugar || '',
            estado: item.estado || 'activo',
        });
    };

    const handleNew = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleToggleEstado = async (item) => {
        const nuevo = item.estado === 'activo' ? 'inactivo' : 'activo';
        try {
            const { data: updated } = await api.patch(
                `/api/training/resources/${item.id}/status`,
                { estado: nuevo }
            );
            setItems((prev) =>
                prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
            );
        } catch (err) {
            console.error('Error cambiando estado recurso', err);
            alert(
                err.response?.data?.error ||
                'No se pudo cambiar el estado del recurso.'
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.titulo.trim()) {
            alert('El título es obligatorio.');
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                const { data: updated } = await api.patch(
                    `/api/training/resources/${editingId}`,
                    form
                );
                setItems((prev) =>
                    prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
                );
            } else {
                const { data: created } = await api.post(
                    '/api/training/resources',
                    form
                );
                setItems((prev) => [created, ...prev]);
            }

            setForm(EMPTY_FORM);
            setEditingId(null);
        } catch (err) {
            console.error('Error guardando recurso', err);
            alert(
                err.response?.data?.error ||
                'No se pudo guardar el recurso de adiestramiento.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <header className="admin-main__header admin-header">
                <div>
                    <h1 className="admin-main__title">Adiestramiento</h1>
                    <p className="admin-main__subtitle">
                        Gestiona videos y cursos presenciales de adiestramiento. Puedes crear nuevos y activarlos o desactivarlos.
                        La eliminación quedará reservada para el administrador.
                    </p>
                </div>
            </header>

            {loading && (
                <div className="admin-dashboard__loading">
                    Cargando recursos...
                </div>
            )}
            {error && !loading && (
                <div className="admin-dashboard__error">{error}</div>
            )}

            {!loading && !error && (
                <>
                    <section
                        className="admin-form"
                        style={{ marginBottom: 'var(--space-xl)' }}
                    >
                        <form onSubmit={handleSubmit}>
                            <fieldset className="form-fieldset">
                                <legend className="form-fieldset__legend">
                                    {editingId ? 'Editar recurso' : 'Nuevo recurso'}
                                </legend>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="tipo">
                                            Tipo
                                        </label>
                                        <select
                                            id="tipo"
                                            name="tipo"
                                            className="form-input form-input--select"
                                            value={form.tipo}
                                            onChange={handleChange}
                                        >
                                            <option value="video">Video</option>
                                            <option value="curso_presencial">Curso presencial</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="titulo">
                                            Título
                                        </label>
                                        <input
                                            id="titulo"
                                            name="titulo"
                                            type="text"
                                            className="form-input"
                                            value={form.titulo}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
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
                                </div>

                                {form.tipo === 'video' ? (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="url_video">
                                                URL del video (YouTube, etc.)
                                            </label>
                                            <input
                                                id="url_video"
                                                name="url_video"
                                                type="url"
                                                className="form-input"
                                                value={form.url_video}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="fecha">
                                                Fecha del curso
                                            </label>
                                            <input
                                                id="fecha"
                                                name="fecha"
                                                type="date"
                                                className="form-input"
                                                value={form.fecha}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="lugar">
                                                Lugar
                                            </label>
                                            <input
                                                id="lugar"
                                                name="lugar"
                                                type="text"
                                                className="form-input"
                                                value={form.lugar}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="estado">
                                            Estado
                                        </label>
                                        <select
                                            id="estado"
                                            name="estado"
                                            className="form-input form-input--select"
                                            value={form.estado}
                                            onChange={handleChange}
                                        >
                                            <option value="activo">Activo</option>
                                            <option value="inactivo">Inactivo</option>
                                        </select>
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
                                            : 'Crear recurso'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        className="btn btn--secondary"
                                        onClick={handleNew}
                                        disabled={saving}
                                    >
                                        Cancelar edición
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    <section className="admin-table-wrapper">
                        <div
                            className="admin-main__header"
                            style={{ marginBottom: '1rem' }}
                        >
                            <div>
                                <h2 className="admin-main__title admin-main__title--sm">
                                    Recursos publicados
                                </h2>
                            </div>

                            <div>
                                <label className="form-label" htmlFor="filtro_tipo">
                                    Filtrar por tipo
                                </label>
                                <select
                                    id="filtro_tipo"
                                    className="form-input form-input--select"
                                    value={filterTipo}
                                    onChange={(e) => setFilterTipo(e.target.value)}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="video">Videos</option>
                                    <option value="curso_presencial">Cursos presenciales</option>
                                </select>
                            </div>
                        </div>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Título</th>
                                    <th>Info</th>
                                    <th>Estado</th>
                                    <th style={{ width: '220px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>No hay recursos creados.</td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {item.tipo === 'video' ? 'Video' : 'Curso presencial'}
                                            </td>
                                            <td>{item.titulo}</td>
                                            <td>
                                                {item.tipo === 'video' ? (
                                                    item.url_video ? (
                                                        <a
                                                            href={item.url_video}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Ver video
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )
                                                ) : (
                                                    <>
                                                        {item.fecha &&
                                                            new Date(item.fecha).toLocaleDateString(
                                                                'es-BO'
                                                            )}
                                                        {item.lugar && ` · ${item.lugar}`}
                                                    </>
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        item.estado === 'activo'
                                                            ? 'badge badge--success'
                                                            : 'badge badge--neutral'
                                                    }
                                                >
                                                    {item.estado === 'activo'
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn--secondary btn--sm"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn--outline-primary btn--sm"
                                                        onClick={() => handleToggleEstado(item)}
                                                    >
                                                        {item.estado === 'activo'
                                                            ? 'Desactivar'
                                                            : 'Activar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>
                </>
            )}
        </>
    );
}
