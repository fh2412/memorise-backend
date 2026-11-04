const logger = require('../../middleware/logger');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const { groupBy, toBool } = require('../plan-shared/planDb');
const { computeProgress } = require('../plan-progress/planProgressReader');
const dl = require('./planOverviewDatalink');

/** Creator first; a creator who is also in user_has_memory appears once. */
const toCrew = (rows) => {
  const byKey = new Map();
  for (const r of rows) {
    const isPlaceholder = toBool(r.is_placeholder);
    const key = `${isPlaceholder ? 'p' : 'u'}:${r.user_id}`;
    if (byKey.has(key) && !toBool(r.is_creator)) continue;
    byKey.set(key, {
      user_id: r.user_id,
      name: r.name,
      profilepic_thumb: r.profilepic_thumb,
      isCreator: toBool(r.is_creator),
      isPlaceholder,
    });
  }
  return [...byKey.values()].sort((a, b) => Number(b.isCreator) - Number(a.isCreator));
};

const listMyPlans = async (userId) => {
  try {
    return await withTransaction(async (conn) => {
      const plans = await dl.findMyActivePlansDb(conn, userId);
      if (plans.length === 0) return [];

      const ids = plans.map(p => p.memory_id);
      const crew = groupBy(await dl.findCrewDb(conn, ids), 'memory_id');
      const progress = await computeProgress(conn, ids);

      return plans.map(p => ({
        memory_id: p.memory_id,
        title: p.title,
        memory_date: p.memory_date,
        memory_end_date: p.memory_end_date,
        is_owner: toBool(p.is_owner),
        location: p.city || p.country ? { city: p.city ?? '', country: p.country ?? '' } : null,
        last_activity_at: p.last_activity_at,
        crew_members: toCrew(crew.get(p.memory_id) ?? []),
        progress: progress.get(p.memory_id),
      }));
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; listMyPlans: ${error.message}`);
    throw error;
  }
};

module.exports = { listMyPlans };