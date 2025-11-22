export default function ConfirmModal({
  open,
  title = "Confirmar acción",
  message = "¿Estás seguro?",
  onCancel,
  onConfirm
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "var(--color-bg)",
          padding: "2rem",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>{title}</h2>
        <p style={{ marginBottom: "1.5rem", color: "var(--color-text-light)" }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button className="btn btn--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn--danger" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
