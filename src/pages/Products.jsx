import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const PAGE_SIZE = Number(import.meta.env.VITE_PAGE_SIZE || 12);

export default function Products() {
  const [data, setData] = useState({
    items: [],
    page: 1,
    totalPages: 1,
    count: 0,
  });
  const [loading, setLoading] = useState(true);

  // búsqueda por texto
  const [q, setQ] = useState('');

  // categorías seleccionadas (se llenan dinámicamente)
  const [cats, setCats] = useState({});

  const [sp, setSp] = useSearchParams();
  const pageFromUrl = Number(sp.get('page') || 1);

  // === Cargar productos desde la API ===
  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/products', {
          params: {
            page: pageFromUrl,
            limit: PAGE_SIZE,
            _ts: Date.now(),
          },
        });

        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];

        const page = Number(data.page || pageFromUrl || 1);
        const total = Number(data.total || items.length);
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

        if (isMounted) {
          setData({
            items,
            page,
            totalPages,
            count: total,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [pageFromUrl]);

  // === Construir lista de categorías a partir de lo que viene del admin ===
  useEffect(() => {
    const categoriesFromData = Array.from(
      new Set(
        (data.items || [])
          .map((p) => (p.categoria || p.categoria_nombre || '').trim())
          .filter(Boolean)
      )
    );

    setCats((prev) => {
      const next = { ...prev };

      // Aseguramos que todas las categorías existentes tengan una entrada
      categoriesFromData.forEach((c) => {
        if (!(c in next)) {
          next[c] = false;
        }
      });

      // Opcional: eliminar categorías que ya no existan en los productos
      Object.keys(next).forEach((c) => {
        if (!categoriesFromData.includes(c)) {
          delete next[c];
        }
      });

      return next;
    });
  }, [data.items]);

  // === Productos filtrados (búsqueda + categorías + estado publicado) ===
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const activeCats = Object.entries(cats)
      .filter(([, v]) => v)
      .map(([k]) => k);

    return data.items
      .filter((p) => p.estado === 'publicado')
      .filter((p) => {
        const nombre = (p.nombre || '').toLowerCase();
        const desc = (p.descripcion || '').toLowerCase();
        const cat = (p.categoria || p.categoria_nombre || '').trim();

        const matchQ =
          !query || nombre.includes(query) || desc.includes(query);

        const matchCat =
          !activeCats.length || activeCats.includes(cat);

        return matchQ && matchCat;
      });
  }, [data.items, q, cats]);

  const toggleCat = (name) =>
    setCats((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

  const setPage = (n) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(n));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEO
        title="Productos para Mascotas - Alimento, Accesorios y Más"
        description="Productos certificados para mascotas en Bolivia: alimento premium, juguetes, accesorios de higiene, camitas, comederos y más. Calidad garantizada y precios competitivos. Envíos a domicilio."
        url="/productos"
        keywords="productos mascotas Bolivia, alimento perros gatos, juguetes mascotas, accesorios higiene mascotas, camitas perros, comederos mascotas, productos certificados mascotas"
        type="website"
      />

      <div className="products-page">
        <div className="container">
          <h1 className="products-page__title">Nuestros Productos</h1>

          <div className="products-page__layout">
            {/* SIDEBAR DE FILTROS */}
            <aside
              className="sidebar"
              role="complementary"
              aria-label="Filtros de productos"
            >
              <div className="filter-group">
                <h2 className="filter-group__title">Búsqueda</h2>
                <div className="filter-group__content">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar productos..."
                    aria-label="Buscar productos"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <h2 className="filter-group__title">Categorías</h2>
                <div className="filter-group__content">
                  {Object.keys(cats).length === 0 && (
                    <p className="form-note">
                      Aún no hay categorías configuradas en los productos.
                    </p>
                  )}

                  {Object.keys(cats).map((k) => (
                    <label key={k} className="checkbox">
                      <input
                        type="checkbox"
                        className="checkbox__input"
                        checked={cats[k]}
                        onChange={() => toggleCat(k)}
                      />
                      {k}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <button
                  className="btn btn--primary btn--full"
                  type="button"
                  onClick={() => setPage(1)} // solo reinicia a página 1
                >
                  Aplicar filtros
                </button>
                <p className="form-note" style={{ marginTop: '0.5rem' }}>
                  Los filtros se aplican automáticamente al escribir o marcar
                  categorías.
                </p>
              </div>
            </aside>

            {/* LISTADO DE PRODUCTOS */}
            <div className="products-content">
              <div className="products-header">
                <p className="products-header__results">
                  {loading ? (
                    'Cargando...'
                  ) : (
                    <>
                      Mostrando{' '}
                      <strong>{filtered.length} resultados</strong>
                    </>
                  )}
                </p>
              </div>

              <div className="products-grid">
                {!loading &&
                  filtered.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>

              {!loading && data.totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    marginTop: '1.5rem',
                  }}
                >
                  <button
                    className="btn btn--outline-primary"
                    onClick={() => setPage(Math.max(1, data.page - 1))}
                    disabled={data.page <= 1}
                  >
                    ← Anterior
                  </button>
                  <span style={{ alignSelf: 'center' }}>
                    Página {data.page} de {data.totalPages}
                  </span>
                  <button
                    className="btn btn--outline-primary"
                    onClick={() =>
                      setPage(Math.min(data.totalPages, data.page + 1))
                    }
                    disabled={data.page >= data.totalPages}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
