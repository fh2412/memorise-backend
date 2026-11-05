// Local wall-clock times ("YYYY-MM-DDTHH:mm") + IANA time zones → UTC.
// Uses only Intl (full ICU ships with Node 24), no dependencies.

const LOCAL_RX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const TZ_RX = /^[A-Za-z0-9_+\-/]{1,64}$/;

const formatters = new Map();
const formatterFor = (tz) => {
  if (!formatters.has(tz)) {
    formatters.set(tz, new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }));
  }
  return formatters.get(tz);
};

const isValidTimeZone = (tz) => {
  if (typeof tz !== 'string' || !TZ_RX.test(tz)) return false;
  try {
    formatterFor(tz);
    return true;
  } catch {
    return false;
  }
};

/** "2027-08-12T15:00" – real calendar day, 00:00–23:59. */
const isRealLocal = (value) => {
  if (typeof value !== 'string') return false;
  const m = LOCAL_RX.exec(value);
  if (!m) return false;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  if (h > 23 || mi > 59) return false;
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
};

/** Offset (ms) of the zone at a given UTC instant: local = utc + offset. */
const offsetMs = (utcMs, tz) => {
  const p = Object.fromEntries(formatterFor(tz).formatToParts(new Date(utcMs)).map(x => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(utcMs / 1000) * 1000;
};

/**
 * Local time in a zone → UTC epoch ms.
 * Two passes handle DST changes; times in a DST gap resolve to the later offset.
 */
const localToUtcMs = (local, tz) => {
  const [y, mo, d, h, mi] = LOCAL_RX.exec(local).slice(1).map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const first = offsetMs(guess, tz);
  let utc = guess - first;
  const second = offsetMs(utc, tz);
  if (second !== first) utc = guess - second;
  return utc;
};

/** "2027-08-12T15:00" → "2027-08-12 15:00:00" (MySQL DATETIME literal). */
const localToMysql = (local) => (local ? `${local.replace('T', ' ')}:00` : null);

/** epoch ms → "YYYY-MM-DD HH:MM:SS" in UTC. */
const utcMsToMysql = (ms) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ');

module.exports = { isValidTimeZone, isRealLocal, localToUtcMs, localToMysql, utcMsToMysql };
