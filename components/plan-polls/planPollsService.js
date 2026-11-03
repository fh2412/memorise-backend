const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const { insertLocation } = require('../locations/locationsDataAccess');
const planDl = require('../plan-items/planItemsDatalink');
const { requireMembership, loadItem } = require('../plan-items/planItemsService');
const { toLocation } = require('./planPollsReader');
const dl = require('./planPollsDatalink');

const MAX_OPTIONS = 20;
const VOTE_ACTIONS = ['poll_voted', 'poll_unvoted'];
const VOTE_COALESCE_MINUTES = 360; // one feed entry per user and poll per 6h

const logUnexpected = (fn, error) => {
  if (!error.status) logger.error(`Service error; ${fn}: ${error.message}`);
};

const toUtcDateTime = (iso) => (iso ? new Date(iso).toISOString().slice(0, 19).replace('T', ' ') : null);
const normLabel = (s) => s.trim().toLocaleLowerCase();

const normalizePoll = (row) => ({
  ...row,
  multiple: Number(row.multiple) === 1,
  is_closed: Number(row.is_closed) === 1,
  allow_member_options: Number(row.allow_member_options) === 1,
  hide_results: Number(row.hide_results) === 1,
});

const requirePoll = async (conn, memoryId, itemId) => {
  const row = await dl.findPollForUpdateDb(conn, memoryId, itemId);
  if (!row) throw httpError(404, 'Poll not found', 'POLL_NOT_FOUND');
  return normalizePoll(row);
};

/** Transaction + membership + locked poll. canManage = plan owner or poll creator. */
const withPoll = async (fnName, userId, memoryId, itemId, fn) => {
  try {
    return await withTransaction(async (conn) => {
      const membership = await requireMembership(conn, memoryId, userId);
      const poll = await requirePoll(conn, memoryId, itemId);
      const canManage = membership.isCreator || poll.created_by === userId;
      return fn(conn, { poll, canManage });
    });
  } catch (error) {
    logUnexpected(fnName, error);
    throw error;
  }
};

const assertCanManage = (canManage) => {
  if (!canManage) throw httpError(403, 'Only the plan owner or the poll creator can do this', 'POLL_MANAGE_FORBIDDEN');
};

const assertVotingOpen = (poll) => {
  if (poll.decided_option_id != null) throw httpError(409, 'This poll is already decided', 'POLL_DECIDED');
  if (poll.is_closed) throw httpError(409, 'Voting has closed', 'POLL_CLOSED');
};

const assertUniqueLabel = (options, label, exceptOptionId = null) => {
  const wanted = normLabel(label);
  if (options.some(o => o.option_id !== exceptOptionId && normLabel(o.label) === wanted)) {
    throw httpError(409, 'This option already exists', 'POLL_DUPLICATE_OPTION');
  }
};

/**
 * Always inserts a NEW location row and points the memory at it:
 * row 1 is the shared "no location" row and rows can be shared (e.g. activities).
 */
const writeDestination = async (conn, memoryId, userId, itemId, loc, label) => {
  const locationId = await insertLocation({
    latitude: loc.lat,
    longitude: loc.lng,
    country: loc.country ?? '',
    city: loc.city ?? '',
    countryCode: loc.countryCode ?? '',
  }, conn);
  await dl.updateMemoryLocationDb(conn, memoryId, locationId);
  await planDl.insertEventDb(conn, {
    memoryId, userId, action: 'destination_set', itemId, itemTitle: loc.city || label,
  });
};

// ---------- create ----------

const createPoll = async (userId, memoryId, input) => {
  try {
    return await withTransaction(async (conn) => {
      await requireMembership(conn, memoryId, userId);

      const options = input.options.map(o => ({ label: o.label.trim(), location: o.location ?? null }));
      const minOptions = input.allowMemberOptions ? 1 : 2;
      if (options.length < minOptions) {
        throw httpError(400, `A poll needs at least ${minOptions} options`, 'POLL_TOO_FEW_OPTIONS');
      }
      if (new Set(options.map(o => normLabel(o.label))).size !== options.length) {
        throw httpError(400, 'Options must be unique', 'POLL_DUPLICATE_OPTION');
      }

      let source = null;
      if (input.sourceItemId) {
        source = await planDl.findItemDb(conn, memoryId, input.sourceItemId, { forUpdate: true });
        if (!source || source.type !== 'idea' || source.status === 'dismissed') {
          throw httpError(400, 'Only open ideas can be turned into a poll', 'POLL_SOURCE_INVALID');
        }
      }

      const title = input.title.trim();
      const itemId = await planDl.insertItemDb(conn, memoryId, userId, {
        type: 'poll',
        title,
        description: input.description ?? null,
        category: input.category,
        payload: null,
        board_x: input.board_x ?? source?.board_x,
        board_y: input.board_y ?? source?.board_y,
        color: input.color ?? null,
      });

      const multiple = !!input.multiple;
      await dl.insertPollDb(conn, itemId, {
        multiple,
        maxChoices: multiple ? (input.maxChoices ?? null) : null,
        closesAt: toUtcDateTime(input.closesAt),
        allowMemberOptions: !!input.allowMemberOptions,
        hideResults: !!input.hideResults,
        sourceItemId: source?.item_id ?? null,
      });

      for (const [i, option] of options.entries()) {
        await dl.insertOptionDb(conn, itemId, userId, option, i);
      }

      // Promote-to-poll: the idea is hidden, not deleted
      if (source) await planDl.updateItemDb(conn, memoryId, source.item_id, { status: 'dismissed' });

      await planDl.insertEventDb(conn, { memoryId, userId, action: 'poll_created', itemId, itemTitle: title });
      return loadItem(conn, memoryId, itemId, userId);
    });
  } catch (error) {
    logUnexpected('createPoll', error);
    throw error;
  }
};

// ---------- settings ----------

const updatePollSettings = (userId, memoryId, itemId, input) =>
  withPoll('updatePollSettings', userId, memoryId, itemId, async (conn, { poll, canManage }) => {
    assertCanManage(canManage);
    if (poll.decided_option_id != null) throw httpError(409, 'This poll is already decided', 'POLL_DECIDED');

    const fields = {};
    if ('closesAt' in input) fields.closes_at = toUtcDateTime(input.closesAt); // null removes the deadline
    if ('allowMemberOptions' in input) fields.allow_member_options = input.allowMemberOptions ? 1 : 0;
    if ('hideResults' in input) fields.hide_results = input.hideResults ? 1 : 0;

    await dl.updatePollSettingsDb(conn, itemId, fields);
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'poll_updated', itemId, itemTitle: poll.title });
    return loadItem(conn, memoryId, itemId, userId);
  });

// ---------- votes ----------

/** Replaces all of my votes in this poll. [] withdraws my vote. */
const setMyVotes = (userId, memoryId, itemId, optionIds) =>
  withPoll('setMyVotes', userId, memoryId, itemId, async (conn, { poll }) => {
    assertVotingOpen(poll);

    const unique = [...new Set(optionIds)];
    if (!poll.multiple && unique.length > 1) {
      throw httpError(400, 'Only one choice allowed', 'POLL_SINGLE_CHOICE');
    }
    if (poll.multiple && poll.max_choices && unique.length > poll.max_choices) {
      throw httpError(400, `At most ${poll.max_choices} choices allowed`, 'POLL_TOO_MANY_CHOICES');
    }
    const valid = new Set((await dl.findOptionsDb(conn, [itemId])).map(o => o.option_id));
    if (unique.some(id => !valid.has(id))) {
      throw httpError(400, 'Option does not belong to this poll', 'POLL_OPTION_NOT_FOUND');
    }

    await dl.replaceMyVotesDb(conn, itemId, userId, unique);

    const recent = await dl.findRecentEventIdsDb(conn, {
      memoryId, userId, itemId, actions: VOTE_ACTIONS, minutes: VOTE_COALESCE_MINUTES,
    });
    await dl.deleteEventsByIdDb(conn, recent);
    await planDl.insertEventDb(conn, {
      memoryId, userId, itemId, itemTitle: poll.title,
      action: unique.length ? 'poll_voted' : 'poll_unvoted',
    });

    return loadItem(conn, memoryId, itemId, userId);
  });

// ---------- options ----------

const addOption = (userId, memoryId, itemId, input) =>
  withPoll('addOption', userId, memoryId, itemId, async (conn, { poll, canManage }) => {
    assertVotingOpen(poll);
    if (!poll.allow_member_options && !canManage) {
      throw httpError(403, 'Only the plan owner or the poll creator can add options', 'POLL_OPTIONS_LOCKED');
    }
    const options = await dl.findOptionsDb(conn, [itemId]);
    if (options.length >= MAX_OPTIONS) throw httpError(409, `At most ${MAX_OPTIONS} options`, 'POLL_OPTION_LIMIT');
    assertUniqueLabel(options, input.label);

    const sortOrder = options.reduce((max, o) => Math.max(max, o.sort_order), -1) + 1;
    await dl.insertOptionDb(conn, itemId, userId, { label: input.label.trim(), location: input.location ?? null }, sortOrder);
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'poll_option_added', itemId, itemTitle: poll.title });
    return loadItem(conn, memoryId, itemId, userId);
  });

/** Text fixes keep all votes. Allowed for owner, poll creator and the option's creator. */
const updateOption = (userId, memoryId, itemId, optionId, input) =>
  withPoll('updateOption', userId, memoryId, itemId, async (conn, { poll, canManage }) => {
    const options = await dl.findOptionsDb(conn, [itemId]);
    const option = options.find(o => o.option_id === optionId);
    if (!option) throw httpError(404, 'Option not found', 'POLL_OPTION_NOT_FOUND');
    if (!canManage && option.created_by !== userId) {
      throw httpError(403, 'You cannot edit this option', 'POLL_OPTION_FORBIDDEN');
    }
    if (input.label !== undefined) assertUniqueLabel(options, input.label, optionId);

    await dl.updateOptionDb(conn, itemId, optionId, { label: input.label?.trim(), location: input.location });
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'poll_option_updated', itemId, itemTitle: poll.title });
    return loadItem(conn, memoryId, itemId, userId);
  });

/** Deletes the option and its votes (cascade). */
const deleteOption = (userId, memoryId, itemId, optionId) =>
  withPoll('deleteOption', userId, memoryId, itemId, async (conn, { poll, canManage }) => {
    assertCanManage(canManage);
    const options = await dl.findOptionsDb(conn, [itemId]);
    if (!options.some(o => o.option_id === optionId)) throw httpError(404, 'Option not found', 'POLL_OPTION_NOT_FOUND');
    if (poll.decided_option_id === optionId) {
      throw httpError(409, 'The winning option cannot be removed', 'POLL_OPTION_DECIDED');
    }
    if (options.length <= 1) throw httpError(409, 'A poll needs at least one option', 'POLL_LAST_OPTION');

    await dl.deleteOptionDb(conn, itemId, optionId);
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'poll_option_removed', itemId, itemTitle: poll.title });
    return loadItem(conn, memoryId, itemId, userId);
  });

// ---------- decision ----------

/**
 * Picks the winner. Destination polls write the memory's location if the winner has one
 * (or one is sent along); otherwise needsLocation = true and the client asks for it.
 */
const decidePoll = (userId, memoryId, itemId, { optionId, location }) =>
  withPoll('decidePoll', userId, memoryId, itemId, async (conn, { poll, canManage }) => {
    assertCanManage(canManage);
    if (poll.decided_option_id != null) throw httpError(409, 'This poll is already decided', 'POLL_ALREADY_DECIDED');

    const option = await dl.findOptionDb(conn, itemId, optionId);
    if (!option) throw httpError(400, 'Option does not belong to this poll', 'POLL_OPTION_NOT_FOUND');
    if (location) await dl.updateOptionDb(conn, itemId, optionId, { location });

    await dl.setDecisionDb(conn, itemId, optionId, userId);
    await planDl.updateItemDb(conn, memoryId, itemId, { status: 'decided' });
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'poll_decided', itemId, itemTitle: option.label });

    let needsLocation = false;
    if (poll.category === 'destination') {
      const loc = location ?? toLocation(option);
      if (loc) await writeDestination(conn, memoryId, userId, itemId, loc, option.label);
      else needsLocation = true;
    }

    return { item: await loadItem(conn, memoryId, itemId, userId), needsLocation };
  });

/** Sets the location for an already decided destination poll whose winner had none. */
const setDestination = (userId, memoryId, itemId, { location }) =>
  withPoll('setDestination', userId, memoryId, itemId, async (conn, { poll, canManage }) => {
    assertCanManage(canManage);
    if (poll.category !== 'destination') throw httpError(400, 'Not a destination poll', 'POLL_NOT_DESTINATION');
    if (poll.decided_option_id == null) throw httpError(409, 'Decide the poll first', 'POLL_NOT_DECIDED');

    await dl.updateOptionDb(conn, itemId, poll.decided_option_id, { location });
    const option = await dl.findOptionDb(conn, itemId, poll.decided_option_id);
    await writeDestination(conn, memoryId, userId, itemId, location, option.label);
    return loadItem(conn, memoryId, itemId, userId);
  });

/** Undoes the decision. The memory's location is intentionally left as it is. */
const reopenPoll = (userId, memoryId, itemId) =>
  withPoll('reopenPoll', userId, memoryId, itemId, async (conn, { poll, canManage }) => {
    assertCanManage(canManage);
    if (poll.decided_option_id == null) throw httpError(409, 'This poll is not decided', 'POLL_NOT_DECIDED');

    await dl.setDecisionDb(conn, itemId, null, null);
    await planDl.updateItemDb(conn, memoryId, itemId, { status: 'open' });
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'poll_reopened', itemId, itemTitle: poll.title });
    return loadItem(conn, memoryId, itemId, userId);
  });

module.exports = {
  createPoll, updatePollSettings, setMyVotes, addOption, updateOption, deleteOption,
  decidePoll, setDestination, reopenPoll,
};