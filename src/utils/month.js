export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function formatMonthLabel(date) {
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" })
    .format(date)
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function toISODate(date) {
  // yyyy-mm-dd
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthRangeISO(date) {
  const from = toISODate(startOfMonth(date));
  const to = toISODate(endOfMonth(date));
  return { from, to };
}
