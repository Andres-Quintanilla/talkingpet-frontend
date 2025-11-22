import { useRef, useState } from 'react';
import api from '../api/axios';

export default function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/api/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data?.url) {
        onChange(data.url);
      } else {
        setError('El servidor no devolvió la URL de la imagen.');
      }
    } catch (err) {
      console.error('Error subiendo imagen', err);
      setError('No se pudo subir la imagen. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlChange = (e) => {
    setError('');
    onChange(e.target.value);
  };

  return (
    <div className="image-uploader">
      <label className="form-label">Imagen del producto</label>

      <div
        className="image-uploader__dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <p className="image-uploader__text">
          Arrastra una imagen aquí o haz clic para elegir desde tu equipo.
        </p>
        {uploading && (
          <p className="image-uploader__uploading">Subiendo imagen...</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      <div className="image-uploader__url">
        <label className="form-label" htmlFor="imagen_url">
          O pega la URL de la imagen
        </label>
        <input
          id="imagen_url"
          type="text"
          className="form-input"
          placeholder="url de la imagen"
          value={value || ''}
          onChange={handleUrlChange}
        />
      </div>

      {error && (
        <p className="form-error" style={{ marginTop: '0.5rem' }}>
          {error}
        </p>
      )}

      {value && (
        <div className="image-uploader__preview">
          <p className="form-note">Vista previa:</p>
          <img src={value} alt="Vista previa del producto" />
        </div>
      )}
    </div>
  );
}
