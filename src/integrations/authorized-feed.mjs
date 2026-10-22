/**
 * Adapter for an authenticated SAME-ORIGIN server endpoint that aggregates
 * already-authorized Reuniones/Servicio publications.
 *
 * IMPORTANT: client-side validation is not authorization. The endpoint MUST
 * verify the real session, organization membership, audience and revocation.
 * This module never sends a user-supplied identity or access token.
 */
import {expandPublishedSchedules, projectAgenda, validDate} from "../domain/agenda.mjs";

export const AGENDA_ENDPOINT = "/api/congregation/agenda";
const MAX_ITEMS = 500;
const MAX_BYTES = 350000;
const SOURCES = new Set(["reuniones", "servicio", "eventos"]);

export class AgendaUnavailableError extends Error {
  constructor(code) { super(code); this.name = "AgendaUnavailableError"; this.code = code; }
}
const invalid = code => { throw new AgendaUnavailableError(code); };
const isObject = x => x !== null && typeof x === "object" && !Array.isArray(x);
const isTime = x => typeof x === "string" && /^([01]\\d|2[0-3]):[0-5]\\d$/.test(x);
const stamp = x => typeof x === "string" ? Date.parse(x) : NaN;
function isTimezone(x) {
  if (typeof x !== "string" || x.length > 80) return false;
  try { new Intl.DateTimeFormat("en-US", {timeZone:x}); return true; }
  catch { return false; }
}
function checkWindow(from,to) {
  if (!validDate(from) || !validDate(to)) invalid("invalid-window");
  const days=(Date.parse(to+"T00:00:00Z")-Date.parse(from+"T00:00:00Z"))/86400000;
  if (days < 0 || days > 366) invalid("invalid-window");
}
function checkRecords(items,org) {
  if (!Array.isArray(items) || items.length > MAX_ITEMS) invalid("invalid-records");
  for (const x of items) {
    if (!isObject(x) || x.organizationId !== org ||
        !SOURCES.has(x.sourceApp) ||
        x.publicationStatus !== "published" ||
        x.classification !== "non_confidential" ||
        x.deliveredByAuthorizedEndpoint !== true ||
        !Number.isFinite(stamp(x.publishedAt))) invalid("invalid-records");
  }
}
export function projectAuthorizedFeed({envelope,context,from,to,now=Date.now(),filter="todo"}) {
  checkWindow(from,to);
  if (!context?.authenticated || context?.membership?.status !== "active" ||
      typeof context.membership.organizationId !== "string" ||
      !context.membership.organizationId) invalid("not-authorized");
  if (!isObject(envelope) || envelope.schemaVersion !== 1 ||
      envelope.organizationId !== context.membership.organizationId ||
      envelope.state !== "published" ||
      !isTimezone(envelope.timeZone)) invalid("invalid-envelope");
  const created=stamp(envelope.generatedAt),expires=stamp(envelope.expiresAt);
  if (!Number.isFinite(created) || !Number.isFinite(expires) ||
      created > now + 60000 || expires <= now || expires <= created) invalid("stale");
  const org=envelope.organizationId;
  const schedules=envelope.schedules,exceptions=envelope.exceptions,activities=envelope.activities;
  for (const records of [schedules,exceptions,activities]) checkRecords(records,org);
  if ([...schedules,...exceptions,...activities].some(x=>stamp(x.publishedAt)>now+60000)) invalid("invalid-records");
  if (schedules.some(x=>!["reuniones","servicio"].includes(x.sourceApp) ||
      x.sourceApp !== x.category || !isTime(x.time))) invalid("invalid-records");
  if (exceptions.some(x=>!["reuniones","servicio"].includes(x.sourceApp) ||
      !validDate(x.date))) invalid("invalid-records");
  if (activities.some(x=>!validDate(x.date) || !isTime(x.time))) invalid("invalid-records");
  const scheduleById=new Map(schedules.map(x=>[x.id,x]));
  if (exceptions.some(x=>!scheduleById.has(x.scheduleId) ||
      scheduleById.get(x.scheduleId).sourceApp !== x.sourceApp)) invalid("invalid-records");
  const occurrences=expandPublishedSchedules({context,schedules,exceptions,from,to});
  const projected=projectAgenda({context,occurrences,activities,filter})
    .filter(x=>x.date>=from && x.date<=to);
  return Object.freeze({
    timeZone:envelope.timeZone,
    generatedAt:envelope.generatedAt,
    expiresAt:envelope.expiresAt,
    items:projected
  });
}
export async function loadAuthorizedAgenda({
  fetchImpl=fetch,endpoint=AGENDA_ENDPOINT,context,from,to,filter="todo",signal
}={}) {
  checkWindow(from,to);
  // An absolute/cross-origin URL or arbitrary path is never accepted.
  if (endpoint !== AGENDA_ENDPOINT) invalid("unapproved-endpoint");
  const params=new URLSearchParams({from,to});
  let response;
  try {
    response=await fetchImpl(endpoint+"?"+params.toString(),{
      method:"GET",credentials:"same-origin",cache:"no-store",
      headers:{Accept:"application/json"},signal,redirect:"error"
    });
  } catch { invalid("network"); }
  if (response.status===401 || response.status===403) invalid("not-authorized");
  if (!response.ok) invalid("unavailable");
  if (!response.headers.get("content-type")?.toLowerCase().includes("application/json"))
    invalid("invalid-response");
  if (Number(response.headers.get("content-length"))>MAX_BYTES) invalid("invalid-response");
  let envelope;
  try {
    const raw=await response.text();
    if (raw.length>MAX_BYTES) invalid("invalid-response");
    envelope=JSON.parse(raw);
  } catch(e) {
    if (e instanceof AgendaUnavailableError) throw e;
    invalid("invalid-response");
  }
  return projectAuthorizedFeed({envelope,context,from,to,filter});
}
