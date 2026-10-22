/**
 * Mi Congregación: proyección local de información YA AUTORIZADA por sus productores.
 * NO es una API, un sistema de permisos, ni una fuente de verdad.
 * Las verificaciones del servidor/Core siguen siendo obligatorias.
 */
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const CATEGORIES = new Set(["reuniones", "servicio", "eventos", "limpieza", "asignaciones"]);
const SOURCES = new Set(["reuniones", "servicio", "eventos"]);
const FILTERS = new Set(["todo", "reuniones", "servicio", "mis_asignaciones"]);
const DAY_MS = 86400000;

export function validDate(value) {
  if (typeof value !== "string" || !DATE.test(value)) return false;
  const ms = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value;
}

function dateMs(value) { return Date.parse(value + "T00:00:00Z"); }
function localWeekday(value) { return (new Date(dateMs(value)).getUTCDay() + 6) % 7 + 1; }
function safeText(value) { return typeof value === "string" ? value.trim().slice(0, 160) : ""; }
function authorizedContext(context) {
  return Boolean(context?.authenticated === true &&
    context?.membership?.status === "active" &&
    typeof context.membership.organizationId === "string" &&
    context.membership.organizationId.length > 0);
}
function published(record, organizationId) {
  return record?.organizationId === organizationId &&
    record?.publicationStatus === "published" &&
    record?.classification === "non_confidential" &&
    typeof record.publishedAt === "string" &&
    Number.isFinite(Date.parse(record.publishedAt)) &&
    SOURCES.has(record.sourceApp);
}
function allowedRecord(record, context) {
  return published(record, context.membership.organizationId) &&
    // El backend debe comprobar membresía/capability/audiencia en cada consulta.
    record?.deliveredByAuthorizedEndpoint === true;
}
function dateRange(from, to) {
  if (!validDate(from) || !validDate(to)) throw new TypeError("Fechas inválidas");
  const start = dateMs(from), end = dateMs(to);
  if (end < start || end - start > 366 * DAY_MS) throw new RangeError("Rango máximo de 367 días");
  const dates = [];
  for (let ms = start; ms <= end; ms += DAY_MS) dates.push(new Date(ms).toISOString().slice(0, 10));
  return dates;
}

/**
 * Versiones de horarios, con fecha efectiva explícita; nunca asumir
 * automáticamente el primer lunes de enero.
 * effectiveTo es EXCLUSIVO. Una excepción publicada puede cancelar o cambiar.
 */
export function expandPublishedSchedules({context, schedules = [], exceptions = [], from, to}) {
  const dates = dateRange(from, to);
  if (!authorizedContext(context)) return [];
  const orgId = context.membership.organizationId;
  const versions = schedules.filter(s =>
    allowedRecord(s, context) &&
    typeof s.id === "string" && validDate(s.effectiveFrom) &&
    (s.effectiveTo == null || validDate(s.effectiveTo)) &&
    Array.isArray(s.weekdays) && s.weekdays.length > 0 &&
    s.weekdays.every(d => Number.isInteger(d) && d >= 1 && d <= 7) &&
    TIME.test(s.time ?? "") &&
    ["reuniones", "servicio"].includes(s.category)
  );
  const publishedExceptions = exceptions.filter(e =>
    allowedRecord(e, context) && typeof e.scheduleId === "string" &&
    validDate(e.date) && ["cancelled", "changed"].includes(e.kind) &&
    (e.kind === "cancelled" || TIME.test(e.time ?? ""))
  );
  const result = [];
  for (const date of dates) {
    const bySeries = new Map();
    for (const s of versions) {
      if (date < s.effectiveFrom || (s.effectiveTo && date >= s.effectiveTo) ||
          !s.weekdays.includes(localWeekday(date))) continue;
      const series = String(s.seriesId || s.id);
      const old = bySeries.get(series);
      // Si hay dos versiones con igual vigencia, no adivinar cuál prevalece.
      if (!old || s.effectiveFrom > old.effectiveFrom) bySeries.set(series, s);
      else if (s.effectiveFrom === old.effectiveFrom && s.id !== old.id) bySeries.set(series, null);
    }
    for (const s of bySeries.values()) {
      if (!s) continue;
      const matching = publishedExceptions.filter(e => e.scheduleId === s.id && e.date === date);
      if (matching.length > 1) continue; // conflicto: no mostrar horario potencialmente falso
      const exception = matching[0];
      if (exception?.kind === "cancelled") continue;
      result.push({
        id: s.id + "@" + date, sourceApp: s.sourceApp, sourceId: s.id,
        category: s.category, date, time: exception?.time || s.time,
        title: safeText(s.title), place: safeText(exception?.place ?? s.place),
        changed: exception?.kind === "changed"
      });
    }
  }
  return result.sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
}

/** Solo para mostrar datos ya filtrados y autorizados en el servidor.
 * Las asignaciones deben proceder de un endpoint privado «mis asignaciones».
 */
export function projectAgenda({context, occurrences = [], activities = [], filter = "todo"}) {
  if (!FILTERS.has(filter)) throw new TypeError("Filtro desconocido");
  if (!authorizedContext(context)) return [];
  const personId = context.verifiedPersonId;
  const orgId = context.membership.organizationId;
  const rows = occurrences.filter(x => validDate(x.date) &&
    ["reuniones", "servicio"].includes(x.category) &&
    typeof x.id === "string" && TIME.test(x.time ?? ""));
  for (const a of activities) {
    if (!allowedRecord(a, context) || !validDate(a.date) ||
        !CATEGORIES.has(a.category) || !TIME.test(a.time ?? "") ||
        typeof a.id !== "string") continue;
    if (a.category === "asignaciones") {
      if (!personId || a.personId !== personId || a.personalDelivery !== true) continue;
    } else if (a.personalDelivery === true) {
      continue; // no mezclar asignaciones privadas en la agenda general
    }
    rows.push({
      id: a.id, sourceApp: a.sourceApp, sourceId: a.sourceId,
      category: a.category, date: a.date, time: a.time,
      title: safeText(a.title), place: safeText(a.place),
      ...(a.category === "asignaciones" ? {isMine: true} : {})
    });
  }
  return rows.filter(x => filter === "todo" ||
    (filter === "mis_asignaciones" ? x.isMine === true :
    x.category === filter))
    .sort((a,b) => (a.date+a.time+a.id).localeCompare(b.date+b.time+b.id));
}

/** El Tablero muestra el horario vigente para una fecha, nunca la versión futura. */
export function currentSchedule({context, schedules = [], onDate}) {
  return expandPublishedSchedules({context, schedules, from:onDate, to:onDate});
}
