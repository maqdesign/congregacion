/**
 * Mi Congregación · modelo de presentación de Agenda.
 * Consume únicamente items YA autorizados y proyectados por authorized-feed.mjs.
 * No concede acceso, no lee almacenamiento y nunca consulta una API.
 */
const FILTERS = new Set(["todo", "reuniones", "servicio", "mis_asignaciones"]);
const STATES = new Set(["unlinked", "loading", "ready", "forbidden", "unavailable"]);
const CATEGORIES = new Set(["reuniones", "servicio", "eventos", "limpieza", "asignaciones"]);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const MESSAGES = {
  es: {
    unlinked: "Tu congregación todavía no está vinculada.",
    loading: "Consultando actividades autorizadas…",
    forbidden: "No tienes acceso a esta Agenda. Revisa tu vinculación.",
    unavailable: "No pudimos actualizar la Agenda. Inténtalo más tarde.",
    empty: "No hay actividades publicadas para esta selección."
  },
  en: {
    unlinked: "Your congregation is not linked yet.",
    loading: "Loading authorized activities…",
    forbidden: "You cannot access this calendar. Check your membership.",
    unavailable: "We could not update the calendar. Try again later.",
    empty: "No published activities match this selection."
  }
};
function validDate(s) {
  if (typeof s !== "string" || !DATE.test(s)) return false;
  const stamp = Date.parse(s + "T00:00:00Z");
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === s;
}
function safeText(s) { return typeof s === "string" ? s.trim().slice(0, 160) : ""; }
function cleanItem(row) {
  if (!row || typeof row !== "object" || !validDate(row.date) ||
      !TIME.test(row.time ?? "") || !CATEGORIES.has(row.category) ||
      typeof row.id !== "string" || !row.id) return null;
  // Defense in depth: never render an assignment without explicit own-person flag.
  if (row.category === "asignaciones" && row.isMine !== true) return null;
  return Object.freeze({
    id: row.id, category: row.category, date: row.date, time: row.time,
    title: safeText(row.title), place: safeText(row.place),
    changed: row.changed === true, isMine: row.isMine === true
  });
}
/**
 * status must reflect actual connection state, never infer it from an empty list.
 * today/nowTime must be calculated in the congregation's authorized time zone.
 */
export function prepareAgendaView({
  status = "unlinked", items = [], filter = "todo", selectedDate = null,
  language = "es", today = null, nowTime = "00:00"
} = {}) {
  if (!STATES.has(status) || !FILTERS.has(filter) ||
      (selectedDate !== null && !validDate(selectedDate)) ||
      (today !== null && !validDate(today)) || !TIME.test(nowTime) ||
      !Array.isArray(items)) throw new TypeError("Invalid agenda view input");
  const labels = MESSAGES[language === "en" ? "en" : "es"];
  if (status !== "ready") {
    return Object.freeze({
      status, message: labels[status], events: Object.freeze([]),
      next: null, dayCounts: Object.freeze({}), filter, selectedDate
    });
  }
  const all = items.map(cleanItem).filter(Boolean)
    .sort((a, b) => (a.date + a.time + a.id).localeCompare(b.date + b.time + b.id));
  const counts = {};
  for (const item of all) counts[item.date] = (counts[item.date] || 0) + 1;
  const filtered = all.filter(item =>
    (filter === "todo" || (filter === "mis_asignaciones"
      ? item.category === "asignaciones" : item.category === filter)) &&
    (selectedDate === null || item.date === selectedDate)
  );
  const next = today === null ? null : all.find(item =>
    item.date > today || (item.date === today && item.time >= nowTime)) || null;
  return Object.freeze({
    status, message: filtered.length ? "" : labels.empty,
    events: Object.freeze(filtered), next,
    dayCounts: Object.freeze(counts), filter, selectedDate
  });
}
