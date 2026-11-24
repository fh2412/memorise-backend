// Memory lifecycle, derived from the dates. Mirror of the frontend `planPhase()`.
// Step 2 adds overrides (finalised / archived early by the owner).

const WRAP_UP_DAYS = 7;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const diffDays = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
const serverToday = () => new Date().toISOString().slice(0, 10);

/**
 * "Today" comes from the browser (decision: browser time zone).
 * Accepted only within ±1 day of UTC today – time zones span UTC-12 … UTC+14.
 */
const resolveToday = (clientToday) => {
  const utc = serverToday();
  if (typeof clientToday === 'string' && ISO_DAY.test(clientToday)
      && clientToday >= addDays(utc, -1) && clientToday <= addDays(utc, 1)) {
    return clientToday;
  }
  return utc;
};

/** 'planning' | 'upcoming' | 'live' | 'wrapping_up' | 'archived' */
const planPhase = (start, end, today) => {
  if (!start) return 'planning';
  const s = start.slice(0, 10);
  const e = (end || start).slice(0, 10);
  if (today < s) return 'upcoming';
  if (today <= e) return 'live';
  return today <= addDays(e, WRAP_UP_DAYS) ? 'wrapping_up' : 'archived';
};

/** { day, total } for a live trip, e.g. day 3 of 5. */
const tripDay = (start, end, today) => {
  const s = start.slice(0, 10);
  const e = (end || start).slice(0, 10);
  const total = Math.max(1, diffDays(s, e) + 1);
  const day = Math.min(Math.max(diffDays(s, today) + 1, 1), total);
  return { day, total };
};

module.exports = { WRAP_UP_DAYS, resolveToday, planPhase, tripDay, addDays, diffDays };
