const logger = require('../../middleware/logger');

const run = async (conn, query, params = []) => {
  try {
    const [rows] = await conn.query(query, params);
    return rows;
  } catch (error) {
    logger.error(`Data Access error; (${query.trim().split('\n')[0]}): ${error.message}`);
    throw error;
  }
};

const inList = (values) => values.map(() => '?').join(',');

const findSettingsDb = async (conn, memoryId) => {
  const rows = await run(conn, `
    SELECT DATE_FORMAT(range_start, '%Y-%m-%d') AS range_start,
           DATE_FORMAT(range_end, '%Y-%m-%d')   AS range_end,
           min_days, max_days
    FROM plan_date_finder
    WHERE memory_id = ?
  `, [memoryId]);
  return rows[0] ?? null;
};

const upsertSettingsDb = (conn, memoryId, userId, s) => run(conn, `
  INSERT INTO plan_date_finder (memory_id, range_start, range_end, min_days, max_days, updated_by)
  VALUES (?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    range_start = VALUES(range_start), range_end = VALUES(range_end),
    min_days = VALUES(min_days), max_days = VALUES(max_days), updated_by = VALUES(updated_by)
`, [memoryId, s.rangeStart, s.rangeEnd, s.minDays, s.maxDays, userId]);

const findResponsesDb = (conn, memoryId) => run(conn, `
  SELECT user_id, updated_at FROM plan_availability_responses WHERE memory_id = ?
`, [memoryId]);

const findMarksDb = (conn, memoryId) => run(conn, `
  SELECT user_id, DATE_FORMAT(day, '%Y-%m-%d') AS day, state
  FROM plan_availability
  WHERE memory_id = ?
  ORDER BY day
`, [memoryId]);

/** Also locks the response row → saves of the same user are serialised. */
const upsertResponseDb = (conn, memoryId, userId) => run(conn, `
  INSERT INTO plan_availability_responses (memory_id, user_id) VALUES (?, ?)
  ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
`, [memoryId, userId]);

const replaceMarksDb = async (conn, memoryId, userId, marks) => {
  await run(conn, 'DELETE FROM plan_availability WHERE memory_id = ? AND user_id = ?', [memoryId, userId]);
  if (marks.length === 0) return;
  await run(conn,
    `INSERT INTO plan_availability (memory_id, user_id, day, state) VALUES ${marks.map(() => '(?, ?, ?, ?)').join(', ')}`,
    marks.flatMap(m => [memoryId, userId, m.day, m.state]));
};

/** Plain (non-locking) read; deleting by PK afterwards avoids gap locks on plan_events. */
const findRecentEventIdsDb = async (conn, memoryId, userId, action, minutes) => {
  const rows = await run(conn, `
    SELECT event_id FROM plan_events
    WHERE memory_id = ? AND user_id = ? AND action = ? AND created_at > NOW() - INTERVAL ? MINUTE
  `, [memoryId, userId, action, minutes]);
  return rows.map(r => r.event_id);
};

const deleteEventsByIdDb = async (conn, eventIds) => {
  if (eventIds.length === 0) return;
  await run(conn, `DELETE FROM plan_events WHERE event_id IN (${inList(eventIds)})`, eventIds);
};

module.exports = {
  findSettingsDb, upsertSettingsDb, findResponsesDb, findMarksDb,
  upsertResponseDb, replaceMarksDb, findRecentEventIdsDb, deleteEventsByIdDb,
};