const db = require('../../config/db');
const logger = require('../../middleware/logger');

const addActivityToDatabase = async (title) => {
    const query = 'INSERT INTO activity (title) VALUES (?)';

    try {
        const result = await db.query(query, [title]);
        return result[0].insertId;
    } catch (error) {
        logger.error(`Data Access error; Error creating activity (${query}): ${error.message}`);
        throw error;
    }
};

const fetchActivityFromDatabase = async (activityId) => {
    const query = 'SELECT * FROM activity WHERE id = ?';

    try {
        const [rows] = await db.query(query, [activityId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting users comapny (${query}): ${error.message}`);
        throw error;
    }
};

const fetchAllActivitiesFromDatabase = async () => {
    const query = 'SELECT * FROM activity';

    try {
        const [rows] = await db.query(query);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error selecting all activities (${query}): ${error.message}`);
        throw error;
    }
};

module.exports = {
    addActivityToDatabase,
    fetchActivityFromDatabase,
    fetchAllActivitiesFromDatabase,
}