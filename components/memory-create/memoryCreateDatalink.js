// New queries for the createMemory endpoint.
// Everything that already existed is reused from the other datalinks (see memoryCreateService).
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

/** Memory previously created with the same requestId (idempotency). */
const findMemoryByRequestIdDb = async (conn, userId, requestId) => {
  const rows = await run(conn, `
    SELECT memory_id, location_id, activity_id
    FROM memories
    WHERE user_id = ? AND create_request_id = ?
    LIMIT 1
  `, [userId, requestId]);
  if (rows.length === 0) return null;
  return {
    memoryId: Number(rows[0].memory_id),
    locationId: Number(rows[0].location_id),
    activityId: Number(rows[0].activity_id),
  };
};

/** Returns the subset of ids that exist in `users`. */
const findExistingUserIdsDb = async (conn, userIds) => {
  if (userIds.length === 0) return [];
  const placeholders = userIds.map(() => '?').join(',');
  const rows = await run(conn, `SELECT user_id FROM users WHERE user_id IN (${placeholders})`, userIds);
  return rows.map(r => r.user_id);
};

const findPlaceholdersOfMemoryDb = async (conn, memoryId) => {
  return run(conn, `
    SELECT p.id, p.name
    FROM placeholders p
    JOIN placeholder_has_memory phm ON phm.placeholder_id = p.id
    WHERE phm.memory_id = ?
  `, [memoryId]);
};

const findOpenUploadSessionDb = async (conn, memoryId, userId) => {
  const rows = await run(conn, `
    SELECT session_id
    FROM upload_sessions
    WHERE memory_id = ? AND user_id = ? AND status = 'open' AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `, [memoryId, userId]);
  return rows[0]?.session_id ?? null;
};

module.exports = {
  findMemoryByRequestIdDb,
  findExistingUserIdsDb,
  findPlaceholdersOfMemoryDb,
  findOpenUploadSessionDb,
};
