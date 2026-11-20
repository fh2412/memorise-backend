const { run, inList } = require('../plan-shared/planDb');

// One row per memory: plan_destination (label/origin) + the memory's coordinates.
const DESTINATION_SELECT = `
  m.memory_id, m.location_id,
  d.label, d.source_poll_id,
  l.latitude, l.longitude, l.locality, l.country, l.alpha_2_codes
  FROM memories m
  LEFT JOIN plan_destination d ON d.memory_id = m.memory_id
  LEFT JOIN location l ON l.location_id = m.location_id AND m.location_id <> 1`;

const findDestinationsDb = async (conn, memoryIds) => {
  if (memoryIds.length === 0) return [];
  return run(conn, `SELECT ${DESTINATION_SELECT} WHERE m.memory_id IN (${inList(memoryIds)})`, memoryIds);
};

/** Locks the memory row → all destination changes of one memory are serialised. */
const findDestinationForUpdateDb = async (conn, memoryId) => {
  const rows = await run(conn, `SELECT ${DESTINATION_SELECT} WHERE m.memory_id = ? FOR UPDATE`, [memoryId]);
  return rows[0] ?? null;
};

const upsertDestinationDb = (conn, memoryId, { label, sourcePollId, userId }) => run(conn, `
  INSERT INTO plan_destination (memory_id, label, source_poll_id, set_by) VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE label = VALUES(label), source_poll_id = VALUES(source_poll_id), set_by = VALUES(set_by)
`, [memoryId, label, sourcePollId, userId]);

const deleteDestinationDb = (conn, memoryId) => run(conn,
  'DELETE FROM plan_destination WHERE memory_id = ?', [memoryId]);

const setMemoryLocationDb = (conn, memoryId, locationId) => run(conn,
  'UPDATE memories SET location_id = ? WHERE memory_id = ?', [locationId, memoryId]);

module.exports = {
  findDestinationsDb, findDestinationForUpdateDb, upsertDestinationDb, deleteDestinationDb, setMemoryLocationDb,
};
