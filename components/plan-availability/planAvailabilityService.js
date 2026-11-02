const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const planDl = require('../plan-items/planItemsDatalink');
const { requireMembership } = require('../plan-items/planItemsService');
const dl = require('./planAvailabilityDatalink');

const COALESCE_MINUTES = 360; // one feed entry per user per 6h of availability editing

const logUnexpected = (fn, error) => {
  if (!error.status) logger.error(`Service error; ${fn}: ${error.message}`);
};

/** Two members saving at the exact same moment can deadlock on the marks table → retry once. */
const withDeadlockRetry = async (fn, attempts = 2) => {
  for (let i = 1; ; i++) {
    try {
      return await withTransaction(fn);
    } catch (error) {
      if (error.code !== 'ER_LOCK_DEADLOCK' || i >= attempts) throw error;
    }
  }
};

const getAvailability = async (userId, memoryId) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      const settings = await dl.findSettingsDb(conn, memoryId);
      const members = await planDl.findCrewUserIdsDb(conn, memoryId);
      const responses = await dl.findResponsesDb(conn, memoryId);
      const marks = await dl.findMarksDb(conn, memoryId);
      return {
        settings: settings ? toApiSettings(settings) : null, // null → client uses defaults
        members,
        availability: groupMarks(responses, marks),
      };
    });
  } catch (error) {
    logUnexpected('getAvailability', error);
    throw error;
  }
};

/** Replaces the caller's marks completely. An empty body still counts as "responded". */
const setMyAvailability = async (userId, memoryId, { yes, maybe }) => {
  try {
    return await withDeadlockRetry(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      await dl.upsertResponseDb(conn, memoryId, userId);
      await dl.replaceMarksDb(conn, memoryId, userId, [
        ...yes.map(day => ({ day, state: 'yes' })),
        ...maybe.map(day => ({ day, state: 'maybe' })),
      ]);

      const recent = await dl.findRecentEventIdsDb(conn, memoryId, userId, 'availability_updated', COALESCE_MINUTES);
      await dl.deleteEventsByIdDb(conn, recent);
      await planDl.insertEventDb(conn, { memoryId, userId, action: 'availability_updated' });

      return { user_id: userId, updated_at: new Date().toISOString(), yes: [...yes].sort(), maybe: [...maybe].sort() };
    });
  } catch (error) {
    logUnexpected('setMyAvailability', error);
    throw error;
  }
};

const updateSettings = async (userId, memoryId, input) => {
  try {
    return await withTransaction(async (conn) => {
      const membership = await requireMembership(conn, memoryId, userId);
      if (!membership.isCreator) {
        throw httpError(403, 'Only the plan owner can change the date search', 'DATE_FINDER_OWNER_ONLY');
      }
      await dl.upsertSettingsDb(conn, memoryId, userId, input);
      await planDl.insertEventDb(conn, {
        memoryId, userId, action: 'date_finder_updated', itemTitle: `${input.rangeStart}/${input.rangeEnd}`,
      });
      return toApiSettings(await dl.findSettingsDb(conn, memoryId));
    });
  } catch (error) {
    logUnexpected('updateSettings', error);
    throw error;
  }
};

// ---------- helpers ----------

const toApiSettings = (row) => ({
  range_start: row.range_start,
  range_end: row.range_end,
  min_days: Number(row.min_days),
  max_days: Number(row.max_days),
});

const groupMarks = (responses, marks) => {
  const byUser = new Map(responses.map(r => [r.user_id, { user_id: r.user_id, updated_at: r.updated_at, yes: [], maybe: [] }]));
  for (const m of marks) byUser.get(m.user_id)?.[m.state].push(m.day);
  return [...byUser.values()];
};

module.exports = { getAvailability, setMyAvailability, updateSettings };