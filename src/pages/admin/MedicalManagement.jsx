import { useState, useEffect } from 'react';
import api from '../../api/axios';
import '../../styles/admin-medical.css';

export default function MedicalManagement() {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [estadisticasGlobales, setEstadisticasGlobales] = useState({
    totalMascotas: 0,
    alertasPendientes: 0,
    vacunasEsteMes: 0,
    consultasEsteMes: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const mockData = [
        {
          id: 1,
          nombre: 'Luna',
          especie: 'Perro',
          raza: 'Golden Retriever',
          edad: 3,
          dueno: 'María López',
          alertas_pendientes: 2,
          ultima_consulta: '2025-01-15',
          proxima_vacuna: '2025-02-01',
          estado_salud: 'bueno'
        },
        {
          id: 2,
          nombre: 'Max',
          especie: 'Gato',
          raza: 'Siamés',
          edad: 5,
          dueno: 'Carlos Pérez',
          alertas_pendientes: 0,
          ultima_consulta: '2025-01-10',
          proxima_vacuna: '2025-03-15',
          estado_salud: 'excelente'
        },
        {
          id: 3,
          nombre: 'Rocky',
          especie: 'Perro',
          raza: 'Bulldog',
          edad: 2,
          dueno: 'Ana García',
          alertas_pendientes: 5,
          ultima_consulta: '2024-12-20',
          proxima_vacuna: '2025-01-20',
          estado_salud: 'atencion'
        }
      ];

      setMascotas(mockData);
      setEstadisticasGlobales({
        totalMascotas: mockData.length,
        alertasPendientes: mockData.reduce((sum, m) => sum + m.alertas_pendientes, 0),
        vacunasEsteMes: 12,
        consultasEsteMes: 8
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const mascotasFiltradas = mascotas.filter(mascota => {
    const cumpleBusqueda = !busqueda ||
      mascota.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      mascota.dueno.toLowerCase().includes(busqueda.toLowerCase());

    let cumpleFiltro = true;
    if (filtro === 'vacunas-pendientes') {
      cumpleFiltro = new Date(mascota.proxima_vacuna) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (filtro === 'alertas-urgentes') {
      cumpleFiltro = mascota.alertas_pendientes > 0;
    }

    return cumpleBusqueda && cumpleFiltro;
  });

  const enviarRecordatoriosManual = async () => {
    try {
      await api.post('/scheduler/run');
      alert('Recordatorios enviados exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error enviando recordatorios:', error);
      alert('Error al enviar recordatorios');
    }
  };

  if (loading) {
    return (
      <div className="admin-medical-loading">
        <div className="spinner"></div>
        <p>Cargando gestión médica...</p>
      </div>
    );
  }

  return (
    <div className="admin-medical">
      <div className="admin-medical__header">
        <h1 className="admin-medical__title">🏥 Gestión Médica</h1>

        <div className="admin-stats-grid">
          <div className="admin-stat-card admin-stat-card--primary">
            <div className="admin-stat-card__icon">🐾</div>
            <div className="admin-stat-card__content">
              <div className="admin-stat-card__value">{estadisticasGlobales.totalMascotas}</div>
              <div className="admin-stat-card__label">Mascotas Registradas</div>
            </div>
          </div>

          <div className="admin-stat-card admin-stat-card--warning">
            <div className="admin-stat-card__icon">⚠️</div>
            <div className="admin-stat-card__content">
              <div className="admin-stat-card__value">{estadisticasGlobales.alertasPendientes}</div>
              <div className="admin-stat-card__label">Alertas Pendientes</div>
            </div>
          </div>

          <div className="admin-stat-card admin-stat-card--success">
            <div className="admin-stat-card__icon">💉</div>
            <div className="admin-stat-card__content">
              <div className="admin-stat-card__value">{estadisticasGlobales.vacunasEsteMes}</div>
              <div className="admin-stat-card__label">Vacunas Este Mes</div>
            </div>
          </div>

          <div className="admin-stat-card admin-stat-card--info">
            <div className="admin-stat-card__icon">📋</div>
            <div className="admin-stat-card__content">
              <div className="admin-stat-card__value">{estadisticasGlobales.consultasEsteMes}</div>
              <div className="admin-stat-card__label">Consultas Este Mes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-medical__actions">
        <button
          className="btn btn--primary"
          onClick={enviarRecordatoriosManual}
        >
          📧 Enviar Recordatorios
        </button>
        <button className="btn btn--secondary" onClick={cargarDatos}>
          🔄 Refrescar
        </button>
      </div>

      <div className="admin-medical__filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filtro === 'todas' ? 'filter-tab--active' : ''}`}
            onClick={() => setFiltro('todas')}
          >
            Todas
          </button>
          <button
            className={`filter-tab ${filtro === 'vacunas-pendientes' ? 'filter-tab--active' : ''}`}
            onClick={() => setFiltro('vacunas-pendientes')}
          >
            💉 Vacunas Próximas
          </button>
          <button
            className={`filter-tab ${filtro === 'alertas-urgentes' ? 'filter-tab--active' : ''}`}
            onClick={() => setFiltro('alertas-urgentes')}
          >
            ⚠️ Con Alertas
          </button>
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

      <div className="admin-medical__content">
        {mascotasFiltradas.length === 0 ? (
          <div className="admin-empty-state">
            <p>No se encontraron mascotas con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="mascotas-table-wrapper">
            <table className="mascotas-table">
              <thead>
                <tr>
                  <th>Mascota</th>
                  <th>Dueño</th>
                  <th>Especie / Raza</th>
                  <th>Edad</th>
                  <th>Alertas</th>
                  <th>Última Consulta</th>
                  <th>Próxima Vacuna</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mascotasFiltradas.map((mascota) => (
                  <tr key={mascota.id}>
                    <td>
                      <div className="mascota-cell">
                        <div className="mascota-cell__icon">
                          {mascota.especie === 'Perro' ? '🐕' : '🐈'}
                        </div>
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
                    <td>{mascota.edad} años</td>
                    <td>
                      {mascota.alertas_pendientes > 0 ? (
                        <span className="alert-badge alert-badge--warning">
                          {mascota.alertas_pendientes}
                        </span>
                      ) : (
                        <span className="alert-badge alert-badge--success">0</span>
                      )}
                    </td>
                    <td>
                      {new Date(mascota.ultima_consulta).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      {new Date(mascota.proxima_vacuna).toLocaleDateString('es-ES')}
                      {new Date(mascota.proxima_vacuna) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                        <span className="vaccine-warning"> ⚠️</span>
                      )}
                    </td>
                    <td>
                      <EstadoSalud estado={mascota.estado_salud} />
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn--sm btn--primary"
                          onClick={() => window.location.href = `/mascota/${mascota.id}/expediente`}
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
        )}
      </div>

      <div className="admin-medical__summary">
        <p>
          Mostrando {mascotasFiltradas.length} de {mascotas.length} mascotas
        </p>
      </div>
    </div>
  );
}

function EstadoSalud({ estado }) {
  const config = {
    excelente: {
      icon: '✅',
      text: 'Excelente',
      class: 'estado-salud--excelente'
    },
    bueno: {
      icon: '👍',
      text: 'Bueno',
      class: 'estado-salud--bueno'
    },
    atencion: {
      icon: '⚠️',
      text: 'Requiere Atención',
      class: 'estado-salud--atencion'
    },
    critico: {
      icon: '🚨',
      text: 'Crítico',
      class: 'estado-salud--critico'
    }
  };

  const { icon, text, class: className } = config[estado] || config.bueno;

  return (
    <span className={`estado-salud ${className}`}>
      {icon} {text}
    </span>
  );
}
