// Read side only (no service imports) → planItemsService can require it without a cycle.
const { toLocation } = require('../plan-polls/planPollsReader');
const dl = require('./planBookingsDatalink');

const toApiBooking = (r) => ({
  kind: r.kind,
  status: r.status,
  provider: r.provider,
  confirmation_code: r.confirmation_code,
  starts_at: r.starts_at,                 // local "YYYY-MM-DDTHH:mm"
  start_tz: r.start_tz,
  ends_at: r.ends_at,
  end_tz: r.end_tz,
  starts_at_utc: r.starts_at_utc,         // ISO UTC
  ends_at_utc: r.ends_at_utc,
  transport_mode: r.transport_mode,
  origin: r.origin,
  destination: r.destination_label,
  carrier: r.carrier,
  transport_number: r.transport_number,
  address: r.address,
  location: toLocation(r),
  price_cents: r.price_cents == null ? null : Number(r.price_cents),
  currency: r.currency,
  paid_by: r.paid_by,
  notes: r.notes,
  source_poll_id: r.source_poll_id,
});

/** Adds `booking` to every booking item. Other items pass through unchanged. */
const attachBookingData = async (conn, items) => {
  const ids = items.filter(i => i.type === 'booking').map(i => i.item_id);
  if (ids.length === 0) return items;
  const byId = new Map((await dl.findBookingsDb(conn, ids)).map(r => [r.item_id, r]));
  return items.map((item) => {
    if (item.type !== 'booking') return item;
    const row = byId.get(item.item_id);
    return { ...item, booking: row ? toApiBooking(row) : null };
  });
};

module.exports = { attachBookingData, toApiBooking };
