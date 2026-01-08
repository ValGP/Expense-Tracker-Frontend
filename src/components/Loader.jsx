export function Loader({ text = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center py-8 text-sm text-gray-600">
      {text}
    </div>
  );
}
