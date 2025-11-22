import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'admin', label: 'Administrador' },
  { value: 'empleado', label: 'Empleado' },
];


const EMPTY_FORM = {
  id: null,
  nombre: '',
  email: '',
  telefono: '',
  rol: 'cliente',
  activo: true,
  saldo: 0,       
  saldoActual: 0, 
};

export default function AdminUsers() {
  const { user: loggedUser, updateUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: 1,
        limit: 100,
        _ts: Date.now(),
      };
      if (search.trim()) {
        params.q = search.trim();
      }

      const { data } = await api.get('/api/users', { params });
      const items = Array.isArray(data?.items) ? data.items : [];
      setUsers(items);
    } catch (e) {
      console.error('Error cargando usuarios', e);
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const n = (u.nombre || '').toLowerCase();
      const e = (u.email || '').toLowerCase();
      return n.includes(term) || e.includes(term);
    });
  }, [users, search]);

  const handleNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const handleEdit = (u) => {
    setForm({
      id: u.id,
      nombre: u.nombre || '',
      email: u.email || '',
      telefono: u.telefono || '',
      rol: u.rol || 'cliente',
      activo: u.activo ?? true,
      saldo: 0,                
      saldoActual: u.saldo ?? 0, 
    });
    setEditingId(u.id);
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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.email.trim()) return 'El email es obligatorio.';
    if (!form.rol) return 'El rol es obligatorio.';
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

    const saldoDelta = Number(form.saldo || 0);
    const saldoActual = Number(form.saldoActual || 0);
    const saldoFinal = saldoActual + saldoDelta;

    const payload = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim() || null,
      rol: form.rol,
      activo: !!form.activo,
      saldo: saldoFinal,
    };

    try {
      if (editingId) {
        const { data: updated } = await api.patch(
          `/api/users/${editingId}`,
          payload
        );

        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
        );

        if (loggedUser && updated.id === loggedUser.id && updateUser) {
          updateUser({
            nombre: updated.nombre,
            email: updated.email,
            telefono: updated.telefono,
            rol: updated.rol,
            activo: updated.activo,
            saldo: updated.saldo,
          });
        }
      } else {
        const { data: created } = await api.post('/api/users', payload);
        setUsers((prev) => [created, ...prev]);
        alert(
          'Usuario creado. Contraseña por defecto: 123456 (solo para entorno de pruebas).'
        );
      }

      handleCancel();
    } catch (e) {
      console.error('Error guardando usuario', e);
      const msgServer =
        e.response?.data?.error || 'No se pudo guardar el usuario.';
      setFormError(msgServer);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (u) => {
    setUserToDelete(u);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/api/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (e) {
      console.error('Error eliminando usuario', e);
      alert(e.response?.data?.error || 'No se pudo eliminar el usuario.');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <header className="admin-main__header admin-header">
        <div>
          <h1 className="admin-main__title">Usuarios</h1>
          <p className="admin-main__subtitle">
            Gestión de usuarios del sistema, roles y estado.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: '260px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                loadUsers();
              }
            }}
          />
          <button
            type="button"
            className="btn btn--secondary"
            onClick={loadUsers}
          >
            Buscar
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleNew}
          >
            + Nuevo usuario
          </button>
        </div>
      </header>

      {loading && (
        <div className="admin-dashboard__loading">Cargando usuarios...</div>
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
                {editingId ? 'Editar usuario' : 'Nuevo usuario'}
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
                  <label className="form-label" htmlFor="email">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="telefono">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="text"
                    className="form-input"
                    value={form.telefono}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rol">
                    Rol *
                  </label>
                  <select
                    id="rol"
                    name="rol"
                    className="form-input form-input--select"
                    value={form.rol}
                    onChange={handleChange}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="saldoActual">
                    Total de puntos
                  </label>
                  <input
                    id="saldoActual"
                    name="saldoActual"
                    type="number"
                    className="form-input"
                    value={form.saldoActual}
                    disabled
                  />
                  <p className="form-note">
                    Puntos disponibles actualmente para este usuario.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="saldo">
                    Monto a agregar / descontar
                  </label>
                  <input
                    id="saldo"
                    name="saldo"
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={form.saldo}
                    onChange={handleChange}
                  />
                  <p className="form-note">
                    Usa valores positivos para sumar puntos y negativos para
                    restar.
                  </p>
                </div>
              </div>

              <div className="form-row">
                <div
                  className="form-group"
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <label className="form-label" htmlFor="activo">
                    Estado
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
                      id="activo"
                      name="activo"
                      type="checkbox"
                      checked={form.activo}
                      onChange={handleChange}
                    />
                    <span>{form.activo ? 'Activo' : 'Inactivo'}</span>
                  </label>
                  {!editingId && (
                    <p className="form-note">
                      El usuario nuevo se crea con contraseña por defecto
                      <strong> 123456</strong> (solo entorno de pruebas).
                    </p>
                  )}
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
                  : 'Crear usuario'}
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
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Rol</th>
                <th>Puntos</th>
                <th>Estado</th>
                <th style={{ width: '180px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7}>No se encontraron usuarios.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = loggedUser?.id === u.id;
                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.nombre}</div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--color-text-light)',
                          }}
                        >
                          Registrado:{' '}
                          {u.fecha_registro
                            ? new Date(u.fecha_registro).toLocaleDateString(
                                'es-BO'
                              )
                            : '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{u.email}</div>
                        {u.telefono && (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--color-text-light)',
                            }}
                          >
                            {u.telefono}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge--neutral">
                          {ROLES.find((r) => r.value === u.rol)?.label ||
                            u.rol ||
                            '-'}
                        </span>
                      </td>
                      <td>{typeof u.saldo === 'number' ? u.saldo : 0}</td>
                      <td>
                        <span
                          className={
                            u.activo
                              ? 'badge badge--success'
                              : 'badge badge--danger'
                          }
                        >
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => handleEdit(u)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn--outline-danger btn--sm"
                            onClick={() => handleDelete(u)}
                            disabled={isSelf}
                            title={
                              isSelf
                                ? 'No puedes eliminar tu propio usuario.'
                                : 'Eliminar usuario'
                            }
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      )}

      <ConfirmModal
        open={showDeleteModal}
        title="Eliminar usuario"
        message={
          userToDelete
            ? `¿Seguro que deseas eliminar al usuario "${userToDelete.nombre}"?`
            : '¿Seguro que deseas eliminar este usuario?'
        }
        onCancel={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
