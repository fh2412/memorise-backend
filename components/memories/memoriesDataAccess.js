const db = require('../../config/db');
const logger = require('../../middleware/logger');
const crypto = require('crypto');

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
const fetchCreatedMemoriesFromDB = async (userId, ascending, page, pageSize) => {
    const orderDirection = ascending ? 'ASC' : 'DESC';
    const offset = page * pageSize;
    
    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM memories
        WHERE memories.user_id = ?`;
    
    // Get paginated data
    const dataQuery = `
        SELECT memories.*, users.name AS username, location.latitude, location.longitude
        FROM memories
        JOIN users ON memories.user_id = users.user_id
        JOIN location ON memories.location_id = location.location_id
        WHERE memories.user_id = ?
        ORDER BY memories.memory_date ${orderDirection}
        LIMIT ? OFFSET ?`;
    
    try {
        const [[countResult]] = await db.query(countQuery, [userId]);
        const [rows] = await db.query(dataQuery, [userId, pageSize, offset]);
        
        return {
            data: rows,
            total: countResult.total,
            page: page,
            pageSize: pageSize
        };
    } catch (error) {
        logger.error(`Data Access error; Error fetching created memories: ${error.message}`);
        throw error;
    }
};

const fetchUserAllMemoriesFromDB = async (userId, ascending, page, pageSize) => {
    const orderDirection = ascending ? 'ASC' : 'DESC';
    const offset = page * pageSize;
    
    // Get total count
    const countQuery = `
        SELECT COUNT(DISTINCT memories.memory_id) as total
        FROM memories
        LEFT JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id 
            AND user_has_memory.user_id = ?
        WHERE memories.user_id = ? OR user_has_memory.user_id = ?`;
    
    // Get paginated data
    const dataQuery = `
        SELECT DISTINCT 
            memories.*, 
            users.name AS username, 
            location.latitude, 
            location.longitude
        FROM memories
        JOIN users ON memories.user_id = users.user_id
        JOIN location ON memories.location_id = location.location_id
        LEFT JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id 
            AND user_has_memory.user_id = ?
        WHERE memories.user_id = ? OR user_has_memory.user_id = ?
        ORDER BY memories.memory_date ${orderDirection}
        LIMIT ? OFFSET ?`;
    
    try {
        const [[countResult]] = await db.query(countQuery, [userId, userId, userId]);
        const [rows] = await db.query(dataQuery, [userId, userId, userId, pageSize, offset]);
        
        return {
            data: rows,
            total: countResult.total,
            page: page,
            pageSize: pageSize
        };
    } catch (error) {
        logger.error(`Data Access error; Error fetching all memories: ${error.message}`);
        throw error;
    }
};

const fetchMemoriesSearchDataFromDB = async (userId, includeShared) => {
    let query;
    let params;
    
    if (includeShared) {
        // Get memories created by user OR shared with user
        query = `
            SELECT DISTINCT 
                memories.memory_id,
                memories.title,
                memories.text
            FROM memories
            LEFT JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id 
                AND user_has_memory.user_id = ?
            WHERE memories.user_id = ? OR user_has_memory.user_id = ?`;
        params = [userId, userId, userId];
    } else {
        // Get only memories created by user
        query = `
            SELECT 
                memory_id,
                title,
                text
            FROM memories
            WHERE user_id = ?`;
        params = [userId];
    }
    
    try {
        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching search data for memories (${query}): ${error.message}`);
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

const fetchMemoryDetailFriends = async (memoryId, userId) => {
    const query = `
      SELECT u.user_id, u.name, u.dob, u.profilepic, u.country,
    CASE
        WHEN f1.status IS NOT NULL THEN f1.status
        WHEN f2.status IS NOT NULL THEN f2.status
        ELSE 'none'
    END AS friendship_status FROM user_has_memory AS uh
    JOIN
        users AS u ON uh.user_id = u.user_id
    LEFT JOIN
        friendships AS f1 ON (
            f1.user_id1 = u.user_id AND f1.user_id2 = ?
        )
    LEFT JOIN
        friendships AS f2 ON (
            f2.user_id1 = ? AND f2.user_id2 = u.user_id
        )
    WHERE
        uh.memory_id = ?;
    `;

    try {
        const [rows] = await db.execute(query, [userId, userId, memoryId]);
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

const incrementPictureCountInDB = async (memoryId, increment) => {
    const query = `
        UPDATE memories 
        SET picture_count = picture_count + ? 
        WHERE memory_id = ?
    `;
    
    try {
        const [result] = await db.execute(query, [increment, memoryId]);
        
        // Get the updated count
        if (result.affectedRows > 0) {
            const [rows] = await db.execute(
                'SELECT picture_count FROM memories WHERE memory_id = ?',
                [memoryId]
            );
            
            return {
                affectedRows: result.affectedRows,
                newCount: rows[0]?.picture_count || 0
            };
        }
        
        return { affectedRows: 0, newCount: null };
    } catch (error) {
        logger.error(`Data Access error; Error incrementing picture count (${query}): ${error.message}`);
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

/**
 * Generate or retrieve share token for a memory
 */
const getOrCreateShareToken = async (memoryId) => {
    // First check if token already exists
    const checkQuery = 'SELECT share_token FROM memories WHERE memory_id = ?';

    try {
        const [rows] = await db.query(checkQuery, [memoryId]);

        if (rows.length === 0) {
            throw new Error('Memory not found');
        }

        // If token exists, return it
        if (rows[0].share_token) {
            return rows[0].share_token;
        }

        // Generate new token
        const shareToken = crypto.randomBytes(32).toString('base64url');

        // Update memory with new token
        const updateQuery = 'UPDATE memories SET share_token = ? WHERE memory_id = ?';
        await db.query(updateQuery, [shareToken, memoryId]);

        return shareToken;
    } catch (error) {
        logger.error(`Data Access error; Error in getOrCreateShareToken: ${error.message}`);
        throw error;
    }
};

/**
 * Find memory by share token
 */
const fetchMemoryByShareToken = async (token) => {
    const query = `
        SELECT m.*, u.name AS username, l.latitude, l.longitude
        FROM memories m
        JOIN users u ON m.user_id = u.user_id
        JOIN location l ON m.location_id = l.location_id
        WHERE m.share_token = ?
    `;

    try {
        const [rows] = await db.query(query, [token]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching memory by share token: ${error.message}`);
        throw error;
    }
};

/**
 * Check if user is a member of a memory (creator or added friend)
 */
const checkUserMemoryMembership = async (memoryId, userId) => {
    const query = `
        SELECT 
            CASE 
                WHEN m.user_id = ? THEN TRUE
                WHEN uh.user_id IS NOT NULL THEN TRUE
                ELSE FALSE
            END AS is_member
        FROM memories m
        LEFT JOIN user_has_memory uh ON m.memory_id = uh.memory_id AND uh.user_id = ?
        WHERE m.memory_id = ?
        LIMIT 1
    `;

    try {
        const [rows] = await db.query(query, [userId, userId, memoryId]);
        return rows.length > 0 && rows[0].is_member === 1;
    } catch (error) {
        logger.error(`Data Access error; Error checking user membership: ${error.message}`);
        throw error;
    }
};

/**
 * Add user to memory via share token (same as addUserToMemory but explicit)
 */
const addUserToMemoryViaToken = async (userId, memoryId) => {
    // Check if user is already a member
    const checkQuery = `
        SELECT * FROM user_has_memory 
        WHERE user_id = ? AND memory_id = ?
    `;

    try {
        const [existing] = await db.query(checkQuery, [userId, memoryId]);

        if (existing.length > 0) {
            return { alreadyMember: true };
        }

        // Add user to memory
        const insertQuery = `
            INSERT INTO user_has_memory (user_id, memory_id, status) 
            VALUES (?, ?, 'friend')
        `;
        await db.query(insertQuery, [userId, memoryId]);

        return { alreadyMember: false };
    } catch (error) {
        logger.error(`Data Access error; Error adding user to memory via token: ${error.message}`);
        throw error;
    }
};

module.exports = {
    fetchUsersForMemoryFromDB,
    fetchCreatedMemoriesFromDB,
    fetchUserAllMemoriesFromDB,
    fetchMemoryByIdFromDB,
    fetchMemoryFriendsFromDB,
    fetchMemoryDetailFriends,
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
    getOrCreateShareToken,
    fetchMemoryByShareToken,
    checkUserMemoryMembership,
    addUserToMemoryViaToken,
    incrementPictureCountInDB,
    fetchMemoriesSearchDataFromDB
}