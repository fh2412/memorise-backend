// Cache helpers shared by the preview endpoint and by item/booking saves.
const crypto = require('node:crypto');
const dl = require('./linkPreviewDatalink');

const OK_TTL_SECONDS = 7 * 24 * 3600;
const FAILED_TTL_SECONDS = 3600;

/** Same URL → same cache row (no #fragment, URL() normalises host/case). Throws on invalid input. */
const normalizeUrl = (raw) => {
  const url = new URL(String(raw).trim());
  url.hash = '';
  return url.href;
};

const hashUrl = (url) => crypto.createHash('sha256').update(url).digest('hex');

const toApiPreview = (row) => ({
  url: row.url,
  final_url: row.final_url,
  title: row.title,
  description: row.description,
  image_url: row.image_url,
  site_name: row.site_name,
  price_cents: row.price_cents == null ? null : Number(row.price_cents),
  price_currency: row.price_currency,
  fetched_at: row.fetched_at,
});

/** Fresh cache entry or null. { preview, error } */
const findFresh = async (conn, url) => {
  const row = await dl.findPreviewDb(conn, hashUrl(url));
  if (!row) return null;
  const age = Number(row.age_seconds);
  if (row.status === 'ok' && age < OK_TTL_SECONDS) return { preview: toApiPreview(row), error: null };
  if (row.status === 'failed' && age < FAILED_TTL_SECONDS) return { preview: null, error: row.error_code };
  return null;
};

const store = (conn, url, data) => dl.upsertPreviewDb(conn, hashUrl(url), url, data);

/**
 * Payload for link items and bookings. The preview is ALWAYS taken from the
 * server-side cache – whatever the client sends is ignored (no injected images).
 */
const linkPayloadFromCache = async (conn, rawUrl) => {
  if (!rawUrl) return null;
  let url;
  try {
    url = normalizeUrl(rawUrl);
  } catch {
    return { url: rawUrl, preview: null };
  }
  const row = await dl.findPreviewDb(conn, hashUrl(url));
  return { url: rawUrl, preview: row?.status === 'ok' ? toApiPreview(row) : null };
};

module.exports = { normalizeUrl, hashUrl, findFresh, store, linkPayloadFromCache };
