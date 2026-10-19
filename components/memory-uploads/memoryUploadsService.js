const crypto = require('crypto');
const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { getStorageLimitBytes } = require('../../config/storageLimits');
const storage = require('./memoryUploadsStorage');
const dl = require('./memoryUploadsDatalink');

const STORAGE_URL_PREFIX = 'https://firebasestorage.googleapis.com/';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** 404 if the memory doesn't exist, 403 if the user isn't creator/member. */
const assertMemoryAccess = async (conn, memoryId, userId) => {
  if (await dl.canUserAccessMemoryDb(conn, memoryId, userId)) return;
  if (!(await dl.memoryExistsDb(conn, memoryId))) throw httpError(404, 'Memory not found', 'MEMORY_NOT_FOUND');
  throw httpError(403, 'No permission for this memory', 'FORBIDDEN');
};

const lockUserOrThrow = async (conn, userId) => {
  const user = await dl.lockUserStorageDb(conn, userId);
  if (!user) throw httpError(404, 'User not found', 'USER_NOT_FOUND');
  return user;
};

/** Paths must follow the scheme the frontend uses – prevents registering foreign files. */
const assertValidPaths = (memoryId, { clientId, storagePath, thumbPath, downloadUrl, thumbUrl }) => {
  const originalPattern = new RegExp(`^memories/${memoryId}/${clientId}\\.[a-z0-9]{2,5}$`);
  if (!originalPattern.test(storagePath)) throw httpError(400, 'Invalid storagePath', 'INVALID_PATH');
  if (thumbPath !== `memories/${memoryId}/thumbs/${clientId}.jpg`) throw httpError(400, 'Invalid thumbPath', 'INVALID_PATH');

  const urlMatches = (url, path) => url.startsWith(STORAGE_URL_PREFIX) && url.includes(encodeURIComponent(path));
  if (!urlMatches(downloadUrl, storagePath)) throw httpError(400, 'Invalid downloadUrl', 'INVALID_URL');
  if (!urlMatches(thumbUrl, thumbPath)) throw httpError(400, 'Invalid thumbUrl', 'INVALID_URL');
};

/** Reads the real objects from Storage and checks they belong to the uploader. */
const verifyStoredObjects = async (userId, storagePath, thumbPath) => {
  const [original, thumb] = await Promise.all([storage.statObject(storagePath), storage.statObject(thumbPath)]);
  if (!original || !thumb) throw httpError(400, 'Uploaded file not found in storage', 'FILE_MISSING');

  if (original.customMetadata.userId !== userId || thumb.customMetadata.userId !== userId) {
    throw httpError(403, 'File was uploaded by another user', 'FORBIDDEN');
  }
  if (!original.contentType?.startsWith('image/')) {
    throw httpError(400, 'Only images are allowed', 'INVALID_TYPE');
  }
  return { originalSize: original.size, thumbSize: thumb.size, contentType: original.contentType };
};

// ── Use cases ────────────────────────────────────────────────────────────────

/**
 * Reserves storage for an upload batch.
 * 409 STORAGE_FULL if used + other reservations + expected > limit.
 */
const createUploadSession = async (memoryId, userId, { expectedFileCount, expectedBytes }) => {
  try {
    // Housekeeping – not required for correctness (quota ignores expired sessions).
    dl.expireStaleUploadSessionsDb().catch(err => logger.warn(`Expiring stale sessions failed: ${err.message}`));

    return await dl.withTransaction(async (conn) => {
      await assertMemoryAccess(conn, memoryId, userId);

      const user = await lockUserOrThrow(conn, userId);
      const limit = getStorageLimitBytes(user.accountType);
      const reserved = await dl.sumActiveReservationsDb(conn, userId);

      if (user.usedBytes + reserved + expectedBytes > limit) {
        throw httpError(409, 'Not enough storage left', 'STORAGE_FULL');
      }

      const sessionId = crypto.randomUUID();
      await dl.insertUploadSessionDb(conn, {
        sessionId,
        memoryId,
        userId,
        expectedFileCount,
        reservedBytes: expectedBytes,
      });

      return {
        uploadSessionId: sessionId,
        storageUsedBytes: user.usedBytes + reserved + expectedBytes,
      };
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; createUploadSession: ${error.message}`);
    throw error;
  }
};

/**
 * Registers one uploaded photo. Idempotent per (memoryId, clientId):
 * a retry after a lost response returns the existing photo without counting twice.
 */
const registerPhoto = async (memoryId, userId, body) => {
  try {
    assertValidPaths(memoryId, body);

    // Outside the transaction: network calls to Storage shouldn't hold DB locks.
    const stored = await verifyStoredObjects(userId, body.storagePath, body.thumbPath);
    const totalBytes = stored.originalSize + stored.thumbSize;

    return await dl.withTransaction(async (conn) => {
      await assertMemoryAccess(conn, memoryId, userId);

      // Lock order: user → session
      const user = await lockUserOrThrow(conn, userId);
      const session = await dl.lockUploadSessionDb(conn, body.uploadSessionId, memoryId);
      if (!session) throw httpError(404, 'Upload session not found', 'SESSION_NOT_FOUND');
      if (session.userId !== userId) throw httpError(403, 'Upload session belongs to another user', 'FORBIDDEN');

      // Idempotency check BEFORE the status check: a retry after "complete" must still succeed.
      const existingId = await dl.findPhotoByClientIdDb(conn, memoryId, body.clientId);
      if (existingId) {
        return { photoId: existingId, pictureCount: await dl.getPictureCountDb(conn, memoryId) };
      }

      if (session.status !== 'open' || session.isExpired) {
        throw httpError(409, 'Upload session is closed', 'SESSION_CLOSED');
      }

      // Exceeding the reservation is only allowed if the overall quota still fits.
      const overflow = Math.max(0, session.registeredBytes + totalBytes - session.reservedBytes);
      if (overflow > 0) {
        const limit = getStorageLimitBytes(user.accountType);
        const otherReserved = await dl.sumActiveReservationsDb(conn, userId, session.sessionId);
        if (user.usedBytes + otherReserved + overflow > limit) {
          throw httpError(409, 'Not enough storage left', 'STORAGE_FULL');
        }
      }

      const photoId = crypto.randomUUID();
      await dl.insertPhotoDb(conn, {
        photoId,
        memoryId,
        clientId: body.clientId,
        uploadSessionId: session.sessionId,
        uploadedBy: userId,
        storagePath: body.storagePath,
        downloadUrl: body.downloadUrl,
        sizeBytes: stored.originalSize,     // real size from Storage, not from the client
        thumbPath: body.thumbPath,
        thumbUrl: body.thumbUrl,
        thumbSizeBytes: stored.thumbSize,
        width: body.width,
        height: body.height,
        mimeType: stored.contentType,
        originalFileName: body.originalFileName,
        takenAt: body.takenAt ? new Date(body.takenAt) : null,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
      });

      await dl.addSessionUsageDb(conn, session.sessionId, totalBytes);
      await dl.addUserStorageDb(conn, userId, totalBytes);
      await dl.incrementPictureCountDb(conn, memoryId, 1);
      if (body.isCover) await dl.setTitlePicDb(conn, memoryId, body.downloadUrl, body.thumbUrl);

      return { photoId, pictureCount: await dl.getPictureCountDb(conn, memoryId) };
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; registerPhoto: ${error.message}`);
    throw error;
  }
};

/**
 * Closes the session (releases the unused reservation) and removes
 * leftovers of canceled uploads from Storage. Idempotent.
 */
const completeUploadSession = async (memoryId, sessionId, userId, { uploadedClientIds, canceledClientIds }) => {
  try {
    const result = await dl.withTransaction(async (conn) => {
      const user = await lockUserOrThrow(conn, userId);
      const session = await dl.lockUploadSessionDb(conn, sessionId, memoryId);
      if (!session) throw httpError(404, 'Upload session not found', 'SESSION_NOT_FOUND');
      if (session.userId !== userId) throw httpError(403, 'Upload session belongs to another user', 'FORBIDDEN');

      if (session.status === 'open') await dl.completeUploadSessionDb(conn, sessionId);

      const registered = await dl.countRegisteredClientIdsDb(conn, memoryId, uploadedClientIds);
      const otherReserved = await dl.sumActiveReservationsDb(conn, userId, sessionId);

      return {
        status: registered === uploadedClientIds.length ? 'complete' : 'incomplete',
        storageUsedBytes: user.usedBytes + otherReserved,
        pictureCount: await dl.getPictureCountDb(conn, memoryId),
      };
    });

    // After commit, best effort: only delete files of canceled ids that were never registered.
    if (canceledClientIds.length > 0) {
      const unregistered = await filterUnregistered(memoryId, canceledClientIds);
      const prefixes = unregistered.flatMap(id => [`memories/${memoryId}/${id}.`, `memories/${memoryId}/thumbs/${id}.`]);
      storage.deleteByPrefixes(prefixes).catch(() => { /* logged in storage module */ });
    }

    return result;
  } catch (error) {
    if (!error.status) logger.error(`Service error; completeUploadSession: ${error.message}`);
    throw error;
  }
};

const filterUnregistered = async (memoryId, clientIds) => {
  return dl.withTransaction(async (conn) => {
    const result = [];
    for (const id of clientIds) {
      if (!(await dl.findPhotoByClientIdDb(conn, memoryId, id))) result.push(id);
    }
    return result;
  });
};

/** For a scheduler later (Cloud Scheduler / cron). */
const expireStaleUploadSessions = () => dl.expireStaleUploadSessionsDb();

module.exports = {
  createUploadSession,
  registerPhoto,
  completeUploadSession,
  expireStaleUploadSessions,
};
