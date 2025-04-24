const db = require('../../config/db');
const logger = require('../../middleware/logger');

const fetchBookmarkedActivitiesFromDatabase = async (userId) => {
    const query = `
        SELECT a.* 
        FROM activity a
        JOIN is_bookmarked b ON a.id = b.activity_id
        WHERE b.user_id = ?
    `;
    try {
        const [rows] = await db.query(query, [userId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error selecting bookmarked activities (${query}): ${error.message}`);
        throw error;
    }
};

const insertBookmarkToDatabase = async (userId, activityId) => {
    const query = 'INSERT INTO is_bookmarked (user_id, activity_id) VALUES (?, ?)';
    try {
        const [result] = await db.query(query, [userId, activityId]);
        return result;
    } catch (error) {
        logger.error(`Data Access error; Error inserting bookmark (${query}): ${error.message}`);
        throw error;
    }
};

const deleteBookmarkFromDatabase = async (userId, activityId) => {
    const query = 'DELETE FROM is_bookmarked WHERE user_id = ? AND activity_id = ?';
    try {
        const [result] = await db.query(query, [userId, activityId]);
        return result;
    } catch (error) {
        logger.error(`Data Access error; Error deleting bookmark (${query}): ${error.message}`);
        throw error;
    }
};

module.exports = {
    fetchBookmarkedActivitiesFromDatabase,
    insertBookmarkToDatabase,
    deleteBookmarkFromDatabase
}