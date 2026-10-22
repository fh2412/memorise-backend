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

// ── Reusable transaction building blocks (also used by memory-create) ────────

/**
 * Locks the user row and checks used + reserved + expected <= plan limit.
 * Call this BEFORE other writes in the transaction (lock order: user first).
 * @returns {{ storageUsedBytes: number }} usage incl. the new reservation
 */
const reserveQuota = async (conn, userId, expectedBytes) => {
  const user = await lockUserOrThrow(conn, userId);
  const limit = getStorageLimitBytes(user.accountType);
  const reserved = await dl.sumActiveReservationsDb(conn, userId);

  if (user.usedBytes + reserved + expectedBytes > limit) {
    throw httpError(409, 'Not enough storage left', 'STORAGE_FULL');
  }
  return { storageUsedBytes: user.usedBytes + reserved + expectedBytes };
};

/** Inserts the session row. Call after reserveQuota() in the same transaction. */
const openUploadSession = async (conn, { memoryId, userId, expectedFileCount, expectedBytes }) => {
  const sessionId = crypto.randomUUID();
  await dl.insertUploadSessionDb(conn, {
    sessionId,
    memoryId,
    userId,
    expectedFileCount,
    reservedBytes: expectedBytes,
  });
  return sessionId;
};

// ── Use cases ────────────────────────────────────────────────────────────────

/**
 * Reserves storage for an upload batch to an EXISTING memory.
 * 409 STORAGE_FULL if used + other reservations + expected > limit.
 */
const createUploadSession = async (memoryId, userId, { expectedFileCount, expectedBytes }) => {
  try {
    // Housekeeping – not required for correctness (quota ignores expired sessions).
    dl.expireStaleUploadSessionsDb().catch(err => logger.warn(`Expiring stale sessions failed: ${err.message}`));

    return await dl.withTransaction(async (conn) => {
      await assertMemoryAccess(conn, memoryId, userId);
      const quota = await reserveQuota(conn, userId, expectedBytes);
      const uploadSessionId = await openUploadSession(conn, { memoryId, userId, expectedFileCount, expectedBytes });
      return { uploadSessionId, storageUsedBytes: quota.storageUsedBytes };
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
        // Local wall-clock time – stored as-is, no time zone conversion (Phase 4).
        takenAt: body.takenAt ? body.takenAt.replace('T', ' ') : null,
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

const listMemoryPhotos = async (memoryId, userId) => {
  try {
    return await dl.withTransaction(async (conn) => {
      await assertMemoryAccess(conn, memoryId, userId);
      const rows = await dl.listMemoryPhotosDb(conn, memoryId);
      return rows.map(row => ({
        photoId: row.photo_id,
        clientId: row.client_id,
        downloadUrl: row.download_url,
        thumbUrl: row.thumb_url,
        width: Number(row.width),
        height: Number(row.height),
        sizeBytes: Number(row.size_bytes),
        mimeType: row.mime_type,
        takenAt: row.taken_at,                       // "YYYY-MM-DDTHH:mm:ss" or null
        lat: row.lat === null ? null : Number(row.lat),
        lng: row.lng === null ? null : Number(row.lng),
        uploadedBy: row.uploaded_by,
        createdAt: new Date(row.created_at).toISOString(),
        isCover: Boolean(row.is_cover),
      }));
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; listMemoryPhotos: ${error.message}`);
    throw error;
  }
};

/**
 * Deletes photos: DB rows, storage accounting of each uploader, picture count and
 * – if the cover is affected – picks the next cover. Files are removed from Storage
 * AFTER the commit (a failed file delete never leaves a half-deleted photo in the DB).
 *
 * Rules: the creator may delete every photo, members only their own uploads.
 * Idempotent: ids that no longer exist are ignored.
 */
const deleteMemoryPhotos = async (memoryId, userId, photoIds) => {
  try {
    const result = await dl.withTransaction(async (conn) => {
      // Lock order like registerPhoto: users (sorted) → memory → photos
      const owners = await dl.listPhotoOwnersDb(conn, memoryId, photoIds);
      const lockIds = [...new Set([...owners, userId])].sort();
      const users = new Map();
      for (const id of lockIds) users.set(id, await dl.lockUserStorageDb(conn, id));

      const memory = await dl.lockMemoryDb(conn, memoryId);
      if (!memory) throw httpError(404, 'Memory not found', 'MEMORY_NOT_FOUND');
      await assertMemoryAccess(conn, memoryId, userId);

      const isCreator = String(memory.userId) === userId;
      const photos = await dl.selectPhotosForUpdateDb(conn, memoryId, photoIds);
      if (!isCreator && photos.some(p => p.uploadedBy !== userId)) {
        throw httpError(403, 'You can only delete photos you uploaded', 'NOT_PHOTO_OWNER');
      }

      const freedByUser = new Map();
      if (photos.length > 0) {
        await dl.deletePhotosDb(conn, memoryId, photos.map(p => p.photoId));

        for (const photo of photos) {
          freedByUser.set(photo.uploadedBy, (freedByUser.get(photo.uploadedBy) ?? 0) + photo.bytes);
        }
        for (const [ownerId, bytes] of freedByUser) {
          if (users.get(ownerId)) await dl.addUserStorageDb(conn, ownerId, -bytes); // owner may be deleted
        }

        await dl.decrementPictureCountDb(conn, memoryId, photos.length);

        if (memory.titlePic && photos.some(p => p.downloadUrl === memory.titlePic)) {
          const next = await dl.firstRemainingPhotoDb(conn, memoryId);
          await dl.setTitlePicDb(conn, memoryId, next?.download_url ?? '', next?.thumb_url ?? null);
        }
      }

      const me = users.get(userId);
      const reserved = await dl.sumActiveReservationsDb(conn, userId);
      return {
        deletedPhotoIds: photos.map(p => p.photoId),
        paths: photos.flatMap(p => [p.storagePath, p.thumbPath]),
        pictureCount: await dl.getPictureCountDb(conn, memoryId),
        coverPhotoId: await dl.currentCoverPhotoIdDb(conn, memoryId),
        storageUsedBytes: me ? Math.max(0, me.usedBytes - (freedByUser.get(userId) ?? 0)) + reserved : null,
      };
    });

    if (result.paths.length > 0) {
      storage.deleteObjects(result.paths).catch(() => { /* logged in storage module */ });
    }
    const { paths, ...response } = result; // eslint-disable-line no-unused-vars
    return response;
  } catch (error) {
    if (!error.status) logger.error(`Service error; deleteMemoryPhotos: ${error.message}`);
    throw error;
  }
};

/** Creator and members may choose the cover (same as before). */
const setCoverPhoto = async (memoryId, userId, photoId) => {
  try {
    return await dl.withTransaction(async (conn) => {
      await assertMemoryAccess(conn, memoryId, userId);
      const photo = await dl.getPhotoDb(conn, memoryId, photoId);
      if (!photo) throw httpError(404, 'Photo not found', 'PHOTO_NOT_FOUND');
      await dl.setTitlePicDb(conn, memoryId, photo.download_url, photo.thumb_url);
      return { coverPhotoId: photo.photo_id };
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; setCoverPhoto: ${error.message}`);
    throw error;
  }
};


/** For a scheduler later (Cloud Scheduler / cron). */
const expireStaleUploadSessions = () => dl.expireStaleUploadSessionsDb();

module.exports = {
  reserveQuota,
  openUploadSession,
  createUploadSession,
  registerPhoto,
  completeUploadSession,
  expireStaleUploadSessions,
  listMemoryPhotos,
  deleteMemoryPhotos,
  setCoverPhoto,
};