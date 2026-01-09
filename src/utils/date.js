export function formatISODate(d) {
  // d: Date
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfMonthISO(year, monthIndex0) {
  return formatISODate(new Date(year, monthIndex0, 1));
}

export function endOfMonthISO(year, monthIndex0) {
  return formatISODate(new Date(year, monthIndex0 + 1, 0));
}

export function monthLabel(year, monthIndex0) {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${months[monthIndex0]} ${year}`;
}
