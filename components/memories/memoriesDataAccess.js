const db = require('../../config/db');
const logger = require('../../middleware/logger');

const fetchUsersForMemoryFromDB = async (memoryId) => {
    const query = `
        SELECT u.* 
        FROM users u 
        INNER JOIN user_has_memory um ON u.user_id = um.user_id
        WHERE um.memory_id = ?`;

    try {
        const [rows] = await db.query(query, [memoryId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching users for memory (${query}): ${error.message}`);
        throw error;
    }
};

const fetchCreatedMemoriesFromDB = async (userId) => {
    const query = `
        SELECT memories.*, users.name AS username, location.latitude, location.longitude
        FROM memories
        JOIN users ON memories.user_id = users.user_id
        JOIN location ON memories.location_id = location.location_id
        WHERE memories.user_id = ?`;

    try {
        const [rows] = await db.query(query, [userId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching created memories for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchAddedMemoriesFromDB = async (userId) => {
    const query = `
        SELECT memories.*, users.name AS username, location.latitude, location.longitude
        FROM memories
        JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id
        JOIN users ON memories.user_id = users.user_id
        JOIN location ON memories.location_id = location.location_id
        WHERE user_has_memory.user_id = ?`;

    try {
        const [rows] = await db.query(query, [userId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching added memories for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchAllMemoriesFromDB = async (userId) => {
    const query = `
        SELECT memory_id, title
        FROM memories
        WHERE user_id = ?

        UNION ALL

        SELECT memories.memory_id, memories.title
        FROM memories
        INNER JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id
        WHERE user_has_memory.user_id = ?`;

    try {
        const [combinedRows] = await db.query(query, [userId, userId]);
        return combinedRows.map(memory => ({
            memory_id: memory.memory_id,
            title: memory.title
        }));
    } catch (error) {
        logger.error(`Data Access error; Error fetching all memories for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchMemoryByIdFromDB = async (memoryId) => {
    const query = `
        SELECT * 
        FROM memories 
        WHERE memory_id = ?`;

    try {
        const [rows] = await db.query(query, [memoryId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching memory by memoryId (${query}): ${error.message}`);
        throw error;
    }
};

const fetchMemoryFriendsFromDB = async (memoryId, userId) => {
    const query = `
        SELECT u.name, u.user_id, u.dob, u.profilepic, u.country
        FROM users u
        INNER JOIN user_has_memory um ON u.user_id = um.user_id
        WHERE um.memory_id = ? AND u.user_id != ?`;

    try {
        const [rows] = await db.query(query, [memoryId, userId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching friends for memoryId: ${memoryId}, userId: ${userId}: ${error.message}`);
        throw error;
    }
};

const fetchMemoryFriends = async (memoryId) => {
    const query = `
      SELECT u.user_id, u.name, u.dob, u.profilepic, u.country
      FROM user_has_memory AS uh
      JOIN users AS u ON uh.user_id = u.user_id
      WHERE uh.memory_id = ?
    `;

    try {
        const [rows] = await db.execute(query, [memoryId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching friends for memoryId: ${memoryId}: ${error.message}`);
        throw error;
    }
};

const getSharedMemoriesCount = async (userId1, userId2) => {
    const query = `
      SELECT COUNT(DISTINCT m.memory_id) AS sharedMemoriesCount
      FROM memories AS m
      LEFT JOIN user_has_memory AS uh1 ON m.memory_id = uh1.memory_id AND uh1.user_id = ?
      LEFT JOIN user_has_memory AS uh2 ON m.memory_id = uh2.memory_id AND uh2.user_id = ?
      WHERE 
        (uh1.user_id IS NOT NULL AND uh2.user_id IS NOT NULL)
        OR (m.user_id = ? AND uh2.user_id IS NOT NULL)
        OR (m.user_id = ? AND uh1.user_id IS NOT NULL)
    `;

    try {
        const [result] = await db.execute(query, [userId1, userId2, userId1, userId2]);
        return result[0]?.sharedMemoriesCount || 0;
    } catch (error) {
        logger.error(`Data Access error; Error fetching shared memory count: ${error.message}`);
        throw error;
    }
};

const createMemoryInDB = async ({ creator_id, title, description, firestore_bucket_url, location_id, memory_date, memory_end_date, title_pic, activity_id }) => {
    const query = `
        INSERT INTO memories (user_id, title, text, image_url, location_id, memory_date, memory_end_date, title_pic, activity_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.query(query, [creator_id, title, description, firestore_bucket_url, location_id, memory_date, memory_end_date, title_pic, activity_id]);
        return result.insertId;
    } catch (error) {
        logger.error(`Data Access error; Error inserting memory (${query}): ${error.message}`);
        throw error;
    }
};

const getUserIdByEmail = async (email) => {
    const query = 'SELECT user_id FROM users WHERE email = ?';

    try {
        const [result] = await db.query(query, [email]);
        return result.length > 0 ? result[0].user_id : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching user ID by email (${query}): ${error.message}`);
        throw error;
    }
};

const addUserToMemory = async (userId, memoryId) => {
    const query = 'INSERT INTO user_has_memory (user_id, memory_id, status) VALUES (?, ?, ?)';

    try {
        await db.query(query, [userId, memoryId, 'friend']);
    } catch (error) {
        logger.error(`Data Access error; Error adding user to memory (${query}): ${error.message}`);
        throw error;
    }
};

const updateMemoryInDB = async (memoryId, updateData) => {
    const { title, description, memory_date, memory_end_date } = updateData;
    const query = 'UPDATE memories SET title = ?, text = ?, memory_date = ?, memory_end_date = ? WHERE memory_id = ?';

    try {
        const [result] = await db.execute(query, [title, description, memory_date, memory_end_date, memoryId]);
        return result;
    } catch (error) {
        logger.error(`Data Access error; Error updating memory (${query}): ${error.message}`);
        throw error;
    }
};

const updatePictureCountInDB = async (memoryId, pictureCount) => {
    const query = 'UPDATE memories SET picture_count = ? WHERE memory_id = ?';

    try {
        const [result] = await db.execute(query, [pictureCount, memoryId]);
        return result;
    } catch (error) {
        logger.error(`Data Access error; Error updating picture count (${query}): ${error.message}`);
        throw error;
    }
};

const updateLocationInDB = async (memoryId, locationId) => {
    const query = 'UPDATE memories SET location_id = ? WHERE memory_id = ?';

    try {
        const [result] = await db.execute(query, [locationId, memoryId]);
        return result;
    } catch (error) {
        logger.error(`Data Access error; Error updating location (${query}): ${error.message}`);
        throw error;
    }
};

const updateTitlePicInDB = async (imageId, imageUrl) => {
    const query = 'UPDATE memories SET title_pic = ? WHERE image_url = ?';
    try {
        const [result] = await db.execute(query, [imageUrl, imageId]);
        return result;
    } catch (error) {
        logger.error(`Data Access error; Error updating title picture (${query}): ${error.message}`);
        throw error;
    }
};

const checkMemoryExists = async (memoryId) => {
    const query = 'SELECT * FROM memories WHERE memory_id = ?';

    try {
        const [result] = await db.query(query, [memoryId]);
        return result.length > 0;
    } catch (error) {
        logger.error(`Data Access error; Error checking memory existence (${query}): ${error.message}`);
        throw error;
    }
};

const deleteFriendsByMemoryId = async (memoryId) => {
    const query = 'DELETE FROM user_has_memory WHERE memory_id = ?';

    try {
        await db.query(query, [memoryId]);
    } catch (error) {
        logger.error(`Data Access error; Error deleting friends (${query}): ${error.message}`);
        throw error;
    }
};

const deleteMemoryById = async (memoryId) => {
    const query = 'DELETE FROM memories WHERE memory_id = ?';

    try {
        await db.query(query, [memoryId]);
    } catch (error) {
        logger.error(`Data Access error; Error deleting memory (${query}): ${error.message}`);
        throw error;
    }
};

const deleteFriendFromMemory = async (userId, memoryId) => {
    const query = 'DELETE FROM user_has_memory WHERE user_id = ? AND memory_id = ?';

    try {
        await db.query(query, [userId, memoryId]);
    } catch (error) {
        logger.error(`Data Access error; Error deleting friend from memory (${query}): ${error.message}`);
        throw error;
    }
};

module.exports = {
    fetchUsersForMemoryFromDB,
    fetchCreatedMemoriesFromDB,
    fetchAddedMemoriesFromDB,
    fetchAllMemoriesFromDB,
    fetchMemoryByIdFromDB,
    fetchMemoryFriendsFromDB,
    fetchMemoryFriends,
    getSharedMemoriesCount,
    createMemoryInDB,
    getUserIdByEmail,
    addUserToMemory,
    updateMemoryInDB,
    updatePictureCountInDB,
    updateLocationInDB,
    updateTitlePicInDB,
    checkMemoryExists,
    deleteFriendsByMemoryId,
    deleteMemoryById,
    deleteFriendFromMemory,
}