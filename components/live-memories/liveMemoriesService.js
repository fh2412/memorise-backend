const logger = require('../../middleware/logger');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const { groupBy, toBool } = require('../plan-shared/planDb');
const { tripDay } = require('../plan-shared/phase');
const { findCrewDb } = require('../plan-overview/planOverviewDatalink');
const { toCrew } = require('../plan-overview/planOverviewService');
const { keyOf } = require('../plan-expenses/planExpensesLedger');
const { loadBalanceSummary } = require('../plan-expenses/planExpensesReader');
const dl = require('./liveMemoriesDatalink');

const MAX_LIVE = 5;

/** One booking can produce two events today (check-in + check-out on the same day). */
const todayEvents = (rows, today) => {
  const events = [];
  for (const b of rows) {
    const base = { item_id: b.item_id, title: b.title, kind: b.kind, transport_mode: b.transport_mode };
    if (b.starts_at?.startsWith(today)) events.push({ ...base, type: 'start', at: b.starts_at, tz: b.start_tz });
    if (b.ends_at?.startsWith(today)) events.push({ ...base, type: 'end', at: b.ends_at, tz: b.end_tz ?? b.start_tz });
  }
  return events.sort((a, b) => a.at.localeCompare(b.at));
};

const listLive = async (userId, today) => {
  try {
    return await withTransaction(async (conn) => {
      const memories = await dl.findLiveMemoriesDb(conn, userId, today, MAX_LIVE);
      if (memories.length === 0) return [];

      const ids = memories.map(m => m.memory_id);
      const crew = groupBy(await findCrewDb(conn, ids), 'memory_id');
      const bookings = groupBy(await dl.findBookingsTodayDb(conn, ids, today), 'memory_id');
      const polls = new Map((await dl.findOpenPollCountsDb(conn, ids, userId))
        .map(r => [r.memory_id, { open: Number(r.open_polls), unvoted: Number(r.unvoted) || 0 }]));

      const viewerKey = keyOf('user', userId);
      const result = [];
      for (const m of memories) {
        result.push({
          memory_id: String(m.memory_id),
          title: m.title,
          title_pic: m.title_pic,
          memory_date: m.memory_date,
          memory_end_date: m.memory_end_date,
          phase: 'live',
          is_owner: toBool(m.is_owner),
          location: m.city || m.country ? { city: m.city ?? '', country: m.country ?? '' } : null,
          crew_members: toCrew(crew.get(m.memory_id) ?? []),
          today: {
            date: today,
            ...tripDay(m.memory_date, m.memory_end_date, today),
            events: todayEvents(bookings.get(m.memory_id) ?? [], today),
            open_polls: polls.get(m.memory_id)?.open ?? 0,
            unvoted_polls: polls.get(m.memory_id)?.unvoted ?? 0,
          },
          expenses: await loadBalanceSummary(conn, m.memory_id, viewerKey),
        });
      }
      return result;
    });
  } catch (error) {
    if (!error.status) logger.error(`Service error; listLive: ${error.message}`);
    throw error;
  }
};

module.exports = { listLive };
