// SSRF-safe HTML fetch for link previews.
//
// - only http/https on the default ports, no credentials in the URL
// - IP literals and resolved addresses are checked against private/internal ranges
//   (incl. 169.254.169.254 = GCP metadata server)
// - the check runs inside the socket's DNS lookup → no DNS-rebinding gap
// - max 3 redirects, each target re-validated
// - 5 s total budget, max 1 MB body, only text/html

const net = require('node:net');
const dns = require('node:dns');
const http = require('node:http');
const https = require('node:https');
const axios = require('axios');

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 5_000;
const MAX_BYTES = 1024 * 1024;
const MAX_URL_LENGTH = 2048;
const BLOCKED_HOST_SUFFIXES = ['.internal', '.local', '.localhost', '.localdomain', '.home.arpa'];

class LinkPreviewError extends Error {
  /** code: INVALID | BLOCKED | FETCH_FAILED | NOT_HTML */
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// ---------- address checks ----------

const blockList = new net.BlockList();
[
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15],
  ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
].forEach(([addr, prefix]) => blockList.addSubnet(addr, prefix, 'ipv4'));
[
  ['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8],
  ['64:ff9b::', 96], ['2001:db8::', 32],
].forEach(([addr, prefix]) => blockList.addSubnet(addr, prefix, 'ipv6'));

const isBlockedIp = (ip) => {
  const family = net.isIP(ip);
  if (!family) return true;
  if (family === 6) {
    const lower = ip.toLowerCase();
    if (lower.startsWith('::ffff:')) {            // IPv4-mapped IPv6
      const v4 = lower.slice(7);
      if (net.isIPv4(v4)) return blockList.check(v4, 'ipv4');
    }
    return blockList.check(ip, 'ipv6');
  }
  return blockList.check(ip, 'ipv4');
};

/** Every resolved address must be public; otherwise the connection is refused. */
const safeLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    if (!addresses.length || addresses.some(a => isBlockedIp(a.address))) {
      const blocked = new Error(`Blocked address for ${hostname}`);
      blocked.code = 'LINK_PREVIEW_BLOCKED_IP';
      return callback(blocked);
    }
    if (options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
};

const httpAgent = new http.Agent({ lookup: safeLookup });
const httpsAgent = new https.Agent({ lookup: safeLookup });

/** Throws LinkPreviewError for anything that must not be fetched. Returns a URL object. */
const assertFetchableUrl = (raw) => {
  if (typeof raw !== 'string' || raw.length > MAX_URL_LENGTH) throw new LinkPreviewError('INVALID', 'Invalid URL');
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new LinkPreviewError('INVALID', 'Invalid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new LinkPreviewError('INVALID', 'Only http(s) links');
  if (url.username || url.password) throw new LinkPreviewError('BLOCKED', 'Credentials in URL are not allowed');
  if (url.port && url.port !== '80' && url.port !== '443') throw new LinkPreviewError('BLOCKED', 'Port not allowed');

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || BLOCKED_HOST_SUFFIXES.some(s => host.endsWith(s)) || !host.includes('.') && !net.isIP(host)) {
    throw new LinkPreviewError('BLOCKED', 'Host not allowed');
  }
  // IP literals skip DNS lookup → check them here
  if (net.isIP(host) && isBlockedIp(host)) throw new LinkPreviewError('BLOCKED', 'Address not allowed');
  return url;
};

// ---------- fetching ----------

const readLimited = (stream, maxBytes, msLeft) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  let done = false;
  const finish = (fn, value) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    fn(value);
  };
  const timer = setTimeout(() => {
    stream.destroy();
    // Got some HTML already? The <head> is usually enough.
    if (size > 0) finish(resolve, Buffer.concat(chunks));
    else finish(reject, new LinkPreviewError('FETCH_FAILED', 'Timeout'));
  }, Math.max(1, msLeft));

  stream.on('data', (chunk) => {
    chunks.push(chunk);
    size += chunk.length;
    if (size >= maxBytes) {
      stream.destroy();
      finish(resolve, Buffer.concat(chunks).subarray(0, maxBytes));
    }
  });
  stream.on('end', () => finish(resolve, Buffer.concat(chunks)));
  stream.on('error', (err) => (size > 0 ? finish(resolve, Buffer.concat(chunks)) : finish(reject, err)));
});

const decodeBody = (buffer, contentType) => {
  let charset = /charset=["']?([\w-]+)/i.exec(contentType)?.[1];
  if (!charset) charset = /<meta[^>]+charset=["']?([\w-]+)/i.exec(buffer.subarray(0, 4096).toString('latin1'))?.[1];
  try {
    return new TextDecoder((charset || 'utf-8').toLowerCase()).decode(buffer);
  } catch {
    return new TextDecoder('utf-8').decode(buffer);
  }
};

const isBlockedError = (err) =>
  err?.code === 'LINK_PREVIEW_BLOCKED_IP' || err?.cause?.code === 'LINK_PREVIEW_BLOCKED_IP';

/** Returns { html, finalUrl }. Throws LinkPreviewError. */
const safeFetchHtml = async (rawUrl) => {
  const deadline = Date.now() + TIMEOUT_MS;
  let url = assertFetchableUrl(rawUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const msLeft = deadline - Date.now();
    if (msLeft <= 0) throw new LinkPreviewError('FETCH_FAILED', 'Timeout');

    let res;
    try {
      res = await axios.get(url.href, {
        responseType: 'stream',
        maxRedirects: 0,
        timeout: msLeft,
        signal: AbortSignal.timeout(msLeft),
        httpAgent,
        httpsAgent,
        proxy: false,                           // never route via HTTP(S)_PROXY env vars
        decompress: true,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MemoriseLinkPreview/1.0)',
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
          'Accept-Language': 'en,de;q=0.8',
        },
      });
    } catch (err) {
      if (isBlockedError(err)) throw new LinkPreviewError('BLOCKED', 'Address not allowed');
      throw new LinkPreviewError('FETCH_FAILED', err.message);
    }

    const { status, headers, data } = res;
    if (status >= 300 && status < 400 && headers.location) {
      data.destroy();
      if (hop === MAX_REDIRECTS) break;
      url = assertFetchableUrl(new URL(headers.location, url).href);
      continue;
    }
    if (status < 200 || status >= 300) {
      data.destroy();
      throw new LinkPreviewError('FETCH_FAILED', `HTTP ${status}`);
    }

    const contentType = String(headers['content-type'] || '');
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      data.destroy();
      throw new LinkPreviewError('NOT_HTML', 'Not an HTML page');
    }

    const buffer = await readLimited(data, MAX_BYTES, deadline - Date.now());
    return { html: decodeBody(buffer, contentType), finalUrl: url.href };
  }
  throw new LinkPreviewError('FETCH_FAILED', 'Too many redirects');
};

module.exports = { safeFetchHtml, assertFetchableUrl, isBlockedIp, LinkPreviewError, MAX_URL_LENGTH };
