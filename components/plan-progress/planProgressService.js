const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const planDl = require('../plan-items/planItemsDatalink');
const { requireMembership } = require('../plan-items/planItemsService');
const dl = require('./planProgressDatalink');

const toApi = (rows) => rows.map(r => ({ milestone: r.milestone, state: r.state }));

/** state: 'done' | 'skipped' | null (back to open). Owner only. */
const setMilestone = async (userId, memoryId, milestone, state) => {
  try {
    return await withTransaction(async (conn) => {
      const membership = await requireMembership(conn, memoryId, userId);
      if (!membership.isCreator) {
        throw httpError(403, 'Only the plan owner can change milestones', 'MILESTONE_OWNER_ONLY');
      }

      const current = (await dl.findMilestoneStatesDb(conn, [memoryId])).find(r => r.milestone === milestone);
      if ((current?.state ?? null) !== state) {
        if (state) await dl.upsertMilestoneDb(conn, memoryId, milestone, state, userId);
        else await dl.deleteMilestoneDb(conn, memoryId, milestone);
        await planDl.insertEventDb(conn, {
          memoryId, userId, action: state ? `milestone_${state}` : 'milestone_reset', itemTitle: milestone,
        });
      }
      return toApi(await dl.findMilestoneStatesDb(conn, [memoryId]));
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; setMilestone: ${error.message}`);
    throw error;
  }
};

module.exports = { setMilestone };