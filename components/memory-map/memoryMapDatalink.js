const db = require('../../config/db');
const logger = require('../../middleware/logger');

const NO_LOCATION_ID = 1;

/**
 * Finished memories with a location that the user created OR is a member of.
 * - EXISTS instead of LEFT JOIN + DISTINCT → no duplicates, uses the indexes
 * - is_pinned = pinned to THIS user's profile (favourite_memories)
 * - dates formatted in SQL → plain "YYYY-MM-DD", no time zone shift
 */
const listMapMemoriesDb = async (userId) => {
  const query = `
    SELECT
      m.memory_id,
      m.title,
      DATE_FORMAT(m.memory_date, '%Y-%m-%d')                              AS start_date,
      DATE_FORMAT(IFNULL(m.memory_end_date, m.memory_date), '%Y-%m-%d')   AS end_date,
      m.title_pic,
      m.title_pic_thumb,
      m.picture_count,
      l.latitude,
      l.longitude,
      l.locality,
      l.country,
      (m.user_id = ?) AS is_owner,
      EXISTS (
        SELECT 1 FROM favourite_memories f
        WHERE f.user_id = ? AND f.memory_id = m.memory_id
      ) AS is_pinned
    FROM memories m
    JOIN location l ON l.location_id = m.location_id
    WHERE (
        m.user_id = ?
        OR EXISTS (SELECT 1 FROM user_has_memory u WHERE u.memory_id = m.memory_id AND u.user_id = ?)
      )
      AND m.memory_date IS NOT NULL
      AND IFNULL(m.memory_end_date, m.memory_date) <= CURDATE()
      AND m.location_id <> ?
      AND l.latitude IS NOT NULL
      AND l.longitude IS NOT NULL
    ORDER BY m.memory_date DESC, m.memory_id DESC
  `;

  try {
    const [rows] = await db.query(query, [userId, userId, userId, userId, NO_LOCATION_ID]);
    return rows;
  } catch (error) {
    logger.error(`Data Access error; Error fetching map memories: ${error.message}`);
    throw error;
  }
};

module.exports = { listMapMemoriesDb };
