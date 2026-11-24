const { run, inList } = require('../plan-shared/planDb');

// Local times leave the DB as "YYYY-MM-DDTHH:mm", UTC instants as ISO strings → no driver TZ shifts.
const BOOKING_SELECT = `
  b.item_id, b.kind, b.status, b.provider, b.confirmation_code,
  DATE_FORMAT(b.starts_at, '%Y-%m-%dT%H:%i') AS starts_at, b.start_tz,
  DATE_FORMAT(b.ends_at, '%Y-%m-%dT%H:%i')   AS ends_at,   b.end_tz,
  DATE_FORMAT(b.starts_at_utc, '%Y-%m-%dT%H:%i:%sZ') AS starts_at_utc,
  DATE_FORMAT(b.ends_at_utc, '%Y-%m-%dT%H:%i:%sZ')   AS ends_at_utc,
  b.transport_mode, b.origin, b.destination_label, b.carrier, b.transport_number,
  b.address, b.latitude, b.longitude, b.city, b.country, b.country_code,
  b.price_cents, b.currency, b.paid_by, b.notes, b.source_poll_id`;

// Order matters: used for INSERT and UPDATE.
const WRITE_COLUMNS = [
  'kind', 'status', 'provider', 'confirmation_code',
  'starts_at', 'start_tz', 'ends_at', 'end_tz', 'starts_at_utc', 'ends_at_utc',
  'transport_mode', 'origin', 'destination_label', 'carrier', 'transport_number',
  'address', 'latitude', 'longitude', 'city', 'country', 'country_code',
  'price_cents', 'currency', 'paid_by', 'notes', 'source_poll_id',
];

const findBookingsDb = async (conn, itemIds) => {
  if (itemIds.length === 0) return [];
  return run(conn, `SELECT ${BOOKING_SELECT} FROM plan_bookings b WHERE b.item_id IN (${inList(itemIds)})`, itemIds);
};

/** Locks item + booking row. */
const findBookingForUpdateDb = async (conn, memoryId, itemId) => {
  const rows = await run(conn, `
    SELECT ${BOOKING_SELECT}, i.title, i.description, i.payload, i.created_by
    FROM plan_bookings b
    JOIN plan_items i ON i.item_id = b.item_id
    WHERE b.item_id = ? AND i.memory_id = ?
    FOR UPDATE
  `, [itemId, memoryId]);
  return rows[0] ?? null;
};

/** `row` holds DB-ready values (local times as MySQL literals). */
const insertBookingDb = (conn, itemId, row) => run(conn, `
  INSERT INTO plan_bookings (item_id, ${WRITE_COLUMNS.join(', ')})
  VALUES (?, ${WRITE_COLUMNS.map(() => '?').join(', ')})
`, [itemId, ...WRITE_COLUMNS.map(c => row[c] ?? null)]);

const updateBookingDb = (conn, itemId, row) => run(conn, `
  UPDATE plan_bookings SET ${WRITE_COLUMNS.map(c => `${c} = ?`).join(', ')}
  WHERE item_id = ?
`, [...WRITE_COLUMNS.map(c => row[c] ?? null), itemId]);

/** Decided poll of this memory (for "create booking from winner"). */
const findDecidedPollDb = async (conn, memoryId, pollItemId) => {
  const rows = await run(conn, `
    SELECT p.item_id, i.category, p.decided_option_id
    FROM plan_polls p
    JOIN plan_items i ON i.item_id = p.item_id
    WHERE p.item_id = ? AND i.memory_id = ? AND p.decided_option_id IS NOT NULL
  `, [pollItemId, memoryId]);
  return rows[0] ?? null;
};

module.exports = {
  WRITE_COLUMNS, findBookingsDb, findBookingForUpdateDb, insertBookingDb, updateBookingDb, findDecidedPollDb,
};
