const { run, inList } = require('../plan-shared/planDb');

/**
 * Plans the user is crew of, until their last day (live trips included).
 * CURDATE() uses the DB session time zone.
 */
const findMyActivePlansDb = (conn, userId) => run(conn, `
  SELECT m.memory_id, m.title, m.title_pic_thumb,
         LEFT(m.memory_date, 10)     AS memory_date,
         LEFT(m.memory_end_date, 10) AS memory_end_date,
         (m.user_id = ?) AS is_owner,
         l.locality AS city, l.country AS country,
         (SELECT MAX(e.created_at) FROM plan_events e WHERE e.memory_id = m.memory_id) AS last_activity_at
  FROM memories m
  LEFT JOIN location l ON l.location_id = m.location_id AND m.location_id <> 1
  WHERE (m.user_id = ?
         OR EXISTS (SELECT 1 FROM user_has_memory uhm
                    WHERE uhm.memory_id = m.memory_id AND uhm.user_id = ?))
    AND (m.memory_date IS NULL
         OR LEFT(COALESCE(NULLIF(m.memory_end_date, ''), m.memory_date), 10) >= CURDATE())
  ORDER BY m.memory_date, m.memory_id
`, [userId, userId, userId]);


/** Lean crew (no email/dob/gender) incl. placeholders, for many memories at once. */
const findCrewDb = (conn, ids) => run(conn, `
  SELECT uhm.memory_id, u.user_id, u.name, u.profilepic_thumb, 0 AS is_creator, 0 AS is_placeholder
  FROM user_has_memory uhm JOIN users u ON u.user_id = uhm.user_id
  WHERE uhm.memory_id IN (${inList(ids)})
  UNION ALL
  SELECT m.memory_id, u.user_id, u.name, u.profilepic_thumb, 1, 0
  FROM memories m JOIN users u ON u.user_id = m.user_id
  WHERE m.memory_id IN (${inList(ids)})
  UNION ALL
  SELECT phm.memory_id, p.id, p.name, NULL, 0, 1
  FROM placeholder_has_memory phm JOIN placeholders p ON p.id = phm.placeholder_id
  WHERE phm.memory_id IN (${inList(ids)})
`, [...ids, ...ids, ...ids]);

module.exports = { findMyActivePlansDb, findCrewDb };