// Connection-level destination writes. Only requires datalinks, so planItemsService,
// planPollsService and planDestinationService can all use it without require cycles.
const { insertLocation } = require('../locations/locationsDataAccess');
const planDl = require('../plan-items/planItemsDatalink');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { toLocation } = require('./planDestinationReader');
const dl = require('./planDestinationDatalink');

const NO_LOCATION_ID = 1;
const MAX_LABEL = 200;

const sameCoords = (a, b) =>
  !!a && !!b && Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;

const readCurrent = async (conn, memoryId) => {
  const row = await dl.findDestinationForUpdateDb(conn, memoryId);
  if (!row) throw httpError(404, 'Memory not found', 'MEMORY_NOT_FOUND');
  const location = toLocation(row);
  return {
    hasRow: row.label != null,
    label: row.label ?? null,
    sourcePollId: row.source_poll_id ?? null,
    location,
    displayLabel: row.label ?? (location ? (location.city || location.country || 'Pinned location') : null),
  };
};

/**
 * Sets the destination.
 *  - location: undefined = keep the current coordinates, null = name only (coordinates removed),
 *              object = new coordinates (a NEW location row; shared rows are never overwritten)
 *  - sourcePollId: number/null = set explicitly; undefined = keep it if the label is unchanged,
 *                  otherwise null (editing the name by hand "takes over" the destination)
 * Returns true if anything changed.
 */
const applyDestination = async (conn, { memoryId, userId, label, location, sourcePollId, itemId = null }) => {
  const current = await readCurrent(conn, memoryId);
  const cleanLabel = String(label).trim().slice(0, MAX_LABEL);
  if (!cleanLabel) throw httpError(400, 'The destination needs a name', 'DESTINATION_LABEL_REQUIRED');

  let coordsChanged = false;
  if (location === null) {
    if (current.location) {
      await dl.setMemoryLocationDb(conn, memoryId, NO_LOCATION_ID);
      coordsChanged = true;
    }
  } else if (location !== undefined && !sameCoords(location, current.location)) {
    const locationId = await insertLocation({
      latitude: location.lat,
      longitude: location.lng,
      country: location.country ?? '',
      city: location.city ?? '',
      countryCode: location.countryCode ?? '',
    }, conn);
    await dl.setMemoryLocationDb(conn, memoryId, locationId);
    coordsChanged = true;
  }

  const nextSource = sourcePollId !== undefined
    ? sourcePollId
    : (cleanLabel === current.label ? current.sourcePollId : null);
  const rowChanged = !current.hasRow || cleanLabel !== current.label || nextSource !== current.sourcePollId;
  if (rowChanged) await dl.upsertDestinationDb(conn, memoryId, { label: cleanLabel, sourcePollId: nextSource, userId });

  if (!rowChanged && !coordsChanged) return false;

  // Same name, coordinates added → "pinned X on the map"
  const action = !rowChanged && coordsChanged && location ? 'destination_located' : 'destination_set';
  await planDl.insertEventDb(conn, { memoryId, userId, action, itemId, itemTitle: cleanLabel });
  return true;
};

/** Removes the destination (row + coordinates). Returns true if there was one. */
const clearDestination = async (conn, { memoryId, userId, itemId = null }) => {
  const current = await readCurrent(conn, memoryId);
  if (!current.hasRow && !current.location) return false;

  if (current.hasRow) await dl.deleteDestinationDb(conn, memoryId);
  if (current.location) await dl.setMemoryLocationDb(conn, memoryId, NO_LOCATION_ID);
  await planDl.insertEventDb(conn, {
    memoryId, userId, action: 'destination_cleared', itemId, itemTitle: current.displayLabel,
  });
  return true;
};

/** Reopen / delete of a poll: clears the destination ONLY if it came from that poll. */
const clearIfFromPoll = async (conn, { memoryId, userId, pollItemId }) => {
  const current = await readCurrent(conn, memoryId);
  if (current.sourcePollId == null || Number(current.sourcePollId) !== Number(pollItemId)) return false;
  return clearDestination(conn, { memoryId, userId, itemId: pollItemId });
};

module.exports = { NO_LOCATION_ID, applyDestination, clearDestination, clearIfFromPoll };
