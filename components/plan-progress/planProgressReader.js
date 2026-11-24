const { groupBy, toBool } = require('../plan-shared/planDb');
const dl = require('./planProgressDatalink');

const MILESTONES = ['dates', 'destination', 'stay', 'transport'];

/**
 * Derived data wins over manual states: a decided stay poll counts as done even if "skipped".
 * The frontend mirrors this logic for the workspace (instant updates without a reload).
 */
const buildProgress = ({ hasDates, hasLocation, decided, manual, todos }) => ({
  milestones: MILESTONES.map((key) => {
    const auto = key === 'dates' ? hasDates
      : key === 'destination' ? hasLocation || decided.has('destination')
      : decided.has(key);
    if (auto) return { key, state: 'done', source: 'auto' };
    const state = manual.get(key);
    return state ? { key, state, source: 'manual' } : { key, state: 'open', source: null };
  }),
  todos,
});

/** Map<memoryId, { milestones, todos }> – 4 queries regardless of how many plans. */
const computeProgress = async (conn, ids) => {
  const result = new Map();
  if (ids.length === 0) return result;

  const facts = await dl.findMemoryFactsDb(conn, ids);
  const decided = groupBy(await dl.findDecidedCategoriesDb(conn, ids), 'memory_id');
  const manual = groupBy(await dl.findMilestoneStatesDb(conn, ids), 'memory_id');
  const todos = new Map((await dl.findTodoCountsDb(conn, ids))
    .map(t => [t.memory_id, { done: Number(t.done) || 0, total: Number(t.total) }]));

  for (const f of facts) {
    result.set(f.memory_id, buildProgress({
      hasDates: toBool(f.has_dates),
      hasLocation: toBool(f.has_location),
      decided: new Set((decided.get(f.memory_id) ?? []).map(r => r.category)),
      manual: new Map((manual.get(f.memory_id) ?? []).map(r => [r.milestone, r.state])),
      todos: todos.get(f.memory_id) ?? { done: 0, total: 0 },
    }));
  }
  return result;
};

module.exports = { MILESTONES, buildProgress, computeProgress };