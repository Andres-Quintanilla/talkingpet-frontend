import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/format';
import ImageUploader from '../../components/ImageUploader';
import ConfirmModal from '../../components/ConfirmModal';

const EMPTY_FORM = {
    titulo: '',
    descripcion: '',
    precio: '',
    estado: 'borrador',
    modalidad: 'virtual',
    cupos_totales: '',
    fecha_inicio_presencial: '',
    portada_url: '',
    trailer_url: '',
};

const ESTADO_OPTIONS = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'publicado', label: 'Publicado' },
    { value: 'archivado', label: 'Archivado' },
];

const MODALIDAD_OPTIONS = [
    { value: 'virtual', label: 'Virtual' },
    { value: 'presencial', label: 'Presencial' },
];

const ESTADO_BADGE = {
    borrador: 'badge badge--neutral',
    publicado: 'badge badge--success',
    archivado: 'badge badge--danger',
};

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const loadCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/api/courses/admin/list', {
                params: { _ts: Date.now() },
            });
            setCourses(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Error cargando cursos admin', e);
            setError('No se pudieron cargar los cursos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return courses;

        return courses.filter((c) => {
            const titulo = (c.titulo || '').toLowerCase();
            const modalidad = (c.modalidad || '').toLowerCase();
            const estado = (c.estado || '').toLowerCase();
            return (
                titulo.includes(term) ||
                modalidad.includes(term) ||
                estado.includes(term)
            );
        });
    }, [courses, search]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();

    };

    const handleNew = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setFormError('');
        setShowForm(true);
    };

    const handleEdit = (course) => {
        setForm({
            titulo: course.titulo ?? '',
            descripcion: course.descripcion ?? '',
            precio: course.precio ?? '',
            estado: course.estado ?? 'borrador',
            modalidad: course.modalidad ?? 'virtual',
            cupos_totales: course.cupos_totales ?? '',
            fecha_inicio_presencial: course.fecha_inicio_presencial
                ? course.fecha_inicio_presencial.slice(0, 10)
                : '',
            portada_url: course.portada_url ?? '',
            trailer_url: course.trailer_url ?? '',
        });
        setEditingId(course.id);
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
        if (!form.titulo.trim()) {
            return 'El título es obligatorio.';
        }
        if (
            form.precio !== '' &&
            (isNaN(Number(form.precio)) || Number(form.precio) < 0)
        ) {
            return 'El precio debe ser un número mayor o igual a 0.';
        }
        if (!form.modalidad) {
            return 'La modalidad es obligatoria.';
        }
        if (form.modalidad === 'presencial') {
            if (
                form.cupos_totales === '' ||
                isNaN(Number(form.cupos_totales)) ||
                Number(form.cupos_totales) <= 0
            ) {
                return 'Para cursos presenciales, los cupos deben ser un número mayor a 0.';
            }
            if (!form.fecha_inicio_presencial) {
                return 'Para cursos presenciales, la fecha de inicio es obligatoria.';
            }
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
            titulo: form.titulo.trim(),
            descripcion: form.descripcion.trim() || null,
            estado: form.estado,
            precio: form.precio === '' ? null : Number(form.precio),
            modalidad: form.modalidad,
            cupos_totales:
                form.modalidad === 'presencial' ? Number(form.cupos_totales) : null,
            fecha_inicio_presencial:
                form.modalidad === 'presencial' && form.fecha_inicio_presencial
                    ? form.fecha_inicio_presencial
                    : null,
            portada_url: form.portada_url?.trim() || null,
            trailer_url: form.trailer_url?.trim() || null,
        };

        try {
            if (editingId) {
                const { data: updated } = await api.put(
                    `/api/courses/${editingId}`,
                    payload
                );
                setCourses((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                );
            } else {
                const { data: created } = await api.post('/api/courses', payload);
                setCourses((prev) => [created, ...prev]);
            }
            handleCancel();
        } catch (e) {
            console.error('Error guardando curso', e);
            const msgServer =
                e.response?.data?.error || 'No se pudo guardar el curso.';
            setFormError(msgServer);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (course) => {
        setCourseToDelete(course);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            await api.delete(`/api/courses/${courseToDelete.id}`);
            setCourses((prev) =>
                prev.filter((c) => c.id !== courseToDelete.id)
            );
        } catch (e) {
            console.error('Error eliminando curso', e);
            alert(
                e.response?.data?.error ||
                `No se pudo eliminar el curso (status ${e.response?.status || '??'
                }).`
            );
        } finally {
            setShowDeleteModal(false);
            setCourseToDelete(null);
        }
    };

    const formatModalidadInfo = (c) => {
        if (c.modalidad === 'virtual') return 'Virtual';
        const cupos =
            c.cupos_totales != null ? `${c.cupos_totales} cupos` : 'Cupos n/d';
        const fecha = c.fecha_inicio_presencial
            ? new Date(c.fecha_inicio_presencial).toLocaleDateString('es-BO')
            : 'Fecha n/d';
        return `Presencial • ${cupos} • ${fecha}`;
    };

    return (
        <>
            <header className="admin-main__header admin-header">
                <div>
                    <h1 className="admin-main__title">Cursos</h1>
                    <p className="admin-main__subtitle">
                        Gestión de cursos virtuales y presenciales.
                    </p>
                </div>

                <form
                    className="admin-header__actions"
                    onSubmit={handleSearchSubmit}
                    style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
                >
                    <input
                        type="text"
                        placeholder="Buscar por título, modalidad o estado..."
                        className="form-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ minWidth: '260px' }}
                    />
                    <button type="submit" className="btn btn--secondary">
                        Buscar
                    </button>
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleNew}
                    >
                        + Nuevo curso
                    </button>
                </form>
            </header>

            {loading && (
                <div className="admin-dashboard__loading">
                    Cargando cursos...
                </div>
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
                                {editingId ? 'Editar curso' : 'Nuevo curso'}
                            </legend>

                            {formError && <div className="form-error">{formError}</div>}

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="titulo">
                                        Título *
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

                                <div className="form-group">
                                    <label className="form-label" htmlFor="precio">
                                        Precio (Bs.)
                                    </label>
                                    <input
                                        id="precio"
                                        name="precio"
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={form.precio}
                                        onChange={handleChange}
                                    />
                                    <p className="form-note">
                                        Deja en blanco si el curso es gratuito.
                                    </p>
                                </div>
                            </div>

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
                                        {ESTADO_OPTIONS.map((e) => (
                                            <option key={e.value} value={e.value}>
                                                {e.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="modalidad">
                                        Modalidad
                                    </label>
                                    <select
                                        id="modalidad"
                                        name="modalidad"
                                        className="form-input form-input--select"
                                        value={form.modalidad}
                                        onChange={handleChange}
                                    >
                                        {MODALIDAD_OPTIONS.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {form.modalidad === 'presencial' && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label
                                            className="form-label"
                                            htmlFor="cupos_totales"
                                        >
                                            Cupos totales *
                                        </label>
                                        <input
                                            id="cupos_totales"
                                            name="cupos_totales"
                                            type="number"
                                            className="form-input"
                                            value={form.cupos_totales}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label
                                            className="form-label"
                                            htmlFor="fecha_inicio_presencial"
                                        >
                                            Fecha de inicio *
                                        </label>
                                        <input
                                            id="fecha_inicio_presencial"
                                            name="fecha_inicio_presencial"
                                            type="date"
                                            className="form-input"
                                            value={form.fecha_inicio_presencial}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" htmlFor="descripcion">
                                        Descripción
                                    </label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        className="form-input"
                                        rows={4}
                                        value={form.descripcion}
                                        onChange={handleChange}
                                    />
                                    <p className="form-note">
                                        Aquí puedes resumir qué aprenderá la persona en
                                        este curso.
                                    </p>
                                </div>

                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">
                                        Portada del curso
                                    </label>
                                    <ImageUploader
                                        value={form.portada_url}
                                        onChange={(url) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                portada_url: url,
                                            }))
                                        }
                                    />
                                    <label
                                        className="form-label"
                                        htmlFor="trailer_url"
                                        style={{ marginTop: '1rem', display: 'block' }}
                                    >
                                        URL del video principal / trailer
                                    </label>
                                    <input
                                        id="trailer_url"
                                        name="trailer_url"
                                        type="url"
                                        className="form-input"
                                        placeholder="https://www.youtube.com/..."
                                        value={form.trailer_url}
                                        onChange={handleChange}
                                    />
                                    <p className="form-note">
                                        Más adelante puedes gestionar las demás clases en
                                        una pantalla de &quot;Contenido del curso&quot;.
                                    </p>
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
                                        : 'Crear curso'}
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
                                <th>Curso</th>
                                <th>Modalidad</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th style={{ width: '160px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>No se encontraron cursos.</td>
                                </tr>
                            ) : (
                                filteredCourses.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {c.portada_url && (
                                                    <img
                                                        src={c.portada_url}
                                                        alt={c.titulo}
                                                        style={{
                                                            width: 56,
                                                            height: 56,
                                                            borderRadius: '0.75rem',
                                                            objectFit: 'cover',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>
                                                        {c.titulo}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            color: 'var(--color-text-light)',
                                                        }}
                                                    >
                                                        {formatModalidadInfo(c)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {c.modalidad === 'virtual'
                                                ? 'Virtual'
                                                : 'Presencial'}
                                        </td>
                                        <td>
                                            {c.precio != null
                                                ? formatCurrency(Number(c.precio))
                                                : 'Gratis'}
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    ESTADO_BADGE[c.estado] ||
                                                    'badge badge--neutral'
                                                }
                                            >
                                                {c.estado === 'borrador'
                                                    ? 'Borrador'
                                                    : c.estado === 'publicado'
                                                        ? 'Publicado'
                                                        : 'Archivado'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    type="button"
                                                    className="btn btn--secondary btn--sm"
                                                    onClick={() => handleEdit(c)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn--outline-danger btn--sm"
                                                    onClick={() => handleDelete(c)}
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

            {/* Modal eliminar */}
            <ConfirmModal
                open={showDeleteModal}
                title="Eliminar curso"
                message={
                    courseToDelete
                        ? `¿Seguro que deseas eliminar el curso "${courseToDelete.titulo}"?`
                        : '¿Seguro que deseas eliminar este curso?'
                }
                onCancel={() => {
                    setShowDeleteModal(false);
                    setCourseToDelete(null);
                }}
                onConfirm={confirmDelete}
            />
        </>
    );
}
