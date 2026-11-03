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
const locationParams = (loc) => (loc
  ? [loc.lat, loc.lng, loc.city || null, loc.country || null, loc.countryCode || null]
  : [null, null, null, null, null]);

// Timestamps leave the DB as ISO-UTC strings → no driver timezone conversion.
const POLL_COLUMNS = `
  p.item_id, p.multiple, p.max_choices,
  DATE_FORMAT(p.closes_at, '%Y-%m-%dT%H:%i:%sZ') AS closes_at,
  (p.closes_at IS NOT NULL AND p.closes_at <= UTC_TIMESTAMP()) AS is_closed,
  p.allow_member_options, p.hide_results,
  p.decided_option_id, p.decided_by,
  DATE_FORMAT(p.decided_at, '%Y-%m-%dT%H:%i:%sZ') AS decided_at,
  p.source_item_id`;

const SETTING_COLUMNS = ['closes_at', 'allow_member_options', 'hide_results'];

const findPollsDb = async (conn, itemIds) => {
  if (itemIds.length === 0) return [];
  return run(conn, `SELECT ${POLL_COLUMNS} FROM plan_polls p WHERE p.item_id IN (${inList(itemIds)})`, itemIds);
};

/** Locks poll + item row → all writes to one poll are serialised. */
const findPollForUpdateDb = async (conn, memoryId, itemId) => {
  const rows = await run(conn, `
    SELECT ${POLL_COLUMNS}, i.title, i.category, i.status, i.created_by
    FROM plan_polls p
    JOIN plan_items i ON i.item_id = p.item_id
    WHERE p.item_id = ? AND i.memory_id = ?
    FOR UPDATE
  `, [itemId, memoryId]);
  return rows[0] ?? null;
};

const findOptionsDb = async (conn, itemIds) => {
  if (itemIds.length === 0) return [];
  return run(conn, `
    SELECT option_id, item_id, label, sort_order, created_by,
           latitude, longitude, city, country, country_code
    FROM plan_poll_options
    WHERE item_id IN (${inList(itemIds)})
    ORDER BY item_id, sort_order, option_id
  `, itemIds);
};

const findOptionDb = async (conn, itemId, optionId) => {
  const rows = await run(conn, `
    SELECT option_id, item_id, label, sort_order, created_by,
           latitude, longitude, city, country, country_code
    FROM plan_poll_options
    WHERE option_id = ? AND item_id = ?
  `, [optionId, itemId]);
  return rows[0] ?? null;
};

const findVotesDb = async (conn, itemIds) => {
  if (itemIds.length === 0) return [];
  return run(conn, `
    SELECT item_id, option_id, user_id
    FROM plan_poll_votes
    WHERE item_id IN (${inList(itemIds)})
    ORDER BY created_at
  `, itemIds);
};

const insertPollDb = (conn, itemId, s) => run(conn, `
  INSERT INTO plan_polls
    (item_id, multiple, max_choices, closes_at, allow_member_options, hide_results, source_item_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`, [itemId, s.multiple ? 1 : 0, s.maxChoices, s.closesAt, s.allowMemberOptions ? 1 : 0,
    s.hideResults ? 1 : 0, s.sourceItemId]);

const insertOptionDb = async (conn, itemId, userId, { label, location }, sortOrder) => {
  const result = await run(conn, `
    INSERT INTO plan_poll_options
      (item_id, label, sort_order, created_by, latitude, longitude, city, country, country_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [itemId, label, sortOrder, userId, ...locationParams(location)]);
  return result.insertId;
};

/** undefined = unchanged, location null = clear. */
const updateOptionDb = async (conn, itemId, optionId, { label, location }) => {
  const sets = [];
  const params = [];
  if (label !== undefined) { sets.push('label = ?'); params.push(label); }
  if (location !== undefined) {
    sets.push('latitude = ?', 'longitude = ?', 'city = ?', 'country = ?', 'country_code = ?');
    params.push(...locationParams(location));
  }
  if (sets.length === 0) return;
  await run(conn, `UPDATE plan_poll_options SET ${sets.join(', ')} WHERE option_id = ? AND item_id = ?`,
    [...params, optionId, itemId]);
};

const deleteOptionDb = (conn, itemId, optionId) => run(conn,
  'DELETE FROM plan_poll_options WHERE option_id = ? AND item_id = ?', [optionId, itemId]);

const replaceMyVotesDb = async (conn, itemId, userId, optionIds) => {
  await run(conn, 'DELETE FROM plan_poll_votes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
  if (optionIds.length === 0) return;
  await run(conn,
    `INSERT INTO plan_poll_votes (option_id, user_id, item_id) VALUES ${optionIds.map(() => '(?, ?, ?)').join(', ')}`,
    optionIds.flatMap(id => [id, userId, itemId]));
};

const updatePollSettingsDb = async (conn, itemId, fields) => {
  const cols = SETTING_COLUMNS.filter(c => c in fields);
  if (cols.length === 0) return;
  await run(conn, `UPDATE plan_polls SET ${cols.map(c => `${c} = ?`).join(', ')} WHERE item_id = ?`,
    [...cols.map(c => fields[c]), itemId]);
};

/** optionId null = undo the decision. */
const setDecisionDb = (conn, itemId, optionId, userId) => run(conn, `
  UPDATE plan_polls
  SET decided_option_id = ?, decided_by = ?, decided_at = IF(? IS NULL, NULL, UTC_TIMESTAMP())
  WHERE item_id = ?
`, [optionId, userId, optionId, itemId]);

const updateMemoryLocationDb = (conn, memoryId, locationId) => run(conn,
  'UPDATE memories SET location_id = ? WHERE memory_id = ?', [locationId, memoryId]);

const findRecentEventIdsDb = async (conn, { memoryId, userId, itemId, actions, minutes }) => {
  const rows = await run(conn, `
    SELECT event_id FROM plan_events
    WHERE memory_id = ? AND user_id = ? AND item_id = ? AND action IN (${inList(actions)})
      AND created_at > NOW() - INTERVAL ? MINUTE
  `, [memoryId, userId, itemId, ...actions, minutes]);
  return rows.map(r => r.event_id);
};

const deleteEventsByIdDb = async (conn, eventIds) => {
  if (eventIds.length === 0) return;
  await run(conn, `DELETE FROM plan_events WHERE event_id IN (${inList(eventIds)})`, eventIds);
};

module.exports = {
  findPollsDb, findPollForUpdateDb, findOptionsDb, findOptionDb, findVotesDb,
  insertPollDb, insertOptionDb, updateOptionDb, deleteOptionDb, replaceMyVotesDb,
  updatePollSettingsDb, setDecisionDb, updateMemoryLocationDb,
  findRecentEventIdsDb, deleteEventsByIdDb,
};