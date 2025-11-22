import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/format';
import ImageUploader from '../../components/ImageUploader';
import ConfirmModal from '../../components/ConfirmModal';

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoria: '',
  estado: 'borrador',
  es_destacado: false,
  imagen_url: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: 1,
        limit: 100,
        _ts: Date.now(),
      };
      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await api.get('/api/products', { params });
      const items = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
          ? res.data
          : [];
      setProducts(items);
    } catch (e) {
      console.error('Error cargando productos admin', e);
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => (p.nombre || '').toLowerCase().includes(term));
  }, [products, search]);

  const handleNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setForm({
      nombre: product.nombre ?? '',
      descripcion: product.descripcion ?? '',
      precio: product.precio ?? '',
      stock: product.stock ?? '',
      categoria: product.categoria ?? product.categoria_nombre ?? '',
      estado: product.estado ?? 'borrador',
      es_destacado: Boolean(product.es_destacado),
      imagen_url: product.imagen_url ?? '',
    });
    setEditingId(product.id);
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
    if (!form.nombre.trim()) {
      return 'El nombre es obligatorio.';
    }
    if (form.precio === '' || isNaN(Number(form.precio))) {
      return 'El precio debe ser un número.';
    }
    if (form.stock === '' || isNaN(Number(form.stock))) {
      return 'El stock debe ser un número.';
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
      descripcion: form.descripcion.trim() || null,
      precio: Number(form.precio),
      stock: Number(form.stock),
      categoria: form.categoria.trim() || null,
      estado: form.estado,
      es_destacado: !!form.es_destacado,
      imagen_url: form.imagen_url?.trim() || null,
    };

    try {
      if (editingId) {
        const { data: updated } = await api.put(
          `/api/products/${editingId}`,
          payload
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const { data: created } = await api.post('/api/products', payload);
        setProducts((prev) => [created, ...prev]);
      }

      handleCancel();
    } catch (e) {
      console.error('Error guardando producto', e);
      const msgServer =
        e.response?.data?.error ||
        'No se pudo guardar el producto. Revisa los datos.';
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

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await api.delete(`/api/products/${productToDelete.id}`);

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    } catch (e) {
      console.error('Error eliminando producto', e);
      alert(
        e.response?.data?.error ||
        'No se pudo eliminar el producto.'
      );
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <header className="admin-main__header admin-header">
        <div>
          <h1 className="admin-main__title">Productos</h1>
          <p className="admin-main__subtitle">
            Gestión de productos del catálogo de TalkingPet.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: '240px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                loadProducts();
              }
            }}
          />
          <button
            type="button"
            className="btn btn--secondary"
            onClick={loadProducts}
          >
            Buscar
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleNew}
          >
            + Nuevo producto
          </button>
        </div>
      </header>

      {loading && (
        <div className="admin-dashboard__loading">Cargando productos...</div>
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
                {editingId ? 'Editar producto' : 'Nuevo producto'}
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
                  <label className="form-label" htmlFor="precio">
                    Precio (Bs.) *
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
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="stock">
                    Stock *
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    className="form-input"
                    value={form.stock}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="categoria">
                    Categoría
                  </label>
                  <input
                    id="categoria"
                    name="categoria"
                    type="text"
                    className="form-input"
                    placeholder="Ej: Innovación, Alimentos..."
                    value={form.categoria}
                    onChange={handleChange}
                  />
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
                    <option value="borrador">Borrador</option>
                    <option value="publicado">Publicado</option>
                  </select>
                  <p className="form-note">
                    &quot;Publicado&quot; se mostrará en la tienda, &quot;borrador&quot; solo en el
                    panel admin.
                  </p>
                </div>

                <div className="form-group">
                  <ImageUploader
                    value={form.imagen_url}
                    onChange={(url) =>
                      setForm((prev) => ({ ...prev, imagen_url: url }))
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    name="es_destacado"
                    checked={form.es_destacado}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Producto destacado
                </label>
                <p className="form-note">
                  Los productos destacados se pueden usar en secciones especiales
                  del home o de la tienda.
                </p>
              </div>

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
                    : 'Crear producto'}
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
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Destacado</th>
                <th style={{ width: '160px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7}>No se encontraron productos.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'center',
                        }}
                      >
                        {p.imagen_url && (
                          <img
                            src={p.imagen_url}
                            alt={p.nombre}
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
                          <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--color-text-light)',
                            }}
                          >
                            {p.categoria || p.categoria_nombre || 'Sin categoría'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{formatCurrency(Number(p.precio || 0))}</td>
                    <td>{p.stock ?? '-'}</td>
                    <td>{p.estado === 'publicado' ? 'Publicado' : 'Borrador'}</td>
                    <td>{p.es_destacado ? 'Sí' : 'No'}</td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => handleEdit(p)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--outline-danger btn--sm"
                          onClick={() => handleDelete(p)}
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
        title="Eliminar producto"
        message={
          productToDelete
            ? `¿Seguro que deseas eliminar el producto "${productToDelete.nombre}"?`
            : '¿Seguro que deseas eliminar este producto?'
        }
        onCancel={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
