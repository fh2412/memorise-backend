const { run, inList } = require('../plan-shared/planDb');

/** Memories of the user that are live on `today` (YYYY-MM-DD, browser date). */
const findLiveMemoriesDb = (conn, userId, today, limit) => run(conn, `
  SELECT m.memory_id, m.title, m.title_pic,
        COALESCE(pd.label, NULLIF(l.locality, ''), NULLIF(l.country, '')) AS destination_label,
         DATE_FORMAT(m.memory_date, '%Y-%m-%d')     AS memory_date,
         DATE_FORMAT(m.memory_end_date, '%Y-%m-%d') AS memory_end_date,
         (m.user_id = ?) AS is_owner,
         l.locality AS city, l.country AS country
  FROM memories m
  LEFT JOIN location l ON l.location_id = m.location_id AND m.location_id <> 1
  LEFT JOIN plan_destination pd ON pd.memory_id = m.memory_id
  WHERE (m.user_id = ?
         OR EXISTS (SELECT 1 FROM user_has_memory uhm
                    WHERE uhm.memory_id = m.memory_id AND uhm.user_id = ? AND uhm.status = 'friend'))
    AND m.memory_date IS NOT NULL
    AND m.memory_date <= ?
    AND COALESCE(m.memory_end_date, m.memory_date) >= ?
  ORDER BY m.memory_date DESC, m.memory_id DESC
  LIMIT ?
`, [userId, userId, userId, today, today, limit]);

/** Non-cancelled bookings that start or end on `today` (local booking time). */
const findBookingsTodayDb = (conn, memoryIds, today) => run(conn, `
  SELECT i.memory_id, i.item_id, i.title, b.kind, b.transport_mode,
         DATE_FORMAT(b.starts_at, '%Y-%m-%dT%H:%i') AS starts_at, b.start_tz,
         DATE_FORMAT(b.ends_at, '%Y-%m-%dT%H:%i')   AS ends_at,   b.end_tz
  FROM plan_items i
  JOIN plan_bookings b ON b.item_id = i.item_id
  WHERE i.memory_id IN (${inList(memoryIds)})
    AND i.status <> 'dismissed' AND b.status <> 'cancelled'
    AND (DATE(b.starts_at) = ? OR DATE(b.ends_at) = ?)
`, [...memoryIds, today, today]);

/** Open (undecided, not closed) polls per memory, and how many the viewer hasn't voted on. */
const findOpenPollCountsDb = (conn, memoryIds, userId) => run(conn, `
  SELECT i.memory_id,
         COUNT(*) AS open_polls,
         SUM(NOT EXISTS (SELECT 1 FROM plan_poll_votes v WHERE v.item_id = i.item_id AND v.user_id = ?)) AS unvoted
  FROM plan_items i
  JOIN plan_polls p ON p.item_id = i.item_id
  WHERE i.memory_id IN (${inList(memoryIds)})
    AND i.status <> 'dismissed'
    AND p.decided_option_id IS NULL
    AND (p.closes_at IS NULL OR p.closes_at > UTC_TIMESTAMP())
  GROUP BY i.memory_id
`, [userId, ...memoryIds]);

module.exports = { findLiveMemoriesDb, findBookingsTodayDb, findOpenPollCountsDb };
