// Short-lived signed tickets for streaming downloads.
//
// Why: a browser can only stream a large ZIP straight to disk if IT makes the request
// (form/link). Such requests can't carry the Firebase "Authorization: Bearer" header.
// So the app first asks for a ticket WITH the header, then the browser downloads with the ticket.
//
// Stateless (HMAC) → works with several backend instances, no DB table.
const crypto = require('crypto');

const TICKET_TTL_SECONDS = 120;

const getSecret = () => {
  const secret = process.env.DOWNLOAD_TICKET_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('DOWNLOAD_TICKET_SECRET is missing or shorter than 32 characters');
  }
  return secret;
};

const sign = (data) => crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');

/** @returns {string} "<payload>.<signature>" */
const createTicket = (memoryId, userId, now = Date.now()) => {
  const payload = Buffer.from(JSON.stringify({
    m: Number(memoryId),
    u: String(userId),
    exp: Math.floor(now / 1000) + TICKET_TTL_SECONDS,
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
};

/** @returns {{ userId: string } | null} null if forged, expired or for another memory */
const verifyTicket = (ticket, memoryId, now = Date.now()) => {
  if (typeof ticket !== 'string') return null;
  const parts = ticket.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

  let data;
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (data?.m !== Number(memoryId)) return null;
  if (typeof data.exp !== 'number' || data.exp * 1000 < now) return null;
  if (typeof data.u !== 'string' || data.u.length === 0) return null;
  return { userId: data.u };
};

module.exports = { createTicket, verifyTicket, TICKET_TTL_SECONDS };
