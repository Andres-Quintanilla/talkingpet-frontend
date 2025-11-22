import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function EstadoSalud({ estado }) {
  const config = {
    excelente: { icon: '✅', text: 'Excelente', class: 'estado-salud--excelente' },
    bueno: { icon: '👍', text: 'Bueno', class: 'estado-salud--bueno' },
    atencion: { icon: '⚠️', text: 'Requiere Atención', class: 'estado-salud--atencion' },
    critico: { icon: '🚨', text: 'Crítico', class: 'estado-salud--critico' }
  };
  const { icon, text, class: className } = config[estado] || config.bueno;
  return (<span className={`estado-salud ${className}`}>{icon} {text}</span>);
}


export default function AdminMedical() {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const mockData = [
        { id: 1, nombre: 'Max', especie: 'perro', raza: 'Golden', edad: 3, dueno: 'Cliente Ejemplo', alertas_pendientes: 1, ultima_consulta: '2025-10-01', proxima_vacuna: '2025-11-20', estado_salud: 'bueno' },
        { id: 2, nombre: 'Mishi', especie: 'gato', raza: 'Siames', edad: 1, dueno: 'Cliente Ejemplo', alertas_pendientes: 0, ultima_consulta: '2025-09-15', proxima_vacuna: '2026-01-10', estado_salud: 'excelente' },
      ];
      setMascotas(mockData);
      setStats({ totalMascotas: 2, alertasPendientes: 1, vacunasEsteMes: 1, consultasEsteMes: 2 });
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const mascotasFiltradas = mascotas.filter(mascota => {
    const cumpleBusqueda = !busqueda ||
      mascota.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      mascota.dueno.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando gestión médica...</p>
      </div>
    );
  }

  return (
    <div className="admin-medical">
      <div className="admin-medical__header">
        <h1 className="admin-medical__title">🏥 Gestión Médica</h1>
        {stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card admin-stat-card--primary">
              <div className="admin-stat-card__icon">🐾</div>
              <div className="admin-stat-card__content">
                <div className="admin-stat-card__value">{stats.totalMascotas}</div>
                <div className="admin-stat-card__label">Mascotas</div>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-card--warning">
              <div className="admin-stat-card__icon">⚠️</div>
              <div className="admin-stat-card__content">
                <div className="admin-stat-card__value">{stats.alertasPendientes}</div>
                <div className="admin-stat-card__label">Alertas</div>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-card--success">
              <div className="admin-stat-card__icon">💉</div>
              <div className="admin-stat-card__content">
                <div className="admin-stat-card__value">{stats.vacunasEsteMes}</div>
                <div className="admin-stat-card__label">Vacunas (Mes)</div>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-card--info">
              <div className="admin-stat-card__icon">📋</div>
              <div className="admin-stat-card__content">
                <div className="admin-stat-card__value">{stats.consultasEsteMes}</div>
                <div className="admin-stat-card__label">Consultas (Mes)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="admin-medical__filters">
        <div className="filter-tabs">
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar mascota o dueño..."
            className="search-box__input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="search-box__icon">🔍</span>
        </div>
      </div>

      <div className="admin-medical__content admin-table-wrapper">
        <table className="admin-table mascotas-table">
          <thead>
            <tr>
              <th>Mascota</th>
              <th>Dueño</th>
              <th>Especie / Raza</th>
              <th>Alertas</th>
              <th>Próx. Vacuna</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mascotasFiltradas.map((mascota) => (
              <tr key={mascota.id}>
                <td>
                  <div className="mascota-cell">
                    <div className="mascota-cell__icon">{mascota.especie === 'perro' ? '🐕' : '🐈'}</div>
                    <div className="mascota-cell__name">{mascota.nombre}</div>
                  </div>
                </td>
                <td>{mascota.dueno}</td>
                <td>
                  <div className="mascota-species">
                    <span className="badge badge--accent">{mascota.especie}</span>
                    <span className="mascota-species__raza">{mascota.raza}</span>
                  </div>
                </td>
                <td>
                  {mascota.alertas_pendientes > 0 ? (
                    <span className="alert-badge alert-badge--warning">{mascota.alertas_pendientes}</span>
                  ) : (
                    <span className="alert-badge alert-badge--success">0</span>
                  )}
                </td>
                <td>{format(new Date(mascota.proxima_vacuna), 'dd/MM/yyyy')}</td>
                <td><EstadoSalud estado={mascota.estado_salud} /></td>
                <td>
                  <div className="actions-cell">
                    <button
                      className="btn btn--sm btn--primary"
                      onClick={() => navigate(`/mascota/${mascota.id}/expediente`)}
                    >
                      Ver Expediente
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}