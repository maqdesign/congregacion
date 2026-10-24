/** Pure client-side defense for Core's private own-assignments envelope.
 * Does NOT authorize access or make network requests. Core must enforce session,
 * person mapping, audience, organization, publication and revocation server-side.
 */
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_ROWS = 500;
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const timestamp = x => typeof x === 'string' ? Date.parse(x) : NaN;
const validDate = x => typeof x === 'string' && DATE.test(x) &&
  Number.isFinite(timestamp(x + 'T00:00:00Z')) &&
  new Date(x + 'T00:00:00Z').toISOString().slice(0, 10) === x;
const text = x => typeof x === 'string' ? x.trim().slice(0, 160) : '';
export class PrivateAssignmentsError extends Error {
  constructor(code) { super(code); this.name = 'PrivateAssignmentsError'; this.code = code; }
}
const reject = code => { throw new PrivateAssignmentsError(code); };
/**
 * context is a local display guard, NOT an authorization grant.
 * Verified identity must originate from a server-validated account flow.
 * Never pass these rows to the public Agenda cache or general feed.
 */
export function projectOwnAssignments({envelope, context, from, to, now = Date.now()} = {}) {
  if (!validDate(from) || !validDate(to) ||
      Date.parse(to) < Date.parse(from) || Date.parse(to) - Date.parse(from) > 366 * 86400000)
    reject('invalid-window');
  if (!context?.authenticated || context?.membership?.status !== 'active' ||
      typeof context.membership.organizationId !== 'string' || !context.membership.organizationId ||
      typeof context.verifiedPersonId !== 'string' || !context.verifiedPersonId)
    reject('not-authorized');
  if (!object(envelope) || envelope.schemaVersion !== 1 ||
      envelope.organizationId !== context.membership.organizationId ||
      envelope.personId !== context.verifiedPersonId ||
      !Array.isArray(envelope.activities) || envelope.activities.length > MAX_ROWS)
    reject('invalid-envelope');
  const generated = timestamp(envelope.generatedAt), expires = timestamp(envelope.expiresAt);
  if (!Number.isFinite(generated) || !Number.isFinite(expires) ||
      generated > now + 60000 || expires <= now || expires <= generated)
    reject('stale');
  const seen = new Set(), items = [];
  for (const a of envelope.activities) {
    if (!object(a) || typeof a.id !== 'string' || !a.id || seen.has(a.id) ||
        a.organizationId !== envelope.organizationId || a.personId !== envelope.personId ||
        a.category !== 'asignaciones' || a.sourceApp !== 'reuniones' ||
        a.publicationStatus !== 'published' || a.classification !== 'non_confidential' ||
        a.personalDelivery !== true || a.deliveredByAuthorizedEndpoint !== true ||
        !Number.isFinite(timestamp(a.publishedAt)) || timestamp(a.publishedAt) > now + 60000 ||
        !validDate(a.date) || a.date < from || a.date > to ||
        typeof a.time !== 'string' || !TIME.test(a.time)) reject('invalid-records');
    seen.add(a.id);
    items.push(Object.freeze({id:a.id, category:'asignaciones', date:a.date,
      time:a.time, title:text(a.title), place:text(a.place), isMine:true}));
  }
  items.sort((a,b) => (a.date+a.time+a.id).localeCompare(b.date+b.time+b.id));
  return Object.freeze({items:Object.freeze(items), generatedAt:envelope.generatedAt,
    expiresAt:envelope.expiresAt});
}
