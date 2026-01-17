const db = require('../../config/db');
const logger = require('../../middleware/logger');

const updateUserStorageTakenDb = async (userId, newSpace) => {
    const query = `
        UPDATE users
        SET used_storage_space = GREATEST(0, used_storage_space + ?)
        WHERE user_id = ?;
    `;
    try {
        await db.query(query, [newSpace, userId]);
    } catch (error) {
        logger.error(`Data Access error; Error updating used_storage_spac (${query}): ${error.message}`);
        throw error;
    }
};


module.exports = {
    updateUserStorageTakenDb
}