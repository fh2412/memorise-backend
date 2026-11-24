const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const { requireMembership } = require('../plan-items/planItemsService');
const { loadDestinations } = require('./planDestinationReader');
const writer = require('./planDestinationWriter');

/** Owner only (decision 1). Always returns the resulting destination. */
const withOwner = async (fnName, userId, memoryId, work) => {
  try {
    return await withTransaction(async (conn) => {
      const membership = await requireMembership(conn, memoryId, userId);
      if (!membership.isCreator) {
        throw httpError(403, 'Only the plan owner can change the destination', 'DESTINATION_OWNER_ONLY');
      }
      await work(conn);
      return { destination: (await loadDestinations(conn, [memoryId])).get(memoryId) ?? null };
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; ${fnName}: ${error.message}`);
    throw error;
  }
};

/**
 * body.location: omitted = keep coordinates, null = name only, object = new pin.
 * Used by the progress-strip dialog, the header and "Pick on map".
 */
const setDestination = (userId, memoryId, { label, location }) =>
  withOwner('setDestination', userId, memoryId, conn =>
    writer.applyDestination(conn, { memoryId, userId, label, location }));

const removeDestination = (userId, memoryId) =>
  withOwner('removeDestination', userId, memoryId, conn =>
    writer.clearDestination(conn, { memoryId, userId }));

module.exports = { setDestination, removeDestination };
