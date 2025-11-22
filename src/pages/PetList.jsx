import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/SEO';
import { useForm } from 'react-hook-form';
import { PlusCircle, Heart } from 'lucide-react';

export default function PetList() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchPets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/medical/mis-mascotas');
      setPets(data);
    } catch (err) {
      console.error('Error cargando mascotas:', err);
      setError('No se pudieron cargar tus mascotas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const onPetSubmit = async (data) => {
    try {
      setError('');

      const payload = {
        nombre: data.nombre,
        especie: data.especie,
        genero: data.genero,
        raza: data.raza || null,
        edad:
          typeof data.edad === 'number'
            ? data.edad
            : data.edad
              ? Number(data.edad)
              : null,
      };

      const { data: nuevaMascota } = await api.post(
        '/api/medical/mascotas',
        payload
      );

      setPets((prev) => [...prev, nuevaMascota]);
      reset();
      setShowModal(false);
    } catch (err) {
      console.error('Error creando mascota:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al crear la mascota.'
      );
    }
  };

  return (
    <>
      <SEO title="Mis Mascotas" url="http://localhost:5173/mis-mascotas" />
      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">🐾 Mis Mascotas</h1>
          <p className="page-header__subtitle">
            Administra la información básica de tus mascotas. Nuestro equipo se
            encargará de completar el historial médico en la próxima cita.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="tab-content__header">
          <h2>Tus Mascotas Registradas</h2>
          <button
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <PlusCircle size={18} /> Registrar Nueva Mascota
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando mascotas...</p>
          </div>
        )}

        {!loading && pets.length === 0 && (
          <div className="empty-state">
            <Heart size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>Aún no has registrado ninguna mascota.</p>
            <button
              className="btn btn--primary"
              onClick={() => setShowModal(true)}
            >
              Registrar mi primera mascota
            </button>
          </div>
        )}

        <div className="medical-records-grid">
          {pets.map((pet) => (
            <article
              key={pet.id}
              className="pet-card"
              onClick={() => navigate(`/mis-mascotas/${pet.id}`)}
            >
              <header className="pet-card__header">
                <div className="pet-card__icon">
                  {pet.especie === 'perro' ? '🐶' : pet.especie === 'gato' ? '🐱' : '🐾'}
                </div>
                <h3 className="pet-card__title">{pet.nombre}</h3>
              </header>

              <div className="pet-card__body">
                <p><strong>Raza:</strong> {pet.raza || 'No especificada'}</p>
                <p><strong>Edad:</strong> {pet.edad ? `${pet.edad} año(s)` : 'No registrada'}</p>
                <p><strong>Género:</strong> {pet.genero === 'macho' ? 'Macho' : 'Hembra'}</p>
              </div>

              <footer className="pet-card__footer">
                <button
                  type="button"
                  className="btn btn--outline-primary btn--sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/mis-mascotas/${pet.id}`);
                  }}
                >
                  Ver Cartilla Médica
                </button>
              </footer>
            </article>
          ))}
        </div>
      </div>


      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface, #fff)',
              maxWidth: '480px',
              width: '90%',
              margin: '6vh auto',
              borderRadius: '1.25rem',
              padding: '1.75rem',
              boxShadow: '0 18px 45px rgba(0,0,0,0.18)',
            }}
          >
            <div className="modal__header">
              <h2>Registrar Nueva Mascota</h2>
              <button
                className="modal__close"
                type="button"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal__body">
              <form onSubmit={handleSubmit(onPetSubmit)}>
                {error && <p className="form-error">{error}</p>}

                <div className="form-group">
                  <label className="form-label" htmlFor="nombre">
                    Nombre *
                  </label>
                  <input
                    id="nombre"
                    className="form-input"
                    {...register('nombre', {
                      required: 'El nombre es requerido',
                      maxLength: {
                        value: 100,
                        message: 'Máximo 100 caracteres',
                      },
                    })}
                    placeholder="Ej. Firulais"
                  />
                  {errors.nombre && (
                    <p className="form-error">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="especie">
                      Especie *
                    </label>
                    <select
                      id="especie"
                      className="form-input"
                      {...register('especie', {
                        required: 'La especie es requerida',
                      })}
                    >
                      <option value="perro">Perro</option>
                      <option value="gato">Gato</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="genero">
                      Género *
                    </label>
                    <select
                      id="genero"
                      className="form-input"
                      {...register('genero', {
                        required: 'El género es requerido',
                      })}
                    >
                      <option value="macho">Macho</option>
                      <option value="hembra">Hembra</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="raza">
                      Raza
                    </label>
                    <input
                      id="raza"
                      className="form-input"
                      {...register('raza')}
                      placeholder="Ej. Labrador, Persa..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edad">
                      Edad (años)
                    </label>
                    <input
                      id="edad"
                      type="number"
                      className="form-input"
                      {...register('edad', { valueAsNumber: true, min: 0, max: 30 })}
                      placeholder="Ej. 2"
                    />
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: 0 }}>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Mascota'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
