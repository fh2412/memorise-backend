const db = require('../../config/db');
const logger = require('../../middleware/logger');

const fetchMemoryCountFromDB = async (userId) => {
    const query = `
        SELECT count(memory_id) as count
        FROM memories
        WHERE user_id = ?`;

    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching memory count for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchMemoryCountByYearFromDB = async (userId, year) => {
    const query = `
        SELECT count(memory_id) as count
        FROM memories
        WHERE user_id = ? AND YEAR(memory_date) = ?`;

    try {
        const [rows] = await db.query(query, [userId, year]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching memory count for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchAddedMemoryCountFromDB = async (userId) => {
    const query = `
        SELECT COUNT(DISTINCT memories.memory_id) as total
        FROM memories
        LEFT JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id 
            AND user_has_memory.user_id = ?
        WHERE memories.user_id = ? OR user_has_memory.user_id = ?`;

    try {
        const [[countResult]] = await db.query(query, [userId, userId, userId]);
        return countResult.total;
    } catch (error) {
        logger.error(`Data Access error; Error fetching memory count for users added memories (${query}): ${error.message}`);
        throw error;
    }
};

const fetchFriendCountFromDB = async (userId) => {
    const query = `
        SELECT count(user_id1) as count
        FROM friendships
        WHERE (user_id1 = ? OR user_id2 = ?) AND status = ?`;

    try {
        const [rows] = await db.query(query, [userId, userId, 'accepted']);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching friend count (${query}): ${error.message}`);
        throw error;
    }
};

const fetchSharedMemoriesCountFromDB = async (user1Id, user2Id) => {
    const query = `
        SELECT COUNT(DISTINCT m.memory_id) AS sharedMemoriesCount
        FROM memories AS m
        LEFT JOIN user_has_memory AS uh1 ON m.memory_id = uh1.memory_id AND uh1.user_id = ?
        LEFT JOIN user_has_memory AS uh2 ON m.memory_id = uh2.memory_id AND uh2.user_id = ?
        WHERE 
            (uh1.user_id IS NOT NULL AND uh2.user_id IS NOT NULL)
            OR
            (m.user_id = ? AND uh2.user_id IS NOT NULL)
            OR
            (m.user_id = ? AND uh1.user_id IS NOT NULL)
    `;

    try {
        const [rows] = await db.execute(query, [user1Id, user2Id, user1Id, user2Id]);
        return rows[0]?.sharedMemoriesCount || 0;
    } catch (error) {
        logger.error(`Data Access error; Error fetching shared memories count (${query}): ${error.message}`);
        throw error;
    }
};

module.exports = {
    fetchMemoryCountFromDB, fetchMemoryCountByYearFromDB, fetchAddedMemoryCountFromDB, fetchFriendCountFromDB, fetchSharedMemoriesCountFromDB,
}