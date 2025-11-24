// src/components/VideoUploader.jsx
import { useRef, useState } from 'react';
import api from '../api/axios';

export default function VideoUploader({ value, onChange, label = 'Video del curso' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      let url = data.url;

      // Si el backend devuelve ruta relativa (/uploads/xxx),
      // la convertimos a URL absoluta usando VITE_API_BASE_URL
      if (url && !url.startsWith('http')) {
        const base = import.meta.env.VITE_API_BASE_URL || '';
        url = base.replace(/\/$/, '') + url;
      }

      setFileName(file.name);
      if (onChange) onChange(url);
    } catch (err) {
      console.error('Error subiendo video', err);
      setError(
        err.response?.data?.error ||
          'No se pudo subir el video. Intenta de nuevo.'
      );
    } finally {
      setUploading(false);
      // Limpiar para permitir volver a elegir el mismo archivo
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="video-uploader">
      <label className="form-label">{label}</label>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleClick}
          disabled={uploading}
        >
          {uploading ? 'Subiendo...' : 'Subir archivo de video'}
        </button>

        {fileName && (
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-light)',
            }}
          >
            {fileName}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <p className="form-note">
        Acepta archivos de video (por ej. MP4). El archivo se guardará en el
        servidor y se usará como video principal del curso.
      </p>

      {error && <div className="form-error">{error}</div>}

      {value && (
        <div
          style={{
            marginTop: '0.75rem',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          <video
            src={value}
            controls
            style={{ width: '100%', maxHeight: 240, display: 'block' }}
          />
          <p className="form-note">
            Vista previa del video actual. (URL: {value})
          </p>
        </div>
      )}
    </div>
  );
}
