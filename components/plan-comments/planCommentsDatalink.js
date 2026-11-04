const { run, inList } = require('../plan-shared/planDb');

const COMMENT_COLUMNS = 'comment_id, item_id, user_id, body, created_at, edited_at';

const countCommentsDb = async (conn, itemIds) => {
  if (itemIds.length === 0) return [];
  return run(conn, `
    SELECT item_id, COUNT(*) AS n FROM plan_item_comments
    WHERE item_id IN (${inList(itemIds)}) GROUP BY item_id
  `, itemIds);
};

const findReactionsDb = async (conn, itemIds) => {
  if (itemIds.length === 0) return [];
  return run(conn, `
    SELECT item_id, user_id, reaction FROM plan_item_reactions
    WHERE item_id IN (${inList(itemIds)}) ORDER BY created_at
  `, itemIds);
};

/** Newest first, cursor-paged by comment_id. */
const findCommentsDb = (conn, itemId, { limit, before }) => run(conn, `
  SELECT ${COMMENT_COLUMNS} FROM plan_item_comments
  WHERE item_id = ? ${before ? 'AND comment_id < ?' : ''}
  ORDER BY comment_id DESC
  LIMIT ?
`, before ? [itemId, before, limit] : [itemId, limit]);

const findCommentDb = async (conn, itemId, commentId, { forUpdate = false } = {}) => {
  const rows = await run(conn, `
    SELECT ${COMMENT_COLUMNS} FROM plan_item_comments
    WHERE comment_id = ? AND item_id = ? ${forUpdate ? 'FOR UPDATE' : ''}
  `, [commentId, itemId]);
  return rows[0] ?? null;
};

const insertCommentDb = async (conn, itemId, userId, body) => {
  const result = await run(conn,
    'INSERT INTO plan_item_comments (item_id, user_id, body) VALUES (?, ?, ?)', [itemId, userId, body]);
  return result.insertId;
};

const updateCommentDb = (conn, itemId, commentId, body) => run(conn, `
  UPDATE plan_item_comments SET body = ?, edited_at = CURRENT_TIMESTAMP
  WHERE comment_id = ? AND item_id = ?
`, [body, commentId, itemId]);

const deleteCommentDb = (conn, itemId, commentId) => run(conn,
  'DELETE FROM plan_item_comments WHERE comment_id = ? AND item_id = ?', [commentId, itemId]);

/** Returns 1 if added, 0 if it already existed. */
const insertReactionDb = async (conn, itemId, userId, reaction) => {
  const result = await run(conn, `
    INSERT INTO plan_item_reactions (item_id, user_id, reaction) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE reaction = reaction
  `, [itemId, userId, reaction]);
  return result.affectedRows;
};

const deleteReactionDb = async (conn, itemId, userId, reaction) => {
  const result = await run(conn,
    'DELETE FROM plan_item_reactions WHERE item_id = ? AND user_id = ? AND reaction = ?',
    [itemId, userId, reaction]);
  return result.affectedRows;
};

module.exports = {
  countCommentsDb, findReactionsDb, findCommentsDb, findCommentDb,
  insertCommentDb, updateCommentDb, deleteCommentDb, insertReactionDb, deleteReactionDb,
};