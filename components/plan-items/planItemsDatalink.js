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
const toJson = (value) => (value == null ? null : JSON.stringify(value));

// DATE → 'YYYY-MM-DD' string, so no timezone shift happens in the JSON response.
const ITEM_COLUMNS = `item_id, memory_id, type, category, status, title, description, payload,
  DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
  board_x, board_y, color, created_by, created_at, updated_at`;

// Column names are only ever taken from this list → safe to interpolate into SET.
const UPDATABLE_COLUMNS = ['type', 'category', 'status', 'title', 'description', 'payload',
  'due_date', 'board_x', 'board_y', 'color'];

/** null if the user is not part of the memory's crew, otherwise { isCreator }. */
const findMembershipDb = async (conn, memoryId, userId) => {
  const rows = await run(conn, `
    SELECT (m.user_id = ?) AS is_creator
    FROM memories m
    WHERE m.memory_id = ?
      AND (m.user_id = ?
           OR EXISTS (SELECT 1 FROM user_has_memory uhm
                      WHERE uhm.memory_id = m.memory_id AND uhm.user_id = ?))
    LIMIT 1
  `, [userId, memoryId, userId, userId]);
  return rows.length ? { isCreator: Number(rows[0].is_creator) === 1 } : null;
};

const findCrewUserIdsDb = async (conn, memoryId) => {
  const rows = await run(conn, `
    SELECT user_id FROM memories WHERE memory_id = ?
    UNION
    SELECT user_id FROM user_has_memory WHERE memory_id = ?
  `, [memoryId, memoryId]);
  return rows.map(r => r.user_id);
};

const findItemsDb = (conn, memoryId) => run(conn, `
  SELECT ${ITEM_COLUMNS}
  FROM plan_items
  WHERE memory_id = ?
  ORDER BY created_at, item_id
`, [memoryId]);

const findItemDb = async (conn, memoryId, itemId, { forUpdate = false } = {}) => {
  const rows = await run(conn, `
    SELECT ${ITEM_COLUMNS}
    FROM plan_items
    WHERE item_id = ? AND memory_id = ?
    ${forUpdate ? 'FOR UPDATE' : ''}
  `, [itemId, memoryId]);
  return rows[0] ?? null;
};

const findAssigneesDb = async (conn, itemIds) => {
  if (itemIds.length === 0) return [];
  return run(conn,
    `SELECT item_id, user_id FROM plan_item_assignees WHERE item_id IN (${inList(itemIds)})`,
    itemIds);
};

const insertItemDb = async (conn, memoryId, userId, item) => {
  const result = await run(conn, `
    INSERT INTO plan_items
      (memory_id, type, category, status, title, description, payload,
       due_date, board_x, board_y, color, created_by)
    VALUES (?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    memoryId, item.type, item.category ?? 'other', item.title, item.description ?? null,
    toJson(item.payload), item.due_date ?? null, item.board_x ?? 40, item.board_y ?? 40,
    item.color ?? null, userId,
  ]);
  return result.insertId;
};

const updateItemDb = async (conn, memoryId, itemId, fields) => {
  const columns = UPDATABLE_COLUMNS.filter(c => c in fields);
  if (columns.length === 0) return;
  const values = columns.map(c => (c === 'payload' ? toJson(fields[c]) : fields[c]));
  await run(conn, `
    UPDATE plan_items SET ${columns.map(c => `${c} = ?`).join(', ')}
    WHERE item_id = ? AND memory_id = ?
  `, [...values, itemId, memoryId]);
};

const replaceAssigneesDb = async (conn, itemId, userIds) => {
  await run(conn, 'DELETE FROM plan_item_assignees WHERE item_id = ?', [itemId]);
  if (userIds.length === 0) return;
  await run(conn,
    `INSERT INTO plan_item_assignees (item_id, user_id) VALUES ${userIds.map(() => '(?, ?)').join(', ')}`,
    userIds.flatMap(id => [itemId, id]));
};

const deleteItemDb = async (conn, memoryId, itemId) => {
  const result = await run(conn,
    'DELETE FROM plan_items WHERE item_id = ? AND memory_id = ?', [itemId, memoryId]);
  return result.affectedRows;
};

const insertEventDb = (conn, { memoryId, userId, action, itemId = null, itemTitle = null }) => run(conn, `
  INSERT INTO plan_events (memory_id, user_id, action, item_id, item_title)
  VALUES (?, ?, ?, ?, ?)
`, [memoryId, userId, action, itemId, itemTitle]);

const findEventsDb = (conn, memoryId, { limit, before = null, after = null }) => {
  const where = ['memory_id = ?'];
  const params = [memoryId];
  if (before != null) { where.push('event_id < ?'); params.push(before); }
  if (after != null) { where.push('event_id > ?'); params.push(after); }
  return run(conn, `
    SELECT event_id, user_id, action, item_id, item_title, created_at
    FROM plan_events
    WHERE ${where.join(' AND ')}
    ORDER BY event_id DESC
    LIMIT ?
  `, [...params, limit]);
};

module.exports = {
  UPDATABLE_COLUMNS,
  findMembershipDb,
  findCrewUserIdsDb,
  findItemsDb,
  findItemDb,
  findAssigneesDb,
  insertItemDb,
  updateItemDb,
  replaceAssigneesDb,
  deleteItemDb,
  insertEventDb,
  findEventsDb,
};