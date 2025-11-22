import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useParams } from 'react-router-dom';


export default function OrderTrack() {
    const { id } = useParams();
    const [t, setT] = useState(null);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            const { data } = await api.get(`/api/orders/${id}/track`);
            if (alive) setT(data);
        };
        load();
        const iv = setInterval(load, 10000); 
        return () => { alive = false; clearInterval(iv); };
    }, [id]);

    const center = t?.lat && t?.lng ? [t.lat, t.lng] : [-17.7833, -63.1821]; 

    return (
        <>
            <SEO title="Tracking de pedido" description="Sigue tu pedido en tiempo real" url={`http://localhost:5173/pedidos/${id}/track`} />
            <section className="container">
                <h1 className="section-title">Tracking del pedido #{id}</h1>
                {t ? <p>Estado: {t.estado}</p> : <p>Cargando...</p>}
                <div style={{ height: 420, marginTop: 12 }}>
                    <MapContainer center={center} zoom={12} style={{ height: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {t?.lat && t?.lng && (
                            <Marker position={[t.lat, t.lng]}>
                                <Popup>Reparto en camino</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
            </section>
        </>
    );
}
