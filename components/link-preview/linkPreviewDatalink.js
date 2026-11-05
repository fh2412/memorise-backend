const { run } = require('../plan-shared/planDb');

const findPreviewDb = async (conn, urlHash) => {
  const rows = await run(conn, `
    SELECT url, status, error_code, final_url, title, description, image_url, site_name,
           price_cents, price_currency,
           DATE_FORMAT(fetched_at, '%Y-%m-%dT%H:%i:%sZ') AS fetched_at,
           TIMESTAMPDIFF(SECOND, fetched_at, UTC_TIMESTAMP()) AS age_seconds
    FROM link_previews
    WHERE url_hash = ?
  `, [urlHash]);
  return rows[0] ?? null;
};

const upsertPreviewDb = (conn, urlHash, url, p) => run(conn, `
  INSERT INTO link_previews
    (url_hash, url, status, error_code, final_url, title, description, image_url, site_name,
     price_cents, price_currency, fetched_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
  ON DUPLICATE KEY UPDATE
    status = VALUES(status), error_code = VALUES(error_code), final_url = VALUES(final_url),
    title = VALUES(title), description = VALUES(description), image_url = VALUES(image_url),
    site_name = VALUES(site_name), price_cents = VALUES(price_cents),
    price_currency = VALUES(price_currency), fetched_at = UTC_TIMESTAMP()
`, [
  urlHash, url, p.status, p.error_code ?? null, p.final_url ?? null, p.title ?? null,
  p.description ?? null, p.image_url ?? null, p.site_name ?? null,
  p.price_cents ?? null, p.price_currency ?? null,
]);

module.exports = { findPreviewDb, upsertPreviewDb };
