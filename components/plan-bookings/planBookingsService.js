const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const planDl = require('../plan-items/planItemsDatalink');
const { requireMembership, loadItem } = require('../plan-items/planItemsService');
const { linkPayloadFromCache } = require('../link-preview/linkPreviewCache');
const { localToUtcMs, localToMysql, utcMsToMysql } = require('../plan-shared/localTime');
const dl = require('./planBookingsDatalink');

const TRANSPORT_ONLY = ['transport_mode', 'origin', 'destination_label', 'carrier', 'transport_number'];
const PLACE_ONLY = ['address', 'latitude', 'longitude', 'city', 'country', 'country_code'];

// API (camelCase) → column
const FIELD_MAP = {
  status: 'status',
  provider: 'provider',
  confirmationCode: 'confirmation_code',
  startsAt: 'starts_at',
  startTz: 'start_tz',
  endsAt: 'ends_at',
  endTz: 'end_tz',
  transportMode: 'transport_mode',
  origin: 'origin',
  destination: 'destination_label',
  carrier: 'carrier',
  transportNumber: 'transport_number',
  address: 'address',
  priceCents: 'price_cents',
  currency: 'currency',
  paidBy: 'paid_by',
  notes: 'notes',
};

const logUnexpected = (fn, error) => {
  if (!error.status) logger.error(`Service error; ${fn}: ${error.message}`);
};

const blankToNull = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);

/** Booking row as read from the DB → plain object with only WRITE_COLUMNS. */
const fromDbRow = (row) => Object.fromEntries(dl.WRITE_COLUMNS.map(c => [c, row[c] ?? null]));

/** Applies API input to a booking state object (column names, local times as "YYYY-MM-DDTHH:mm"). */
const applyInput = (state, input) => {
  const next = { ...state };
  for (const [key, column] of Object.entries(FIELD_MAP)) {
    if (key in input) next[column] = blankToNull(typeof input[key] === 'string' ? input[key].trim() : input[key]);
  }
  if ('location' in input) {
    const loc = input.location;
    next.latitude = loc ? loc.lat : null;
    next.longitude = loc ? loc.lng : null;
    next.city = loc ? loc.city || null : null;
    next.country = loc ? loc.country || null : null;
    next.country_code = loc ? loc.countryCode || null : null;
  }
  if (!next.currency) next.currency = 'EUR';
  if (!next.status) next.status = 'option';
  return next;
};

/** Kind-specific cleanup, time zone rules, UTC derivation. Returns DB-ready row. */
const finalize = (state) => {
  const b = { ...state };
  const fieldsToClear = b.kind === 'transport' ? PLACE_ONLY : TRANSPORT_ONLY;
  for (const f of fieldsToClear) b[f] = null;

  // Stays/activities happen in one place → one zone. Transport may cross zones.
  if (b.kind !== 'transport') b.end_tz = b.start_tz ?? b.end_tz;
  if (!b.starts_at) b.start_tz = b.kind === 'transport' ? null : b.start_tz;
  if (!b.ends_at && b.kind === 'transport') b.end_tz = null;
  if (b.kind === 'transport' && b.ends_at && !b.end_tz) b.end_tz = b.start_tz;

  if (b.starts_at && !b.start_tz) throw httpError(400, 'Please choose a time zone for the start', 'BOOKING_TZ_REQUIRED');
  if (b.ends_at && !b.end_tz) throw httpError(400, 'Please choose a time zone for the end', 'BOOKING_TZ_REQUIRED');
  if (!b.starts_at && !b.ends_at) { b.start_tz = null; b.end_tz = null; }

  const startUtc = b.starts_at ? localToUtcMs(b.starts_at, b.start_tz) : null;
  const endUtc = b.ends_at ? localToUtcMs(b.ends_at, b.end_tz) : null;
  if (startUtc != null && endUtc != null && endUtc < startUtc) {
    throw httpError(400, 'The end must not be before the start', 'BOOKING_END_BEFORE_START');
  }

  return {
    ...b,
    starts_at: localToMysql(b.starts_at),
    ends_at: localToMysql(b.ends_at),
    starts_at_utc: startUtc == null ? null : utcMsToMysql(startUtc),
    ends_at_utc: endUtc == null ? null : utcMsToMysql(endUtc),
  };
};

const assertPaidByCrew = async (conn, memoryId, paidBy) => {
  if (!paidBy) return;
  const crew = new Set(await planDl.findCrewUserIdsDb(conn, memoryId));
  if (!crew.has(paidBy)) throw httpError(400, '"Paid by" must be a crew member', 'BOOKING_PAYER_NOT_IN_CREW');
};

const eventFor = (before, after, itemChanged) => {
  if (before.status !== after.status) {
    if (after.status === 'booked') return 'booking_booked';
    if (after.status === 'cancelled') return 'booking_cancelled';
  }
  const changed = dl.WRITE_COLUMNS.some(c => String(before[c] ?? '') !== String(after[c] ?? ''));
  return changed || itemChanged ? 'booking_updated' : null;
};

// ---------- create ----------

const createBooking = async (userId, memoryId, input) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);

      if (input.sourcePollId) {
        const poll = await dl.findDecidedPollDb(conn, memoryId, input.sourcePollId);
        if (!poll) throw httpError(400, 'Only decided polls of this plan can be turned into a booking', 'BOOKING_SOURCE_INVALID');
      }

      const state = applyInput({ kind: input.kind, source_poll_id: input.sourcePollId ?? null }, input);
      const row = finalize(state);
      await assertPaidByCrew(conn, memoryId, row.paid_by);

      const title = input.title.trim();
      const itemId = await planDl.insertItemDb(conn, memoryId, userId, {
        type: 'booking',
        category: input.kind,                 // stay | transport | activity
        title,
        description: blankToNull(input.description ?? null),
        payload: input.url ? await linkPayloadFromCache(conn, input.url) : null,
        board_x: input.board_x,
        board_y: input.board_y,
        color: input.color ?? null,
      });
      await dl.insertBookingDb(conn, itemId, row);

      await planDl.insertEventDb(conn, { memoryId, userId, action: 'booking_created', itemId, itemTitle: title });
      if (row.status === 'booked') {
        await planDl.insertEventDb(conn, { memoryId, userId, action: 'booking_booked', itemId, itemTitle: title });
      }
      return loadItem(conn, memoryId, itemId, userId);
    });
  } catch (error) {
    logUnexpected('createBooking', error);
    throw error;
  }
};

// ---------- update ----------

/** Anyone in the crew may edit (deleting stays with creator/owner via DELETE /plan/items/:itemId). */
const updateBooking = async (userId, memoryId, itemId, input) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      const current = await dl.findBookingForUpdateDb(conn, memoryId, itemId);
      if (!current) throw httpError(404, 'Booking not found', 'BOOKING_NOT_FOUND');

      const before = fromDbRow(current);
      const row = finalize(applyInput(before, input));
      if ('paidBy' in input) await assertPaidByCrew(conn, memoryId, row.paid_by);

      // Item-level fields
      const itemFields = {};
      if ('title' in input) itemFields.title = input.title.trim();
      if ('description' in input) itemFields.description = blankToNull(input.description);
      if ('url' in input) itemFields.payload = input.url ? await linkPayloadFromCache(conn, input.url) : null;
      const itemChanged = Object.keys(itemFields).some((k) => {
        if (k === 'payload') return JSON.stringify(itemFields.payload) !== JSON.stringify(current.payload ?? null);
        return (itemFields[k] ?? null) !== (current[k] ?? null);
      });
      if (Object.keys(itemFields).length) await planDl.updateItemDb(conn, memoryId, itemId, itemFields);

      await dl.updateBookingDb(conn, itemId, row);

      // Compare in the same (MySQL literal) format
      const action = eventFor(finalize(before), row, itemChanged);
      if (action) {
        await planDl.insertEventDb(conn, {
          memoryId, userId, action, itemId, itemTitle: itemFields.title ?? current.title,
        });
      }
      return loadItem(conn, memoryId, itemId, userId);
    });
  } catch (error) {
    logUnexpected('updateBooking', error);
    throw error;
  }
};

module.exports = { createBooking, updateBooking };
