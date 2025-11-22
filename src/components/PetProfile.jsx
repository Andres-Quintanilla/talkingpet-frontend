import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import '../styles/pet-profile.css';

export default function PetProfile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState(null);
  const [activeTab, setActiveTab] = useState('vacunas');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const cargarExpediente = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/medical/pet/${id}/expediente`);
      if (data.success) {
        setExpediente(data.data);
      }
    } catch (error) {
      console.error('Error cargando expediente:', error);
      if (error.response?.status === 404) {
        await crearExpedienteInicial();
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const crearExpedienteInicial = useCallback(async () => {
    try {
      await api.post(`/medical/pet/${id}/expediente`);
      await cargarExpediente();
    } catch (error) {
      console.error('Error creando expediente:', error);
    }
  }, [id, cargarExpediente]);

  useEffect(() => {
    cargarExpediente();
  }, [cargarExpediente]);

  const abrirModal = (tipo) => {
    setModalType(tipo);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setModalType('');
  };

  if (loading) {
    return (
      <div className="pet-profile-loading">
        <div className="spinner"></div>
        <p>Cargando historial médico...</p>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="pet-profile-empty">
        <h2>No se encontró el expediente</h2>
        <p>No tienes permisos o la mascota no existe.</p>
      </div>
    );
  }

  const { mascota, estadisticas } = expediente;

  return (
    <div className="pet-profile-page">
      <div className="pet-profile-header">
        <div className="container">
          <div className="pet-profile-header__content">
            <div className="pet-profile-header__info">
              <h1 className="pet-profile-header__name">🐾 {mascota.nombre}</h1>
              <div className="pet-profile-header__meta">
                <span className="badge badge--primary">{mascota.especie}</span>
                <span className="badge badge--accent">
                  {mascota.raza || 'Sin raza'}
                </span>
                <span className="pet-profile-header__age">
                  {mascota.edad} {mascota.edad === 1 ? 'año' : 'años'}
                </span>
              </div>
            </div>
            <div className="pet-profile-header__stats">
              <div className="stat-card">
                <div className="stat-card__icon">💉</div>
                <div className="stat-card__value">
                  {estadisticas.total_vacunas}
                </div>
                <div className="stat-card__label">Vacunas</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">📋</div>
                <div className="stat-card__value">
                  {estadisticas.total_consultas}
                </div>
                <div className="stat-card__label">Consultas</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">⚠️</div>
                <div className="stat-card__value">
                  {estadisticas.alertas_pendientes}
                </div>
                <div className="stat-card__label">Alertas</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">⚖️</div>
                <div className="stat-card__value">
                  {estadisticas.peso_actual} kg
                </div>
                <div className="stat-card__label">Peso Actual</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pet-profile-tabs">
        <div className="container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'vacunas' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('vacunas')}
            >
              💉 Vacunas
            </button>
            <button
              className={`tab ${activeTab === 'consultas' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('consultas')}
            >
              🏥 Consultas
            </button>
            <button
              className={`tab ${activeTab === 'medicamentos' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('medicamentos')}
            >
              💊 Medicamentos
            </button>
            <button
              className={`tab ${activeTab === 'peso' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('peso')}
            >
              📊 Peso
            </button>
            <button
              className={`tab ${activeTab === 'alergias' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('alergias')}
            >
              🚫 Alergias
            </button>
            <button
              className={`tab ${activeTab === 'documentos' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('documentos')}
            >
              📄 Documentos
            </button>
            <button
              className={`tab ${activeTab === 'alertas' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('alertas')}
            >
              🔔 Alertas
            </button>
          </div>
        </div>
      </div>

      <div className="pet-profile-content">
        <div className="container">
          {activeTab === 'vacunas' && (
            <TabVacunas
              vacunas={expediente.vacunas}
              onAdd={() => abrirModal('vacuna')}
              onRefresh={cargarExpediente}
            />
          )}
          {activeTab === 'consultas' && (
            <TabConsultas
              consultas={expediente.consultas}
              onAdd={() => abrirModal('consulta')}
            />
          )}
          {activeTab === 'medicamentos' && (
            <TabMedicamentos
              medicamentos={expediente.medicamentos}
              onAdd={() => abrirModal('medicamento')}
            />
          )}
          {activeTab === 'peso' && (
            <TabPeso
              historial={expediente.peso}
              onAdd={() => abrirModal('peso')}
              onRefresh={cargarExpediente}
            />
          )}
          {activeTab === 'alergias' && (
            <TabAlergias
              alergias={expediente.alergias}
              onAdd={() => abrirModal('alergia')}
            />
          )}
          {activeTab === 'documentos' && (
            <TabDocumentos
              documentos={expediente.documentos}
              onAdd={() => abrirModal('documento')}
            />
          )}
          {activeTab === 'alertas' && (
            <TabAlertas alertas={expediente.alertas} onRefresh={cargarExpediente} />
          )}
        </div>
      </div>

      {showModal && (
        <ModalAgregar
          tipo={modalType}
          mascotaId={id}
          onClose={cerrarModal}
          onSuccess={() => {
            cerrarModal();
            cargarExpediente();
          }}
        />
      )}
    </div>
  );
}

function TabVacunas({ vacunas, onAdd, onRefresh }) {
  return (
    <div className="tab-content">
      <div className="tab-content__header">
        <h2>Historial de Vacunas</h2>
        <div className="tab-content__actions">
          <button className="btn btn--secondary" onClick={onRefresh}>
            ⟳ Actualizar
          </button>
          <button className="btn btn--primary" onClick={onAdd}>
            + Agregar Vacuna
          </button>
        </div>
      </div>

      {vacunas.length === 0 ? (
        <div className="empty-state">
          <p>No hay vacunas registradas</p>
          <button className="btn btn--secondary" onClick={onAdd}>
            Agregar primera vacuna
          </button>
        </div>
      ) : (
        <div className="medical-records-grid">
          {vacunas.map((vacuna) => (
            <div key={vacuna.id} className="medical-card">
              <div className="medical-card__header">
                <h3>💉 {vacuna.vacuna}</h3>
                <span
                  className={`badge ${
                    vacuna.proxima_dosis_vencida ? 'badge--danger' : 'badge--success'
                  }`}
                >
                  {vacuna.proxima_dosis_vencida ? 'Vencida' : 'Al día'}
                </span>
              </div>
              <div className="medical-card__body">
                <p>
                  <strong>Aplicada:</strong>{' '}
                  {new Date(vacuna.fecha_aplicacion).toLocaleDateString('es-ES')}
                </p>
                {vacuna.proxima_dosis && (
                  <p>
                    <strong>Próxima dosis:</strong>{' '}
                    {new Date(vacuna.proxima_dosis).toLocaleDateString('es-ES')}
                  </p>
                )}
                <p>
                  <strong>Veterinario:</strong> {vacuna.veterinario || 'No especificado'}
                </p>
                <p>
                  <strong>Clínica:</strong> {vacuna.clinica || 'No especificada'}
                </p>
                {vacuna.observaciones && (
                  <p className="medical-card__notes">{vacuna.observaciones}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabConsultas({ consultas, onAdd }) {
  return (
    <div className="tab-content">
      <div className="tab-content__header">
        <h2>Historial de Consultas</h2>
        <button className="btn btn--primary" onClick={onAdd}>
          + Agregar Consulta
        </button>
      </div>

      {consultas.length === 0 ? (
        <div className="empty-state">
          <p>No hay consultas registradas</p>
        </div>
      ) : (
        <div className="medical-timeline">
          {consultas.map((consulta) => (
            <div key={consulta.id} className="timeline-item">
              <div className="timeline-item__date">
                {new Date(consulta.fecha).toLocaleDateString('es-ES')}
              </div>
              <div className="timeline-item__content">
                <h3>🏥 {consulta.motivo}</h3>
                <p>
                  <strong>Veterinario:</strong> {consulta.veterinario}
                </p>
                <p>
                  <strong>Diagnóstico:</strong> {consulta.diagnostico || 'No especificado'}
                </p>
                {consulta.tratamiento && (
                  <p>
                    <strong>Tratamiento:</strong> {consulta.tratamiento}
                  </p>
                )}
                {consulta.peso && (
                  <p>
                    <strong>Peso:</strong> {consulta.peso} kg
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabMedicamentos({ medicamentos, onAdd }) {
  return (
    <div className="tab-content">
      <div className="tab-content__header">
        <h2>Medicamentos Activos</h2>
        <button className="btn btn--primary" onClick={onAdd}>
          + Agregar Medicamento
        </button>
      </div>

      {medicamentos.length === 0 ? (
        <div className="empty-state">
          <p>No hay medicamentos activos</p>
        </div>
      ) : (
        <div className="medical-records-grid">
          {medicamentos.map((med) => (
            <div key={med.id} className="medical-card">
              <div className="medical-card__header">
                <h3>💊 {med.medicamento}</h3>
                <span className="badge badge--accent">Activo</span>
              </div>
              <div className="medical-card__body">
                <p>
                  <strong>Dosis:</strong> {med.dosis}
                </p>
                <p>
                  <strong>Frecuencia:</strong> {med.frecuencia}
                </p>
                <p>
                  <strong>Desde:</strong>{' '}
                  {new Date(med.fecha_inicio).toLocaleDateString('es-ES')}
                </p>
                <p>
                  <strong>Hasta:</strong>{' '}
                  {new Date(med.fecha_fin).toLocaleDateString('es-ES')}
                </p>
                {med.indicaciones && (
                  <p className="medical-card__notes">
                    <strong>Indicaciones:</strong> {med.indicaciones}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabPeso({ historial, onAdd }) {
  return (
    <div className="tab-content">
      <div className="tab-content__header">
        <h2>Historial de Peso</h2>
        <button className="btn btn--primary" onClick={onAdd}>
          + Registrar Peso
        </button>
      </div>

      {historial.length === 0 ? (
        <div className="empty-state">
          <p>No hay registros de peso</p>
        </div>
      ) : (
        <>
          <div className="peso-chart">
            <div className="peso-chart__bars">
              {historial.slice(-10).map((registro) => {
                const maxPeso = Math.max(...historial.map((r) => r.peso));
                const altura = (registro.peso / maxPeso) * 100;
                return (
                  <div key={registro.id} className="peso-chart__bar-wrapper">
                    <div
                      className="peso-chart__bar"
                      style={{ height: `${altura}%` }}
                      title={`${registro.peso} kg`}
                    >
                      <span className="peso-chart__value">{registro.peso}</span>
                    </div>
                    <span className="peso-chart__label">
                      {new Date(registro.fecha).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <table className="medical-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Peso</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((registro) => (
                <tr key={registro.id}>
                  <td>
                    {new Date(registro.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td>
                    <strong>{registro.peso} kg</strong>
                  </td>
                  <td>{registro.observaciones || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
