export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl">
        <div className="text-sm font-semibold">{title}</div>

        {message && <div className="mt-2 text-sm text-gray-600">{message}</div>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-800"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`flex-1 rounded-xl py-3 text-sm font-medium text-white ${
              destructive ? "bg-red-600" : "bg-black"
            } ${loading ? "opacity-70" : ""}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
