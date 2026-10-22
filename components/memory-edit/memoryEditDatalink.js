// New queries for editing a memory. All functions run inside a transaction (`conn`).
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

const updateMemoryFieldsDb = async (conn, memoryId, { title, text, startDate, endDate }) => {
  await run(conn, `
    UPDATE memories
    SET title = ?, text = ?, memory_date = ?, memory_end_date = ?
    WHERE memory_id = ?
  `, [title, text, startDate, endDate, memoryId]);
};

const setMemoryLocationDb = async (conn, memoryId, locationId) => {
  await run(conn, 'UPDATE memories SET location_id = ? WHERE memory_id = ?', [locationId, memoryId]);
};

/** Real users linked to the memory (all statuses). */
const listMemoryUserIdsDb = async (conn, memoryId) => {
  const rows = await run(conn, 'SELECT user_id FROM user_has_memory WHERE memory_id = ?', [memoryId]);
  return rows.map(r => r.user_id);
};

const removeUserFromMemoryDb = async (conn, memoryId, userId) => {
  await run(conn, 'DELETE FROM user_has_memory WHERE memory_id = ? AND user_id = ?', [memoryId, userId]);
};

module.exports = {
  updateMemoryFieldsDb,
  setMemoryLocationDb,
  listMemoryUserIdsDb,
  removeUserFromMemoryDb,
};
