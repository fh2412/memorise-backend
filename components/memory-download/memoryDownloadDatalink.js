const logger = require('../../middleware/logger');

const run = async (conn, query, params) => {
  try {
    const [rows] = await conn.query(query, params);
    return rows;
  } catch (error) {
    logger.error(`Data Access error; (${query.trim().split('\n')[0]}): ${error.message}`);
    throw error;
  }
};

const getMemoryTitleDb = async (conn, memoryId) => {
  const rows = await run(conn, 'SELECT title FROM memories WHERE memory_id = ?', [memoryId]);
  return rows[0]?.title ?? null;
};

/**
 * Photos to download (all, or only the given ids), oldest capture time first
 * → files in the ZIP keep the order of the trip.
 */
const listPhotosForDownloadDb = async (conn, memoryId, photoIds) => {
  const filter = photoIds ? `AND photo_id IN (${photoIds.map(() => '?').join(',')})` : '';
  const rows = await run(conn, `
    SELECT photo_id, storage_path, original_file_name, size_bytes, created_at
    FROM memory_photos
    WHERE memory_id = ? ${filter}
    ORDER BY (taken_at IS NULL), taken_at, created_at
  `, [memoryId, ...(photoIds ?? [])]);

  return rows.map(r => ({
    photoId: r.photo_id,
    storagePath: r.storage_path,
    originalFileName: r.original_file_name,
    sizeBytes: Number(r.size_bytes),
    createdAt: new Date(r.created_at),
  }));
};

module.exports = { getMemoryTitleDb, listPhotosForDownloadDb };
