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

/** Locks the memory row so concurrent date changes are serialised. */
const findMemoryDatesForUpdateDb = async (conn, memoryId) => {
  const rows = await run(conn, `
    SELECT DATE_FORMAT(memory_date, '%Y-%m-%d')     AS memory_date,
           DATE_FORMAT(memory_end_date, '%Y-%m-%d') AS memory_end_date
    FROM memories
    WHERE memory_id = ?
    FOR UPDATE
  `, [memoryId]);
  return rows[0] ?? null;
};

const updateMemoryDatesDb = (conn, memoryId, startDate, endDate) => run(conn, `
  UPDATE memories SET memory_date = ?, memory_end_date = ? WHERE memory_id = ?
`, [startDate, endDate, memoryId]);


module.exports = {
  updateMemoryFieldsDb,
  setMemoryLocationDb,
  listMemoryUserIdsDb,
  removeUserFromMemoryDb, 
  findMemoryDatesForUpdateDb, 
  updateMemoryDatesDb
};
