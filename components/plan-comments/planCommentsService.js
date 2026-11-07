
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const { requireMembership, parseJson, loadItem, pick, assertLinkHasUrl, logUnexpected, requireItem, normalizeAssignees, eventFor } = require('../plan-items/planItemsService');
const { httpError } = require('../../middleware/errorHandling/httpError');
const dl = require('./planCommentsDatalink');

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

  module.exports = { updateItem };