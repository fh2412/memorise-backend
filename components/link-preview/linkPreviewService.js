const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const { requireMembership } = require('../plan-items/planItemsService');
const { safeFetchHtml, assertFetchableUrl, LinkPreviewError } = require('./safeFetch');
const { parseHtmlMeta } = require('./htmlMeta');
const cache = require('./linkPreviewCache');

/** Concurrent requests for the same URL share one fetch. */
const inflight = new Map();

const toHttpError = (err) => {
  if (err instanceof LinkPreviewError && err.code === 'BLOCKED') {
    return httpError(400, 'This link cannot be previewed', 'LINK_PREVIEW_BLOCKED');
  }
  if (err instanceof LinkPreviewError && err.code === 'INVALID') {
    return httpError(400, 'Please enter a valid http(s) link', 'LINK_PREVIEW_INVALID_URL');
  }
  return null;
};

const fetchAndStore = async (url) => {
  try {
    const { html, finalUrl } = await safeFetchHtml(url);
    const meta = parseHtmlMeta(html, finalUrl);
    const data = { status: 'ok', final_url: finalUrl, ...meta };
    await withTransaction(conn => cache.store(conn, url, data));
    const fresh = await withTransaction(conn => cache.findFresh(conn, url));
    return { preview: fresh?.preview ?? null, error: null, cached: false };
  } catch (err) {
    const mapped = toHttpError(err);
    if (mapped) throw mapped; // blocked targets are never cached
    const code = err instanceof LinkPreviewError ? err.code : 'FETCH_FAILED';
    if (!(err instanceof LinkPreviewError)) logger.warn(`Link preview failed for ${url}: ${err.message}`);
    await withTransaction(conn => cache.store(conn, url, { status: 'failed', error_code: code }));
    return { preview: null, error: code, cached: false };
  }
};

/**
 * Returns { preview | null, error | null, cached }.
 * A page that can't be read (blocked by the site, not HTML, timeout) is NOT an error: 200 + preview null.
 */
const getPreview = async (userId, memoryId, rawUrl, { refresh = false } = {}) => {
  let url;
  try {
    url = cache.normalizeUrl(rawUrl);
    assertFetchableUrl(url);
  } catch (err) {
    throw toHttpError(err) ?? httpError(400, 'Please enter a valid http(s) link', 'LINK_PREVIEW_INVALID_URL');
  }

  try {
    const cached = await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      return refresh ? null : cache.findFresh(conn, url);
    });
    if (cached) return { ...cached, cached: true };

    const key = cache.hashUrl(url);
    if (!inflight.has(key)) inflight.set(key, fetchAndStore(url).finally(() => inflight.delete(key)));
    return await inflight.get(key);
  } catch (error) {
    if (!error.status) logger.error(`Service error; getPreview: ${error.message}`);
    throw error;
  }
};

module.exports = { getPreview };
