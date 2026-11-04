const { run, inList } = require('../plan-shared/planDb');

const findMemoryFactsDb = (conn, ids) => run(conn, `
  SELECT memory_id,
         (memory_date IS NOT NULL) AS has_dates,
         (location_id IS NOT NULL AND location_id <> 1) AS has_location
  FROM memories
  WHERE memory_id IN (${inList(ids)})
`, ids);

const findDecidedCategoriesDb = (conn, ids) => run(conn, `
  SELECT DISTINCT i.memory_id, i.category
  FROM plan_items i
  JOIN plan_polls p ON p.item_id = i.item_id
  WHERE i.memory_id IN (${inList(ids)}) AND i.type = 'poll' AND p.decided_option_id IS NOT NULL
`, ids);

const findTodoCountsDb = (conn, ids) => run(conn, `
  SELECT memory_id, COUNT(*) AS total, SUM(status = 'done') AS done
  FROM plan_items
  WHERE memory_id IN (${inList(ids)}) AND type = 'todo' AND status <> 'dismissed'
  GROUP BY memory_id
`, ids);

const findMilestoneStatesDb = async (conn, ids) => {
  if (ids.length === 0) return [];
  return run(conn,
    `SELECT memory_id, milestone, state FROM plan_milestones WHERE memory_id IN (${inList(ids)})`, ids);
};

const upsertMilestoneDb = (conn, memoryId, milestone, state, userId) => run(conn, `
  INSERT INTO plan_milestones (memory_id, milestone, state, updated_by) VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE state = VALUES(state), updated_by = VALUES(updated_by)
`, [memoryId, milestone, state, userId]);

const deleteMilestoneDb = (conn, memoryId, milestone) => run(conn,
  'DELETE FROM plan_milestones WHERE memory_id = ? AND milestone = ?', [memoryId, milestone]);

module.exports = {
  findMemoryFactsDb, findDecidedCategoriesDb, findTodoCountsDb,
  findMilestoneStatesDb, upsertMilestoneDb, deleteMilestoneDb,
};