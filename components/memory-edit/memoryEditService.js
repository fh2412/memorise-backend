const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction, canUserAccessMemoryDb, lockMemoryDb } = require('../memory-uploads/memoryUploadsDatalink');
const { findExistingUserIdsDb, findPlaceholdersOfMemoryDb } = require('../memory-create/memoryCreateDatalink');
const editDl = require('./memoryEditDatalink');
const { addUserToMemory, createPlaceholderAndAssignToMemory, deletePlaceholderFromMemoryDL } = require('../memories/memoriesDataAccess');
const { insertLocation } = require('../locations/locationsDataAccess');
const datesDl = require('./memoryEditDatalink');
const planDl = require('../plan-items/planItemsDatalink');


const NO_LOCATION_ID = 1;

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

/** 404 if missing, 403 if the user is neither creator nor member. Locks the memory row. */
const lockAccessibleMemory = async (conn, memoryId, userId) => {
  const memory = await lockMemoryDb(conn, memoryId);
  if (!memory) throw httpError(404, 'Memory not found', 'MEMORY_NOT_FOUND');
  if (!(await canUserAccessMemoryDb(conn, memoryId, userId))) {
    throw httpError(403, 'No permission for this memory', 'FORBIDDEN');
  }
  return memory;
};

/**
 * Saves title, description, dates, location and crew in ONE transaction.
 *
 * - `location` missing → unchanged · null → removed · object → NEW location row
 *   (never updated in place: rows can be shared with activities)
 * - `crew` missing → unchanged · array → the complete desired crew (server computes the diff)
 */
const updateMemoryDetails = async (memoryId, userId, input) => {
  try {
    return await withTransaction(async (conn) => {
      const memory = await lockAccessibleMemory(conn, memoryId, userId);

      const startDate = input.startDate ?? null;
      const endDate = startDate ? (input.endDate ?? startDate) : null;
      await editDl.updateMemoryFieldsDb(conn, memoryId, {
        title: input.title.trim(),
        text: input.description ?? '',
        startDate,
        endDate,
      });

      let locationId = memory.locationId;
      if (hasOwn(input, 'location')) {
        locationId = input.location
          ? await insertLocation({
              latitude: input.location.lat,
              longitude: input.location.lng,
              country: input.location.country ?? '',
              city: input.location.city ?? '',
              countryCode: input.location.countryCode ?? '',
            }, conn)
          : NO_LOCATION_ID;
        await editDl.setMemoryLocationDb(conn, memoryId, locationId);
      }

      if (Array.isArray(input.crew)) {
        await syncCrew(conn, memoryId, String(memory.userId), userId, input.crew);
      }

      const placeholders = await findPlaceholdersOfMemoryDb(conn, memoryId);
      return {
        memoryId,
        locationId,
        placeholders: placeholders.map(p => ({ id: p.id, name: p.name })),
      };
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; updateMemoryDetails: ${error.message}`);
    throw error;
  }
};

/**
 * Brings the crew in line with the desired list.
 * Creator and requester are never removed (a member saving the form can't kick themselves out by accident).
 * Retries are safe: re-sent new placeholder names replace the ones from the first attempt.
 */
const syncCrew = async (conn, memoryId, creatorId, requesterId, crew) => {
  const desiredUsers = new Set();
  const keepPlaceholders = new Set();
  const newPlaceholderNames = [];

  for (const entry of crew) {
    if (entry.userId) {
      if (entry.userId !== creatorId) desiredUsers.add(entry.userId);
    } else if (entry.placeholderId) {
      keepPlaceholders.add(entry.placeholderId);
    } else if (entry.placeholderName) {
      newPlaceholderNames.push(entry.placeholderName.trim());
    }
  }

  const currentUsers = new Set(await editDl.listMemoryUserIdsDb(conn, memoryId));
  const currentPlaceholders = new Set((await findPlaceholdersOfMemoryDb(conn, memoryId)).map(p => p.id));

  if ([...keepPlaceholders].some(id => !currentPlaceholders.has(id))) {
    throw httpError(400, 'Unknown placeholder', 'PLACEHOLDER_NOT_FOUND');
  }

  const toAdd = [...desiredUsers].filter(id => !currentUsers.has(id));
  const existing = new Set(await findExistingUserIdsDb(conn, toAdd));
  if (toAdd.some(id => !existing.has(id))) {
    throw httpError(400, 'Unknown crew member', 'CREW_USER_NOT_FOUND');
  }

  const protectedIds = new Set([creatorId, requesterId]);
  const toRemove = [...currentUsers].filter(id => !desiredUsers.has(id) && !protectedIds.has(id));
  const placeholdersToRemove = [...currentPlaceholders].filter(id => !keepPlaceholders.has(id));

  for (const id of toAdd) await addUserToMemory(id, memoryId, conn);
  for (const id of toRemove) await editDl.removeUserFromMemoryDb(conn, memoryId, id);
  for (const id of placeholdersToRemove) await deletePlaceholderFromMemoryDL(id, memoryId, conn);
  for (const name of newPlaceholderNames) {
    await createPlaceholderAndAssignToMemory({ name }, memoryId, requesterId, conn);
  }

  return { added: toAdd, removed: toRemove, placeholdersRemoved: placeholdersToRemove, placeholdersAdded: newPlaceholderNames };
};

/** Placeholders of a memory (for the crew selector on the edit page). */
const listPlaceholders = async (memoryId, userId) => {
  try {
    return await withTransaction(async (conn) => {
      await lockAccessibleMemory(conn, memoryId, userId);
      const rows = await findPlaceholdersOfMemoryDb(conn, memoryId);
      return rows.map(p => ({ id: p.id, name: p.name }));
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; listPlaceholders: ${error.message}`);
    throw error;
  }
};

/**
 * Sets or clears the dates of a memory. Owner only.
 * Setting dates is what "locks" a plan; clearing them returns it to the planning phase.
 */
const updateMemoryDates = async (userId, memoryId, { startDate, endDate }) => {
  const start = startDate ?? null;
  const end = start ? (endDate ?? start) : null;

  try {
    return await withTransaction(async (conn) => {
      const current = await datesDl.findMemoryDatesForUpdateDb(conn, memoryId);
      const membership = current ? await planDl.findMembershipDb(conn, memoryId, userId) : null;
      if (!membership) throw httpError(404, 'Memory not found', 'MEMORY_NOT_FOUND');
      if (!membership.isCreator) throw httpError(403, 'Only the plan owner can set the dates', 'DATES_OWNER_ONLY');

      const changed = current.memory_date !== start || current.memory_end_date !== end;
      if (changed) {
        await datesDl.updateMemoryDatesDb(conn, memoryId, start, end);
        await planDl.insertEventDb(conn, {
          memoryId,
          userId,
          action: start ? 'dates_set' : 'dates_cleared',
          itemTitle: start ? `${start}/${end}` : null,   // ISO interval, formatted by the feed
        });
      }
      return { memoryId, startDate: start, endDate: end, changed };
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; updateMemoryDates: ${error.message}`);
    throw error;
  }
};

module.exports = { updateMemoryDetails, listPlaceholders, syncCrew, updateMemoryDates };
