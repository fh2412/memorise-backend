const db = require('../../config/db');
const logger = require('../../middleware/logger');

const getFavouriteUserMemoryFromDB = async (userId) => {
    const query = ` SELECT m.*
        FROM favourite_memories fm
        INNER JOIN memories m ON fm.memory_id = m.memory_id
        WHERE fm.user_id = ?`;

    try {
        const [rows] = await db.query(query, [userId]);

        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching users favourite memories (${query}): ${error.message}`);
        throw error;
    }
};

const getFavouriteMemoryFromDB = async (memoryId) => {
    const query = `SELECT * FROM favourite_memories WHERE memory_id = ?`;

    try {
        const [rows] = await db.query(query, [memoryId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching favourite memories (${query}): ${error.message}`);
        throw error;
    }
};

const updateFavouriteMemoryInDB = async (userId, memoryIdToUpdate, updatedMemoryId) => {
    const query = `
          UPDATE favourite_memories
          SET memory_id = ?
          WHERE user_id = ? AND memory_id = ?`;

    try {
        return await db.query(query, [updatedMemoryId, userId, memoryIdToUpdate]);
    } catch (error) {
        logger.error(`Data Access error; Error updating favourite memories (${query}): ${error.message}`);
        throw error;
    }
};

const insterFavouriteMemory = async (userId, memoryId) => {
    const query = `
        INSERT INTO favourite_memories (user_id, memory_id)
        VALUES (?, ?)`;

    try {
        return await db.query(query,
            [userId, memoryId]
        );
    } catch (error) {
        logger.error(`Data Access error; Error creating favourite memories (${query}): ${error.message}`);
        throw error;
    }
};

const deleteFavouriteMemoryFromDB = async (userId, memoryIdToDelete) => {
    const query = `DELETE FROM favourite_memories WHERE user_id = ? AND memory_id = ?`;

    try {
        return await db.query(query,
            [userId, memoryIdToDelete]
        );
    } catch (error) {
        logger.error(`Data Access error; Error delelting favourite memories (${query}): ${error.message}`);
        throw error;
    }
};

const deleteFavouriteMemoryAllFromDB = async (memoryId) => {
    const query = `DELETE FROM favourite_memories WHERE memory_id = ?`;

    try {
        const [rows] = await db.query(query, [memoryId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error delelting favourite memories all (${query}): ${error.message}`);
        throw error;
    }
};


module.exports = {
    getFavouriteUserMemoryFromDB,
    getFavouriteMemoryFromDB,
    updateFavouriteMemoryInDB,
    insterFavouriteMemory,
    deleteFavouriteMemoryFromDB,
    deleteFavouriteMemoryAllFromDB,
}