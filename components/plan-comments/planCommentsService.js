
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const { requireMembership, parseJson, loadItem, pick, assertLinkHasUrl, logUnexpected, requireItem, normalizeAssignees, eventFor } = require('../plan-items/planItemsService');
const { httpError } = require('../../middleware/errorHandling/httpError');
const dl = require('./planCommentsDatalink');
const { summarizeReactions } = require('./planSocialReader');

const CREATABLE_TYPES = new Set(['note', 'idea', 'todo', 'link']);

const updateItem = async (userId, memoryId, itemId, patch) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      const current = await requireItem(conn, memoryId, itemId, { forUpdate: true });
      const fields = pick(patch, dl.UPDATABLE_COLUMNS);

      if (current.type === 'poll') {
        if ('status' in fields && fields.status !== current.status) {
          throw httpError(400, 'Use the poll endpoints to decide or reopen a poll', 'POLL_STATUS_LOCKED');
        }
        if (fields.category === 'dates') {
          throw httpError(400, 'Polls cannot be in the dates category', 'POLL_CATEGORY_DATES');
        }
      }
      if (fields.type && fields.type !== current.type && !CREATABLE_TYPES.has(current.type)) {
        throw httpError(400, `A ${current.type} cannot change its type`, 'ITEM_TYPE_LOCKED');
      }
      assertLinkHasUrl(
        fields.type ?? current.type,
        'payload' in fields ? fields.payload : parseJson(current.payload),
      );

      await dl.updateItemDb(conn, memoryId, itemId, fields);

      let added = [];
      let removed = [];
      if (patch.assignees !== undefined) {
        const before = (await dl.findAssigneesDb(conn, [itemId])).map(a => a.user_id);
        const after = await normalizeAssignees(conn, memoryId, patch.assignees);
        added = after.filter(id => !before.includes(id));
        removed = before.filter(id => !after.includes(id));
        if (added.length || removed.length) await dl.replaceAssigneesDb(conn, itemId, after);
      }

      const itemTitle = fields.title ?? current.title;
      for (const event of eventFor(current, fields, added, removed)) {
        await dl.insertEventDb(conn, { memoryId, userId, itemId, itemTitle, ...event });
      }

      return loadItem(conn, memoryId, itemId, userId);
    });
  } catch (error) {
    logUnexpected('updateItem', error);
    throw error;
  }
};

const isAuthor = (comment, userId) => String(comment.user_id) === String(userId);

/** Loads a comment of this item or throws 404. */
const requireComment = async (conn, itemId, commentId, opts) => {
  const comment = await dl.findCommentDb(conn, itemId, commentId, opts);
  if (!comment) throw httpError(404, 'Comment not found', 'COMMENT_NOT_FOUND');
  return comment;
};

const listComments = async (userId, memoryId, itemId, { limit = 50, before = null } = {}) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      await requireItem(conn, memoryId, itemId);

      // Fetch one extra row to know whether another page exists without a COUNT query.
      const rows = await dl.findCommentsDb(conn, itemId, { limit: limit + 1, before });
      const hasMore = rows.length > limit;
      return { comments: hasMore ? rows.slice(0, limit) : rows, hasMore };
    });
  } catch (error) {
    logUnexpected('listComments', error);
    throw error;
  }
};

const addComment = async (userId, memoryId, itemId, body) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      await requireItem(conn, memoryId, itemId);

      const commentId = await dl.insertCommentDb(conn, itemId, userId, body);
      return requireComment(conn, itemId, commentId); // re-read so created_at etc. come from the DB
    });
  } catch (error) {
    logUnexpected('addComment', error);
    throw error;
  }
};

const editComment = async (userId, memoryId, itemId, commentId, body) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      await requireItem(conn, memoryId, itemId);

      const comment = await requireComment(conn, itemId, commentId, { forUpdate: true });
      if (!isAuthor(comment, userId)) {
        throw httpError(403, 'You can only edit your own comments', 'COMMENT_EDIT_FORBIDDEN');
      }
      if (comment.body === body) return comment; // no change, so no "edited" marker

      await dl.updateCommentDb(conn, itemId, commentId, body);
      return requireComment(conn, itemId, commentId);
    });
  } catch (error) {
    logUnexpected('editComment', error);
    throw error;
  }
};

const deleteComment = async (userId, memoryId, itemId, commentId) => {
  try {
    await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      await requireItem(conn, memoryId, itemId);

      const comment = await requireComment(conn, itemId, commentId, { forUpdate: true });
      if (!isAuthor(comment, userId)) {
        throw httpError(403, 'You can only delete your own comments', 'COMMENT_DELETE_FORBIDDEN');
      }
      await dl.deleteCommentDb(conn, itemId, commentId);
    });
  } catch (error) {
    logUnexpected('deleteComment', error);
    throw error;
  }
};

/**
 * Idempotently adds (on = true) or removes (on = false) the caller's reaction on an item.
 * Returns the item's up-to-date reaction summary.
 */
const setReaction = async (userId, memoryId, itemId, reaction, on) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      await requireItem(conn, memoryId, itemId);

      if (on) await dl.insertReactionDb(conn, itemId, userId, reaction);
      else await dl.deleteReactionDb(conn, itemId, userId, reaction);

      const rows = await dl.findReactionsDb(conn, [itemId]);
      return summarizeReactions(rows, userId);
    });
  } catch (error) {
    logUnexpected('setReaction', error);
    throw error;
  }
};

module.exports = { updateItem, setReaction, listComments, addComment, editComment, deleteComment };