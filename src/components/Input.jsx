export function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm text-gray-700">{label}</span>
      )}
      <input
        className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400 ${className}`}
        {...props}
      />
    </label>
  );
}
