import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/VaccinationCard.css';
import SEO from '../components/SEO';

const VaccinationCard = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [vacunas, setVacunas] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [alergias, setAlergias] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('vacunas');

  // Definición de vacunas obligatorias según especie
  const vacunasObligatorias = {
    perro: [
      { nombre: 'Rabia', obligatoria: true, edadAplicacion: '12-16 semanas' },
      { nombre: 'Parvovirus', obligatoria: true, edadAplicacion: '6-8 semanas' },
      { nombre: 'Moquillo', obligatoria: true, edadAplicacion: '6-8 semanas' },
      { nombre: 'Hepatitis', obligatoria: true, edadAplicacion: '6-8 semanas' },
      { nombre: 'Leptospirosis', obligatoria: true, edadAplicacion: '12 semanas' },
      { nombre: 'Bordetella', obligatoria: false, edadAplicacion: '16 semanas' },
      { nombre: 'Coronavirus', obligatoria: false, edadAplicacion: '6-8 semanas' }
    ],
    gato: [
      { nombre: 'Rabia', obligatoria: true, edadAplicacion: '12-16 semanas' },
      { nombre: 'Panleucopenia', obligatoria: true, edadAplicacion: '6-8 semanas' },
      { nombre: 'Rinotraqueitis', obligatoria: true, edadAplicacion: '6-8 semanas' },
      { nombre: 'Calicivirus', obligatoria: true, edadAplicacion: '6-8 semanas' },
      { nombre: 'Leucemia Felina', obligatoria: false, edadAplicacion: '8-12 semanas' }
    ]
  };

  useEffect(() => {
    fetchPetData();
  }, [petId]);

  const fetchPetData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos de la mascota
      const petsResponse = await api.get('/api/medical/mis-mascotas');
      const selectedPet = petsResponse.data.find(p => p.id === parseInt(petId));
      
      if (!selectedPet) {
        setError('Mascota no encontrada');
        return;
      }
      
      setPet(selectedPet);

      // Obtener expediente completo
      const [vacunasRes, consultasRes, medicamentosRes, alergiasRes] = await Promise.all([
        api.get(`/api/medical/pet/${petId}/vacunas`),
        api.get(`/api/medical/pet/${petId}/consultas`),
        api.get(`/api/medical/pet/${petId}/medicamentos`),
        api.get(`/api/medical/pet/${petId}/alergias`)
      ]);

      setVacunas(vacunasRes.data.data || vacunasRes.data || []);
      setConsultas(consultasRes.data.data || consultasRes.data || []);
      setMedicamentos(medicamentosRes.data.data || medicamentosRes.data || []);
      setAlergias(alergiasRes.data.data || alergiasRes.data || []);

    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar la información de la mascota');
    } finally {
      setLoading(false);
    }
  };

  const getVacunasObligatorias = () => {
    if (!pet) return [];
    const especieLower = pet.especie?.toLowerCase();
    return vacunasObligatorias[especieLower] || [];
  };

  const getEstadoVacuna = (nombreVacuna) => {
    const vacunaAplicada = vacunas.find(v => 
      v.vacuna.toLowerCase().includes(nombreVacuna.toLowerCase())
    );
    
    if (!vacunaAplicada) return { estado: 'pendiente', data: null };
    
    if (vacunaAplicada.estado === 'vencida') return { estado: 'vencida', data: vacunaAplicada };
    if (vacunaAplicada.proxima_dosis && new Date(vacunaAplicada.proxima_dosis) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      return { estado: 'proxima', data: vacunaAplicada };
    }
    
    return { estado: 'aplicada', data: vacunaAplicada };
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'aplicada': return 'badge-success';
      case 'vencida': return 'badge-danger';
      case 'proxima': return 'badge-warning';
      case 'pendiente': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="vaccination-card-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando cartilla de vacunación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vaccination-card-container">
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => navigate('/mis-mascotas')} className="btn-primary">
            Volver a Mis Mascotas
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`Cartilla de Vacunación - ${pet?.nombre} | TalkingPet`}
        description={`Historial médico y cartilla de vacunación de ${pet?.nombre}`}
      />
      
      <div className="vaccination-card-container">
        {/* Header con info de la mascota */}
        <div className="pet-header">
          <button onClick={() => navigate('/mis-mascotas')} className="btn-back">
            <i className="fas fa-arrow-left"></i> Volver
          </button>
          
          <div className="pet-info-header">
            <div className="pet-avatar">
              <i className="fas fa-paw"></i>
            </div>
            <div className="pet-details">
              <h1>{pet?.nombre}</h1>
              <p className="pet-meta">
                <span><strong>Especie:</strong> {pet?.especie}</span>
                {pet?.raza && <span><strong>Raza:</strong> {pet.raza}</span>}
                {pet?.edad && <span><strong>Edad:</strong> {pet.edad} años</span>}
                {pet?.genero && <span><strong>Género:</strong> {pet.genero === 'macho' ? 'Macho' : 'Hembra'}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'vacunas' ? 'active' : ''}`}
            onClick={() => setActiveTab('vacunas')}
          >
            <i className="fas fa-syringe"></i> Vacunas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tratamientos' ? 'active' : ''}`}
            onClick={() => setActiveTab('tratamientos')}
          >
            <i className="fas fa-pills"></i> Tratamientos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            <i className="fas fa-notes-medical"></i> Historial Médico
          </button>
        </div>

        {/* Contenido de los tabs */}
        <div className="tab-content">
          
          {/* TAB: VACUNAS */}
          {activeTab === 'vacunas' && (
            <div className="vacunas-section">
              
              {/* Vacunas Obligatorias */}
              <div className="card vacunas-obligatorias">
                <div className="card-header">
                  <h2><i className="fas fa-shield-virus"></i> Vacunas Obligatorias</h2>
                  <p className="subtitle">Vacunas esenciales para la salud de tu mascota</p>
                </div>
                <div className="card-body">
                  {getVacunasObligatorias().filter(v => v.obligatoria).length === 0 ? (
                    <p className="empty-message">No hay vacunas obligatorias definidas para esta especie.</p>
                  ) : (
                    <div className="vacunas-grid">
                      {getVacunasObligatorias()
                        .filter(v => v.obligatoria)
                        .map((vacuna, idx) => {
                          const { estado, data } = getEstadoVacuna(vacuna.nombre);
                          return (
                            <div key={idx} className={`vacuna-card ${estado}`}>
                              <div className="vacuna-header">
                                <h3>{vacuna.nombre}</h3>
                                <span className={`badge ${getEstadoBadgeClass(estado)}`}>
                                  {estado === 'aplicada' && '✓ Aplicada'}
                                  {estado === 'vencida' && '⚠ Vencida'}
                                  {estado === 'proxima' && '📅 Próxima dosis'}
                                  {estado === 'pendiente' && '⏳ Pendiente'}
                                </span>
                              </div>
                              <div className="vacuna-body">
                                <p><strong>Edad de aplicación:</strong> {vacuna.edadAplicacion}</p>
                                {data && (
                                  <>
                                    <p><strong>Fecha de aplicación:</strong> {formatFecha(data.fecha_aplicacion)}</p>
                                    {data.proxima_dosis && (
                                      <p><strong>Próxima dosis:</strong> {formatFecha(data.proxima_dosis)}</p>
                                    )}
                                    {data.veterinario && (
                                      <p><strong>Veterinario:</strong> {data.veterinario}</p>
                                    )}
                                    {data.lote && (
                                      <p className="lote"><strong>Lote:</strong> {data.lote}</p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* Vacunas Opcionales/Futuras */}
              <div className="card vacunas-opcionales">
                <div className="card-header">
                  <h2><i className="fas fa-calendar-plus"></i> Vacunas Opcionales y Refuerzos</h2>
                  <p className="subtitle">Vacunas recomendadas según necesidades específicas</p>
                </div>
                <div className="card-body">
                  {getVacunasObligatorias().filter(v => !v.obligatoria).length === 0 ? (
                    <p className="empty-message">No hay vacunas opcionales definidas para esta especie.</p>
                  ) : (
                    <div className="vacunas-grid">
                      {getVacunasObligatorias()
                        .filter(v => !v.obligatoria)
                        .map((vacuna, idx) => {
                          const { estado, data } = getEstadoVacuna(vacuna.nombre);
                          return (
                            <div key={idx} className={`vacuna-card ${estado}`}>
                              <div className="vacuna-header">
                                <h3>{vacuna.nombre}</h3>
                                <span className={`badge ${getEstadoBadgeClass(estado)}`}>
                                  {estado === 'aplicada' && '✓ Aplicada'}
                                  {estado === 'vencida' && '⚠ Vencida'}
                                  {estado === 'proxima' && '📅 Próxima dosis'}
                                  {estado === 'pendiente' && '⏳ Pendiente'}
                                </span>
                              </div>
                              <div className="vacuna-body">
                                <p><strong>Edad recomendada:</strong> {vacuna.edadAplicacion}</p>
                                {data && (
                                  <>
                                    <p><strong>Fecha de aplicación:</strong> {formatFecha(data.fecha_aplicacion)}</p>
                                    {data.proxima_dosis && (
                                      <p><strong>Próxima dosis:</strong> {formatFecha(data.proxima_dosis)}</p>
                                    )}
                                    {data.veterinario && (
                                      <p><strong>Veterinario:</strong> {data.veterinario}</p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* Otras Vacunas Aplicadas */}
              {vacunas.filter(v => !getVacunasObligatorias().some(vo => 
                v.vacuna.toLowerCase().includes(vo.nombre.toLowerCase())
              )).length > 0 && (
                <div className="card otras-vacunas">
                  <div className="card-header">
                    <h2><i className="fas fa-list"></i> Otras Vacunas Aplicadas</h2>
                  </div>
                  <div className="card-body">
                    <div className="vacunas-list">
                      {vacunas
                        .filter(v => !getVacunasObligatorias().some(vo => 
                          v.vacuna.toLowerCase().includes(vo.nombre.toLowerCase())
                        ))
                        .map((vacuna) => (
                          <div key={vacuna.id} className="vacuna-item">
                            <div className="vacuna-item-header">
                              <h4>{vacuna.vacuna}</h4>
                              <span className={`badge ${getEstadoBadgeClass(vacuna.estado)}`}>
                                {vacuna.estado}
                              </span>
                            </div>
                            <div className="vacuna-item-details">
                              <p><strong>Aplicada:</strong> {formatFecha(vacuna.fecha_aplicacion)}</p>
                              {vacuna.proxima_dosis && (
                                <p><strong>Próxima dosis:</strong> {formatFecha(vacuna.proxima_dosis)}</p>
                              )}
                              {vacuna.veterinario && <p><strong>Veterinario:</strong> {vacuna.veterinario}</p>}
                              {vacuna.clinica && <p><strong>Clínica:</strong> {vacuna.clinica}</p>}
                              {vacuna.observaciones && (
                                <p className="observaciones"><strong>Observaciones:</strong> {vacuna.observaciones}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: TRATAMIENTOS */}
          {activeTab === 'tratamientos' && (
            <div className="tratamientos-section">
              
              {/* Alergias */}
              {alergias.length > 0 && (
                <div className="card alergias-card">
                  <div className="card-header alert-header">
                    <h2><i className="fas fa-exclamation-triangle"></i> Alergias Conocidas</h2>
                    <p className="subtitle">Información importante para tratamientos</p>
                  </div>
                  <div className="card-body">
                    <div className="alergias-list">
                      {alergias.map((alergia) => (
                        <div key={alergia.id} className={`alergia-item severidad-${alergia.severidad}`}>
                          <div className="alergia-icon">
                            <i className="fas fa-exclamation-circle"></i>
                          </div>
                          <div className="alergia-info">
                            <h4>{alergia.alergia}</h4>
                            <p><strong>Tipo:</strong> {alergia.tipo}</p>
                            <p><strong>Severidad:</strong> <span className={`severidad ${alergia.severidad}`}>{alergia.severidad}</span></p>
                            {alergia.sintomas && <p><strong>Síntomas:</strong> {alergia.sintomas}</p>}
                            <p className="fecha-small">Diagnosticada: {formatFecha(alergia.fecha_diagnostico)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Medicamentos Activos */}
              <div className="card medicamentos-card">
                <div className="card-header">
                  <h2><i className="fas fa-pills"></i> Medicamentos Activos</h2>
                  <p className="subtitle">Tratamientos en curso</p>
                </div>
                <div className="card-body">
                  {medicamentos.length === 0 ? (
                    <p className="empty-message">No hay medicamentos activos registrados.</p>
                  ) : (
                    <div className="medicamentos-list">
                      {medicamentos.map((med) => (
                        <div key={med.id} className="medicamento-item">
                          <div className="medicamento-header">
                            <h4>{med.medicamento}</h4>
                            <span className="badge badge-success">Activo</span>
                          </div>
                          <div className="medicamento-details">
                            {med.dosis && <p><strong>Dosis:</strong> {med.dosis}</p>}
                            {med.frecuencia && <p><strong>Frecuencia:</strong> {med.frecuencia}</p>}
                            <p><strong>Inicio:</strong> {formatFecha(med.fecha_inicio)}</p>
                            {med.fecha_fin && <p><strong>Fin:</strong> {formatFecha(med.fecha_fin)}</p>}
                            {med.indicaciones && (
                              <p className="indicaciones"><strong>Indicaciones:</strong> {med.indicaciones}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: HISTORIAL MÉDICO */}
          {activeTab === 'historial' && (
            <div className="historial-section">
              <div className="card consultas-card">
                <div className="card-header">
                  <h2><i className="fas fa-notes-medical"></i> Historial de Consultas</h2>
                  <p className="subtitle">Registro completo de visitas veterinarias</p>
                </div>
                <div className="card-body">
                  {consultas.length === 0 ? (
                    <p className="empty-message">No hay consultas registradas.</p>
                  ) : (
                    <div className="consultas-timeline">
                      {consultas.map((consulta) => (
                        <div key={consulta.id} className="consulta-item">
                          <div className="consulta-date">
                            <div className="date-badge">
                              {new Date(consulta.fecha_consulta).getDate()}
                              <span>{new Date(consulta.fecha_consulta).toLocaleDateString('es-BO', { month: 'short' })}</span>
                            </div>
                          </div>
                          <div className="consulta-content">
                            <div className="consulta-header">
                              <h4>{consulta.motivo || 'Consulta general'}</h4>
                              {consulta.veterinario && (
                                <p className="veterinario">Dr/a. {consulta.veterinario}</p>
                              )}
                            </div>
                            <div className="consulta-details">
                              {consulta.diagnostico && (
                                <p><strong>Diagnóstico:</strong> {consulta.diagnostico}</p>
                              )}
                              {consulta.tratamiento && (
                                <p><strong>Tratamiento:</strong> {consulta.tratamiento}</p>
                              )}

                              {consulta.observaciones && (
                                <p className="observaciones"><strong>Observaciones:</strong> {consulta.observaciones}</p>
                              )}
                              {consulta.clinica && (
                                <p className="text-muted"><i className="fas fa-hospital"></i> {consulta.clinica}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VaccinationCard;
