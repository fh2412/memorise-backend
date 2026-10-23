const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const { reserveQuota, openUploadSession } = require('../memory-uploads/memoryUploadsService');
const createDl = require('./memoryCreateDatalink');
const { createMemoryInDB, addUserToMemory, createPlaceholderAndAssignToMemory } = require('../memories/memoriesDataAccess');
const { insertLocation } = require('../locations/locationsDataAccess');

const NO_LOCATION_ID = 1;
const NO_ACTIVITY_ID = 1;

/**
 * Creates a memory incl. location, crew (friends + placeholders) and – optionally –
 * an upload session, all in ONE transaction.
 *
 * Used by:
 *  - the create page (finished memory: dates, location, photos)
 *  - the plan page   (planned memory: title + crew only)
 *
 * Idempotent per (user, requestId).
 */
const createMemoryWithDetails = async (userId, input) => {
  try {
    return await withTransaction(conn => createInTransaction(conn, userId, input));
  } catch (error) {
    // Two identical requests at the same moment: the second hits the unique key → return the first.
    if (error.code === 'ER_DUP_ENTRY' && String(error.message).includes('uq_memories_create_request')) {
      return withTransaction(async conn => {
        const existing = await createDl.findMemoryByRequestIdDb(conn, userId, input.requestId);
        if (!existing) throw error;
        return replayResult(conn, userId, existing);
      });
    }
    if (!error.status) logger.error(`Service error; createMemoryWithDetails: ${error.message}`);
    throw error;
  }
};

const createInTransaction = async (conn, userId, input) => {
  const existing = await createDl.findMemoryByRequestIdDb(conn, userId, input.requestId);
  if (existing) return replayResult(conn, userId, existing);

  const crew = normalizeCrew(userId, input.crew);
  await assertUsersExist(conn, crew.userIds);

  // Quota check FIRST: locks the user row before anything else (consistent lock order,
  // and no memory is created when there isn't enough storage).
  const quota = input.upload ? await reserveQuota(conn, userId, input.upload.expectedBytes) : null;

  const locationId = input.location
    ? await insertLocation({
        latitude: input.location.lat,
        longitude: input.location.lng,
        country: input.location.country ?? '',
        city: input.location.city ?? '',
        countryCode: input.location.countryCode ?? '',
      }, conn)
    : (input.locationId ?? NO_LOCATION_ID);

  const activityId = input.activityId ?? NO_ACTIVITY_ID;
  const startDate = input.startDate ?? null;
  const endDate = input.endDate ?? startDate;

  const memoryId = await createMemoryInDB({
    creator_id: userId,                 // from the token, never from the body
    title: input.title,
    description: input.description ?? '',
    location_id: locationId,
    memory_date: startDate,
    memory_end_date: endDate,
    title_pic: '',                      // set by registerPhoto (isCover)
    activity_id: activityId,
    create_request_id: input.requestId,
  }, conn);

  for (const friendId of crew.userIds) {
    await addUserToMemory(friendId, memoryId, conn);
  }

  const placeholders = [];
  for (const name of crew.placeholderNames) {
    const created = await createPlaceholderAndAssignToMemory({ name }, memoryId, userId, conn);
    placeholders.push({ id: created.id, name: created.name });
  }

  const uploadSessionId = input.upload
    ? await openUploadSession(conn, {
        memoryId,
        userId,
        expectedFileCount: input.upload.expectedFileCount,
        expectedBytes: input.upload.expectedBytes,
      })
    : null;

  return {
    created: true,
    memoryId,
    locationId,
    activityId,
    placeholders,
    uploadSessionId,
    storageUsedBytes: quota?.storageUsedBytes ?? null,
  };
};

/** Response for a repeated request – nothing is created again. */
const replayResult = async (conn, userId, existing) => {
  const [placeholders, uploadSessionId] = await Promise.all([
    createDl.findPlaceholdersOfMemoryDb(conn, existing.memoryId),
    createDl.findOpenUploadSessionDb(conn, existing.memoryId, userId),
  ]);
  return {
    created: false,
    memoryId: existing.memoryId,
    locationId: existing.locationId,
    activityId: existing.activityId,
    placeholders: placeholders.map(p => ({ id: p.id, name: p.name })),
    uploadSessionId,
    storageUsedBytes: null,
  };
};

/** Dedupes friends, drops the creator, trims placeholder names. */
const normalizeCrew = (creatorId, crew = []) => {
  const userIds = new Set();
  const placeholderNames = [];
  for (const entry of crew) {
    if (entry.userId) {
      if (entry.userId !== creatorId) userIds.add(entry.userId);
    } else if (entry.placeholderName) {
      placeholderNames.push(entry.placeholderName.trim());
    }
  }
  return { userIds: [...userIds], placeholderNames };
};

const assertUsersExist = async (conn, userIds) => {
  const existing = new Set(await createDl.findExistingUserIdsDb(conn, userIds));
  const missing = userIds.filter(id => !existing.has(id));
  if (missing.length > 0) throw httpError(400, 'Unknown crew member', 'CREW_USER_NOT_FOUND');
  // Optional later: also check that every userId is a friend of the creator.
};

module.exports = { createMemoryWithDetails };
