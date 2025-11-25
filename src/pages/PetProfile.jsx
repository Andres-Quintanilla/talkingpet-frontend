import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";


export default function PetProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [__, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/api/pets/${id}`)
      .then((res) => setData(res.data.pet))
      .catch((err) => {
        console.error("Error cargando el perfil de la mascota:", err);
        setError("No se pudo cargar la información de la mascota.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5">
        <p>Cargando cartilla...</p>
      </div>
    );
  }

  if (!data || !data.mascota) {
    return (
      <div className="container py-5">
        <h2>Cartilla no encontrada</h2>
        <p className="text-muted">
          No pudimos encontrar la información de esta mascota.
        </p>
      </div>
    );
  }

  const { mascota, historial = [] } = data;

  return (
    <div className="container py-5">
      <h2 className="mb-3">Cartilla de {mascota.nombre}</h2>
      <p className="text-muted mb-4">
        Aquí verás los datos básicos, vacunas y consultas veterinarias de tu mascota.
      </p>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Datos de la mascota</h5>
              <p className="card-text mb-1">
                <strong>Especie:</strong> {mascota.especie}
              </p>
              <p className="card-text mb-1">
                <strong>Raza:</strong> {mascota.raza || "Sin especificar"}
              </p>
              {mascota.edad != null && (
                <p className="card-text mb-1">
                  <strong>Edad:</strong> {mascota.edad} años
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Vacunas e historial médico</h5>

              {historial.length === 0 && (
                <p className="text-muted">
                  Todavía no registraste vacunas ni consultas para esta mascota.
                </p>
              )}

              {historial.length > 0 && (
                <ul className="list-unstyled mb-0">
                  {historial.map((item) => (
                    <li key={item.id} className="mb-2">
                      <strong>{item.tipo}</strong> — {item.descripcion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
