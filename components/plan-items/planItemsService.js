const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const dl = require('./planItemsDatalink');

const CREATABLE_TYPES = new Set(['note', 'idea', 'todo', 'link']);
const LAYOUT_ONLY = new Set(['board_x', 'board_y', 'color']); // dragging cards doesn't spam the feed

const logUnexpected = (fn, error) => {
  if (!error.status) logger.error(`Service error; ${fn}: ${error.message}`);
};

// ---------- public ----------

const listItems = async (userId, memoryId) => {
  try {
    return await withTransaction(async (conn) => {
      const membership = await requireMembership(conn, memoryId, userId);
      const rows = await dl.findItemsDb(conn, memoryId);
      const assignees = groupAssignees(await dl.findAssigneesDb(conn, rows.map(r => r.item_id)));
      return {
        items: rows.map(r => toApiItem(r, assignees.get(r.item_id))),
        viewer: { userId, isOwner: membership.isCreator },
      };
    });
  } catch (error) {
    logUnexpected('listItems', error);
    throw error;
  }
};

const listEvents = async (userId, memoryId, { limit = 30, before = null, after = null } = {}) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      return dl.findEventsDb(conn, memoryId, { limit, before, after });
    });
  } catch (error) {
    logUnexpected('listEvents', error);
    throw error;
  }
};

const createItem = async (userId, memoryId, input) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      assertLinkHasUrl(input.type, input.payload);
      const assignees = await normalizeAssignees(conn, memoryId, input.assignees);

      const itemId = await dl.insertItemDb(conn, memoryId, userId, input);
      if (assignees.length) await dl.replaceAssigneesDb(conn, itemId, assignees);
      await dl.insertEventDb(conn, { memoryId, userId, action: 'item_created', itemId, itemTitle: input.title });

      return loadItem(conn, memoryId, itemId);
    });
  } catch (error) {
    logUnexpected('createItem', error);
    throw error;
  }
};

const updateItem = async (userId, memoryId, itemId, patch) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);
      const current = await requireItem(conn, memoryId, itemId, { forUpdate: true });
      const fields = pick(patch, dl.UPDATABLE_COLUMNS);

      if (fields.type && fields.type !== current.type && !CREATABLE_TYPES.has(current.type)) {
        throw httpError(400, `A ${current.type} cannot change its type`, 'ITEM_TYPE_LOCKED');
      }
      assertLinkHasUrl(
        fields.type ?? current.type,
        'payload' in fields ? fields.payload : parseJson(current.payload),
      );

      await dl.updateItemDb(conn, memoryId, itemId, fields);

      const assigneesChanged = patch.assignees !== undefined;
      if (assigneesChanged) {
        await dl.replaceAssigneesDb(conn, itemId, await normalizeAssignees(conn, memoryId, patch.assignees));
      }

      const action = eventFor(current, fields, assigneesChanged);
      if (action) {
        await dl.insertEventDb(conn, {
          memoryId, userId, action, itemId, itemTitle: fields.title ?? current.title,
        });
      }

      return loadItem(conn, memoryId, itemId);
    });
  } catch (error) {
    logUnexpected('updateItem', error);
    throw error;
  }
};

/** Allowed for the item's creator and the memory's creator (owner). */
const deleteItem = async (userId, memoryId, itemId) => {
  try {
    await withTransaction(async (conn) => {
      const membership = await requireMembership(conn, memoryId, userId);
      const current = await requireItem(conn, memoryId, itemId, { forUpdate: true });

      if (!membership.isCreator && current.created_by !== userId) {
        throw httpError(403, 'Only the item creator or the plan owner can delete this item', 'ITEM_DELETE_FORBIDDEN');
      }

      await dl.deleteItemDb(conn, memoryId, itemId);
      await dl.insertEventDb(conn, { memoryId, userId, action: 'item_deleted', itemId, itemTitle: current.title });
    });
  } catch (error) {
    logUnexpected('deleteItem', error);
    throw error;
  }
};


// ---------- helpers ----------

/** 404 instead of 403: don't reveal that a memory exists to non-members. */
const requireMembership = async (conn, memoryId, userId) => {
  const membership = await dl.findMembershipDb(conn, memoryId, userId);
  if (!membership) throw httpError(404, 'Memory not found', 'MEMORY_NOT_FOUND');
  return membership;
};

const requireItem = async (conn, memoryId, itemId, opts) => {
  const item = await dl.findItemDb(conn, memoryId, itemId, opts);
  if (!item) throw httpError(404, 'Plan item not found', 'ITEM_NOT_FOUND');
  return item;
};

const loadItem = async (conn, memoryId, itemId) => {
  const row = await requireItem(conn, memoryId, itemId);
  const assignees = await dl.findAssigneesDb(conn, [itemId]);
  return toApiItem(row, assignees.map(a => a.user_id));
};

/** Dedupes and ensures every assignee is crew. Placeholders can't be assigned (no user_id). */
const normalizeAssignees = async (conn, memoryId, assignees) => {
  if (!assignees?.length) return [];
  const unique = [...new Set(assignees)];
  const crew = new Set(await dl.findCrewUserIdsDb(conn, memoryId));
  if (unique.some(id => !crew.has(id))) {
    throw httpError(400, 'Assignee is not part of the crew', 'ASSIGNEE_NOT_IN_CREW');
  }
  return unique;
};

const assertLinkHasUrl = (type, payload) => {
  if (type === 'link' && typeof payload?.url !== 'string') {
    throw httpError(400, 'A link item needs payload.url', 'LINK_URL_REQUIRED');
  }
};

/** Returns the feed action for a patch, or null for layout-only / no-op changes. */
const eventFor = (current, fields, assigneesChanged) => {
  if (fields.status && fields.status !== current.status) {
    if (fields.status === 'done') return 'item_completed';
    if (fields.status === 'dismissed') return 'item_dismissed';
    if (current.status === 'done') return 'item_reopened';
  }
  const changed = Object.keys(fields).some((k) => {
    if (LAYOUT_ONLY.has(k) || k === 'status') return false;
    if (k === 'payload') return JSON.stringify(fields.payload ?? null) !== JSON.stringify(parseJson(current.payload));
    return (fields[k] ?? null) !== (current[k] ?? null);
  });
  return changed || assigneesChanged ? 'item_updated' : null;
};

const pick = (obj, keys) => Object.fromEntries(keys.filter(k => k in obj).map(k => [k, obj[k]]));

/** mysql2 parses JSON columns already; the string branch covers MariaDB (JSON = LONGTEXT). */
const parseJson = (value) => {
  if (typeof value !== 'string') return value ?? null;
  try { return JSON.parse(value); } catch { return null; }
};

const groupAssignees = (rows) => {
  const map = new Map();
  for (const { item_id, user_id } of rows) {
    if (!map.has(item_id)) map.set(item_id, []);
    map.get(item_id).push(user_id);
  }
  return map;
};

const toApiItem = (row, assignees = []) => ({ ...row, payload: parseJson(row.payload), assignees });

module.exports = { listItems, createItem, updateItem, deleteItem, listEvents };