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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${months[monthIndex0]} ${year}`;
}

const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatShortDate(isoDate) {
  if (!isoDate) return "";
  // isoDate esperado: "2026-01-14"
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate; // fallback si viene raro
  return `${d}/${MONTHS_EN[m - 1]}`;
}
