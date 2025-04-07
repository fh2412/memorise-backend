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

const fetchAllUserActivitiesFromDatabase = async (userId) => {
    const query = 'SELECT id, title, group_size_min AS groupSizeMin, group_size_max AS groupSizeMax, indoor_outdoor_flag AS indoor, prize AS costs, title_image_url AS firebaseUrl FROM activity WHERE creator_id = ?';

    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting all activities from user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchSuggestedActivitiesFromDatabase = async (userId) => {
    const query = 'SELECT id, title, group_size_min AS groupSizeMin, group_size_max AS groupSizeMax, indoor_outdoor_flag AS indoor, prize AS costs, title_image_url AS firebaseUrl FROM activity WHERE creator_id = ?';

    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting suggested activities for user (${query}): ${error.message}`);
        throw error;
    }
};
/**
 * Adds a new activity to the database
 * @param {Object} activity - Activity data
 * @returns {Promise<number>} The ID of the inserted activity
 */
const addUserActivityToDatabase = async (activity) => {
    const query = `
        INSERT INTO activity (
            title, 
            description, 
            creator_id, 
            creation_date, 
            active_flag, 
            comercial_flag, 
            group_size_min,
            group_size_max,  
            indoor_outdoor_flag, 
            prize, 
            location_id,
            website_url
        ) VALUES (?, ?, ?, NOW(), 1, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const params = [
            activity.title,
            activity.description || 'no description added',
            activity.creatorId,
            activity.commercialFlag ? 1 : 0,
            activity.groupSizeMin || 1,
            activity.groupSizeMax || 10,
            activity.isIndoorFlag,
            activity.prize || 0,
            activity.locationId || 1,
            activity.websiteUrl || null
        ];

        const result = await db.query(query, params);
        return result[0].insertId;
    } catch (error) {
        logger.error(`Data Access error; Error creating activity (${query}): ${error.message}`);
        throw error;
    }
};

/**
 * Adds a location to the database
 * @param {Object} location - Location data
 * @returns {Promise<number>} The ID of the inserted location
 */
const addLocationToDatabase = async (location) => {
    const query = `
        INSERT INTO location (
            longitude, 
            latitude, 
            country, 
            locality
        ) VALUES (?, ?, ?, ?)
    `;

    try {
        const params = [
            location.longitude || null,
            location.latitude || null,
            location.country || null,
            location.locality || null
        ];

        const result = await db.query(query, params);
        return result[0].insertId;
    } catch (error) {
        logger.error(`Data Access error; Error creating location (${query}): ${error.message}`);
        throw error;
    }
};

/**
 * Adds weather relations for an activity
 * @param {number} activityId - The ID of the activity
 * @param {Array} weathers - Array of weather IDs
 * @returns {Promise<void>}
 */
const addWeatherRelationsToDatabase = async (activityId, weathers) => {
    const query = `INSERT INTO has_weather (activity_id, weather_id) VALUES ?`;

    try {
        // Format values for bulk insert
        const values = weathers.map(weatherId => [activityId, weatherId]);

        await db.query(query, [values]);
    } catch (error) {
        logger.error(`Data Access error; Error adding weather relations (${query}): ${error.message}`);
        throw error;
    }
};

/**
 * Adds season relations for an activity
 * @param {number} activityId - The ID of the activity
 * @param {Array} seasons - Array of season IDs
 * @returns {Promise<void>}
 */
const addSeasonRelationsToDatabase = async (activityId, seasons) => {
    const query = `INSERT INTO has_season (activity_id, season_id) VALUES ?`;

    try {
        // Format values for bulk insert
        const values = seasons.map(seasonId => [activityId, seasonId]);

        await db.query(query, [values]);
    } catch (error) {
        logger.error(`Data Access error; Error adding season relations (${query}): ${error.message}`);
        throw error;
    }
};

/**
 * Updates an activity with file URLs
 * @param {number} activityId - The ID of the activity
 * @param {string} titleImageUrl - URL of the title image
 * @param {string} storageUrl - JSON string containing supporting doc URLs
 * @returns {Promise<void>}
 */
const updateActivityFiles = async (activityId, titleImageUrl) => {
    const query = `
        UPDATE activity 
        SET 
            title_image_url = ? 
        WHERE id = ?
    `;

    try {
        await db.query(query, [
            titleImageUrl || null,
            activityId
        ]);
    } catch (error) {
        logger.error(`Data Access error; Error updating activity files (${query}): ${error.message}`);
        throw error;
    }
};

/**
 * Sets an activity to active status
 * @param {number} activityId - The ID of the activity
 * @returns {Promise<void>}
 */
const setActivityToActive = async (activityId) => {
    const query = `UPDATE activity SET active_flag = 1 WHERE id = ?`;

    try {
        await db.query(query, [activityId]);
    } catch (error) {
        logger.error(`Data Access error; Error setting activity to active (${query}): ${error.message}`);
        throw error;
    }
};

module.exports = {
    addActivityToDatabase,
    fetchActivityFromDatabase,
    fetchAllActivitiesFromDatabase,
    addUserActivityToDatabase,
    addLocationToDatabase,
    addWeatherRelationsToDatabase,
    addSeasonRelationsToDatabase,
    updateActivityFiles,
    setActivityToActive,
    fetchAllUserActivitiesFromDatabase,
    fetchSuggestedActivitiesFromDatabase
}