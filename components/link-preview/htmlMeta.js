// Minimal Open Graph / meta parser. Only reads <meta> tags and <title> from the <head>.
const { decode } = require('html-entities');

const META_RX = /<meta\b[^>]*>/gi;
const ATTR_RX = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
const TITLE_RX = /<title[^>]*>([\s\S]*?)<\/title>/i;

const clean = (value, max) => {
  if (typeof value !== 'string') return null;
  const text = decode(value).replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, max) : null;
};

const parseAttributes = (tag) => {
  const attrs = {};
  for (const m of tag.matchAll(ATTR_RX)) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return attrs;
};

const absoluteHttpUrl = (value, base) => {
  if (!value) return null;
  try {
    const url = new URL(decode(value).trim(), base);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href.length <= 2048 ? url.href : null;
  } catch {
    return null;
  }
};

const parsePriceCents = (amount) => {
  if (!amount) return null;
  const n = Number(String(amount).replace(/[^\d.,-]/g, '').replace(',', '.'));
  return Number.isFinite(n) && n >= 0 && n < 10_000_000 ? Math.round(n * 100) : null;
};

/** Returns preview fields (any may be null). */
const parseHtmlMeta = (html, finalUrl) => {
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd > 0 ? html.slice(0, headEnd) : html.slice(0, 200_000);

  const meta = new Map();
  for (const tag of head.match(META_RX) ?? []) {
    const a = parseAttributes(tag);
    const key = (a.property || a.name || a.itemprop || '').toLowerCase();
    if (key && a.content !== undefined && !meta.has(key)) meta.set(key, a.content);
  }
  const get = (...keys) => keys.map(k => meta.get(k)).find(v => v);

  let host = null;
  try { host = new URL(finalUrl).hostname.replace(/^www\./, ''); } catch { /* keep null */ }

  const currency = (get('product:price:currency', 'og:price:currency') || '').trim().toUpperCase();
  const priceCents = parsePriceCents(get('product:price:amount', 'og:price:amount'));

  return {
    title: clean(get('og:title', 'twitter:title') ?? TITLE_RX.exec(head)?.[1], 300),
    description: clean(get('og:description', 'twitter:description', 'description'), 500),
    image_url: absoluteHttpUrl(get('og:image:secure_url', 'og:image', 'og:image:url', 'twitter:image', 'twitter:image:src'), finalUrl),
    site_name: clean(get('og:site_name', 'application-name'), 200) ?? host,
    price_cents: /^[A-Z]{3}$/.test(currency) ? priceCents : null,
    price_currency: /^[A-Z]{3}$/.test(currency) && priceCents != null ? currency : null,
  };
};

module.exports = { parseHtmlMeta };
