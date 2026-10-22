// ─────────────────────────────────────────────────────────────────────────────
// Data access for upload sessions + memory photos.
// All functions that take `conn` run inside a transaction (see withTransaction).
// ─────────────────────────────────────────────────────────────────────────────
const db = require('../../config/db');
const logger = require('../../middleware/logger');

const SESSION_TTL_HOURS = 24;

/**
 * Runs `work(conn)` in a transaction. Commits on success, rolls back on error.
 * Requires `db` to be a mysql2 PROMISE pool (db.getConnection()).
 */
const withTransaction = async (work) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (error) {
    try {
      await conn.rollback();
    } catch (rollbackError) {
      logger.error(`Data Access error; Rollback failed: ${rollbackError.message}`);
    }
    throw error;
  } finally {
    conn.release();
  }
};

/** Small wrapper that logs the failing query in your usual style. */
const run = async (conn, query, params) => {
  try {
    const [result] = await conn.execute(query, params);
    return result;
  } catch (error) {
    logger.error(`Data Access error; (${query.trim().split('\n')[0]}): ${error.message}`);
    throw error;
  }
};

// ── Access / users ───────────────────────────────────────────────────────────

/**
 * true if the user is the creator or a member of the memory.
 * (the one used by isUserMemoryMember / addFriendsToMemory).
 */
const canUserAccessMemoryDb = async (conn, memoryId, userId) => {
  const rows = await run(conn, `
    SELECT 1 AS ok
    FROM memories m
    WHERE m.memory_id = ?
      AND (
        m.user_id = ?
        OR EXISTS (SELECT 1 FROM user_has_memory uhm WHERE uhm.memory_id = m.memory_id AND uhm.user_id = ?)
      )
    LIMIT 1
  `, [memoryId, userId, userId]);
  return rows.length > 0;
};

const memoryExistsDb = async (conn, memoryId) => {
  const rows = await run(conn, 'SELECT 1 AS ok FROM memories WHERE memory_id = ? LIMIT 1', [memoryId]);
  return rows.length > 0;
};

/**
 * Locks the user row → serialises quota checks of the same user.
 * ADJUST: `account_type` = column holding FREE/PRO/UNLIMITED.
 * Lock order everywhere: users row FIRST, then upload_sessions row (avoids deadlocks).
 */
const lockUserStorageDb = async (conn, userId) => {
  const rows = await run(conn, `
    SELECT used_storage_space, account_type
    FROM users
    WHERE user_id = ?
    FOR UPDATE
  `, [userId]);
  if (rows.length === 0) return null;
  return {
    usedBytes: Number(rows[0].used_storage_space) || 0,
    accountType: rows[0].account_type,
  };
};

const addUserStorageDb = async (conn, userId, deltaBytes) => {
  await run(conn, `
    UPDATE users
    SET used_storage_space = GREATEST(0, used_storage_space + ?)
    WHERE user_id = ?
  `, [deltaBytes, userId]);
};

// ── Upload sessions ──────────────────────────────────────────────────────────

/** Bytes reserved by open, not expired sessions that are not used yet. */
const sumActiveReservationsDb = async (conn, userId, excludeSessionId = null) => {
  const rows = await run(conn, `
    SELECT COALESCE(SUM(GREATEST(0, CAST(reserved_bytes AS SIGNED) - CAST(registered_bytes AS SIGNED))), 0) AS reserved
    FROM upload_sessions
    WHERE user_id = ?
      AND status = 'open'
      AND expires_at > NOW()
      AND session_id <> COALESCE(?, '')
  `, [userId, excludeSessionId]);
  return Number(rows[0].reserved) || 0;
};

const insertUploadSessionDb = async (conn, { sessionId, memoryId, userId, expectedFileCount, reservedBytes }) => {
  await run(conn, `
    INSERT INTO upload_sessions
      (session_id, memory_id, user_id, expected_file_count, reserved_bytes, expires_at)
    VALUES (?, ?, ?, ?, ?, NOW() + INTERVAL ${SESSION_TTL_HOURS} HOUR)
  `, [sessionId, memoryId, userId, expectedFileCount, reservedBytes]);
};

const lockUploadSessionDb = async (conn, sessionId, memoryId) => {
  const rows = await run(conn, `
    SELECT session_id, memory_id, user_id, status, expected_file_count,
           reserved_bytes, registered_files, registered_bytes,
           (expires_at <= NOW()) AS is_expired
    FROM upload_sessions
    WHERE session_id = ? AND memory_id = ?
    FOR UPDATE
  `, [sessionId, memoryId]);
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    sessionId: row.session_id,
    memoryId: row.memory_id,
    userId: row.user_id,
    status: row.status,
    expectedFileCount: Number(row.expected_file_count),
    reservedBytes: Number(row.reserved_bytes),
    registeredFiles: Number(row.registered_files),
    registeredBytes: Number(row.registered_bytes),
    isExpired: Boolean(row.is_expired),
  };
};

const addSessionUsageDb = async (conn, sessionId, bytes) => {
  await run(conn, `
    UPDATE upload_sessions
    SET registered_files = registered_files + 1,
        registered_bytes = registered_bytes + ?
    WHERE session_id = ?
  `, [bytes, sessionId]);
};

const completeUploadSessionDb = async (conn, sessionId) => {
  await run(conn, `
    UPDATE upload_sessions
    SET status = 'complete', completed_at = NOW()
    WHERE session_id = ?
  `, [sessionId]);
};

/** Marks abandoned sessions as expired (cosmetic – the quota already ignores them). */
const expireStaleUploadSessionsDb = async () => {
  const [result] = await db.execute(`
    UPDATE upload_sessions
    SET status = 'expired'
    WHERE status = 'open' AND expires_at <= NOW()
  `);
  return result.affectedRows;
};

// ── Photos ───────────────────────────────────────────────────────────────────

const findPhotoByClientIdDb = async (conn, memoryId, clientId) => {
  const rows = await run(conn, `
    SELECT photo_id FROM memory_photos WHERE memory_id = ? AND client_id = ? LIMIT 1
  `, [memoryId, clientId]);
  return rows[0]?.photo_id ?? null;
};

const countRegisteredClientIdsDb = async (conn, memoryId, clientIds) => {
  if (clientIds.length === 0) return 0;
  const placeholders = clientIds.map(() => '?').join(',');
  const rows = await run(conn, `
    SELECT COUNT(*) AS cnt FROM memory_photos
    WHERE memory_id = ? AND client_id IN (${placeholders})
  `, [memoryId, ...clientIds]);
  return Number(rows[0].cnt) || 0;
};

const insertPhotoDb = async (conn, photo) => {
  await run(conn, `
    INSERT INTO memory_photos
      (photo_id, memory_id, client_id, upload_session_id, uploaded_by,
       storage_path, download_url, size_bytes, thumb_path, thumb_url, thumb_size_bytes,
       width, height, mime_type, original_file_name, taken_at, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    photo.photoId, photo.memoryId, photo.clientId, photo.uploadSessionId, photo.uploadedBy,
    photo.storagePath, photo.downloadUrl, photo.sizeBytes, photo.thumbPath, photo.thumbUrl, photo.thumbSizeBytes,
    photo.width, photo.height, photo.mimeType, photo.originalFileName ?? null,
    photo.takenAt ?? null, photo.lat ?? null, photo.lng ?? null,
  ]);
};

const listMemoryPhotosDb = async (conn, memoryId) => {
  return run(conn, `
    SELECT
      p.photo_id, p.client_id, p.download_url, p.thumb_url,
      p.width, p.height, p.size_bytes, p.mime_type,
      DATE_FORMAT(p.taken_at, '%Y-%m-%dT%H:%i:%s') AS taken_at,
      p.lat, p.lng, p.uploaded_by, p.created_at,
      (m.title_pic IS NOT NULL AND p.download_url = m.title_pic) AS is_cover
    FROM memory_photos p
    JOIN memories m ON m.memory_id = p.memory_id
    WHERE p.memory_id = ?
    ORDER BY is_cover DESC, (p.taken_at IS NULL), p.taken_at, p.created_at
  `, [memoryId]);
};

// ── Memories ─────────────────────────────────────────────────────────────────

const incrementPictureCountDb = async (conn, memoryId, increment) => {
  await run(conn, 'UPDATE memories SET picture_count = picture_count + ? WHERE memory_id = ?', [increment, memoryId]);
};

const getPictureCountDb = async (conn, memoryId) => {
  const rows = await run(conn, 'SELECT picture_count FROM memories WHERE memory_id = ?', [memoryId]);
  return Number(rows[0]?.picture_count) || 0;
};

const setTitlePicDb = async (conn, memoryId, imageUrl, thumbUrl) => {
  await run(conn, 'UPDATE memories SET title_pic = ?, title_pic_thumb = ? WHERE memory_id = ?', [imageUrl, thumbUrl, memoryId]);
};

/** Locks the memory row. Used by delete photos, set cover and the edit endpoint. */
const lockMemoryDb = async (conn, memoryId) => {
  const rows = await run(conn, `
    SELECT memory_id, user_id, location_id, title_pic
    FROM memories WHERE memory_id = ? FOR UPDATE
  `, [memoryId]);
  if (rows.length === 0) return null;
  return {
    memoryId: Number(rows[0].memory_id),
    userId: rows[0].user_id,
    locationId: Number(rows[0].location_id),
    titlePic: rows[0].title_pic,
  };
};

const inList = (ids) => ids.map(() => '?').join(',');

/** Uploaders of the given photos – read WITHOUT lock to determine the lock order. */
const listPhotoOwnersDb = async (conn, memoryId, photoIds) => {
  if (photoIds.length === 0) return [];
  const rows = await run(conn, `
    SELECT DISTINCT uploaded_by FROM memory_photos
    WHERE memory_id = ? AND photo_id IN (${inList(photoIds)})
  `, [memoryId, ...photoIds]);
  return rows.map(r => r.uploaded_by);
};

const selectPhotosForUpdateDb = async (conn, memoryId, photoIds) => {
  if (photoIds.length === 0) return [];
  const rows = await run(conn, `
    SELECT photo_id, uploaded_by, storage_path, thumb_path, size_bytes, thumb_size_bytes, download_url
    FROM memory_photos
    WHERE memory_id = ? AND photo_id IN (${inList(photoIds)})
    FOR UPDATE
  `, [memoryId, ...photoIds]);
  return rows.map(r => ({
    photoId: r.photo_id,
    uploadedBy: r.uploaded_by,
    storagePath: r.storage_path,
    thumbPath: r.thumb_path,
    bytes: Number(r.size_bytes) + Number(r.thumb_size_bytes),
    downloadUrl: r.download_url,
  }));
};

const deletePhotosDb = async (conn, memoryId, photoIds) => {
  if (photoIds.length === 0) return;
  await run(conn, `
    DELETE FROM memory_photos WHERE memory_id = ? AND photo_id IN (${inList(photoIds)})
  `, [memoryId, ...photoIds]);
};

const decrementPictureCountDb = async (conn, memoryId, count) => {
  await run(conn, `
    UPDATE memories SET picture_count = GREATEST(0, CAST(picture_count AS SIGNED) - ?) WHERE memory_id = ?
  `, [count, memoryId]);
};

/** Next cover candidate: same order as GET /photos (by capture time, then upload). */
const firstRemainingPhotoDb = async (conn, memoryId) => {
  const rows = await run(conn, `
    SELECT download_url, thumb_url FROM memory_photos
    WHERE memory_id = ?
    ORDER BY (taken_at IS NULL), taken_at, created_at
    LIMIT 1
  `, [memoryId]);
  return rows[0] ?? null;
};

const getPhotoDb = async (conn, memoryId, photoId) => {
  const rows = await run(conn, `
    SELECT photo_id, download_url, thumb_url FROM memory_photos WHERE memory_id = ? AND photo_id = ?
  `, [memoryId, photoId]);
  return rows[0] ?? null;
};

const currentCoverPhotoIdDb = async (conn, memoryId) => {
  const rows = await run(conn, `
    SELECT p.photo_id FROM memory_photos p
    JOIN memories m ON m.memory_id = p.memory_id
    WHERE p.memory_id = ? AND p.download_url = m.title_pic
    LIMIT 1
  `, [memoryId]);
  return rows[0]?.photo_id ?? null;
};

module.exports = {
  withTransaction,
  canUserAccessMemoryDb,
  memoryExistsDb,
  lockUserStorageDb,
  addUserStorageDb,
  sumActiveReservationsDb,
  insertUploadSessionDb,
  lockUploadSessionDb,
  addSessionUsageDb,
  completeUploadSessionDb,
  expireStaleUploadSessionsDb,
  findPhotoByClientIdDb,
  countRegisteredClientIdsDb,
  insertPhotoDb,
  incrementPictureCountDb,
  getPictureCountDb,
  setTitlePicDb,
  listMemoryPhotosDb,
  lockMemoryDb,
  listPhotoOwnersDb,
  selectPhotosForUpdateDb,
  deletePhotosDb,
  decrementPictureCountDb,
  firstRemainingPhotoDb,
  getPhotoDb,
  currentCoverPhotoIdDb,
};
