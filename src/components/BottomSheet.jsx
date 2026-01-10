export function BottomSheet({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={onClose}
      />

      {/* sheet */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-200" />
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">{title}</div>
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm bg-gray-100"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
