export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const base =
    "w-full rounded-xl px-4 py-3 text-base font-medium active:scale-[0.99] transition";
  const variants = {
    primary: "bg-black text-white",
    secondary: "bg-gray-100 text-gray-900",
    danger: "bg-red-600 text-white",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
