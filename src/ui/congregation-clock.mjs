/**
 * Congregation-local clock for Agenda. Never use the device's local timezone
 * to decide whether a published activity is upcoming.
 */
export function congregationClock(timeZone, instant = Date.now()) {
  if (typeof timeZone !== 'string' || !timeZone || timeZone.length > 80 ||
      !Number.isFinite(instant)) throw new TypeError('Invalid congregation clock');
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-US', {
      timeZone, year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',hourCycle:'h23'
    }).formatToParts(new Date(instant));
  } catch { throw new TypeError('Invalid congregation time zone'); }
  const values = Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return Object.freeze({
    today:values.year+'-'+values.month+'-'+values.day,
    nowTime:values.hour+':'+values.minute
  });
}
