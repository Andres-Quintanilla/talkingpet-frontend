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
    const [q, setQ] = useState('');
    const [cats, setCats] = useState({
        Alimentos: false,
        Accesorios: false,
        Higiene: false,
        'Camas y Collares': false,
    });

    const [sp, setSp] = useSearchParams();
    const pageFromUrl = Number(sp.get('page') || 1);

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

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        const activeCats = Object.entries(cats)
            .filter(([, v]) => v)
            .map(([k]) => k);

        return data.items
            .filter((p) => p.estado === 'publicado')
            .filter((p) => {
                const matchQ =
                    !query ||
                    p.nombre?.toLowerCase().includes(query) ||
                    p.descripcion?.toLowerCase().includes(query);
                const matchCat =
                    !activeCats.length || activeCats.includes(p.categoria || '');
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
                title="Productos - TalkingPet"
                description="Nuestros productos para mascotas: alimento, juguetes, higiene, camitas y más."
                url="http://localhost:5173/productos"
            />

            <div className="products-page">
                <div className="container">
                    <h1 className="products-page__title">Nuestros Productos</h1>

                    <div className="products-page__layout">
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
                                    onClick={() => {
                                    }}
                                >
                                    Aplicar Filtros
                                </button>
                            </div>
                        </aside>

                        <div className="products-content">
                            <div className="products-header">
                                <p className="products-header__results">
                                    {loading ? (
                                        'Cargando...'
                                    ) : (
                                        <>
                                            Mostrando <strong>{filtered.length} resultados</strong>
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
