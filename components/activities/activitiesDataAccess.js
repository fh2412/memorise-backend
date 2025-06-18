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

const fetchActivityDetailsFromDatabase = async (activityId) => {
    const query = `
        SELECT 
            id,
            title,
            description,
            creator_id AS creatorId,
            creation_date AS creationDate,
            active_flag AS activeFlag,
            comercial_flag AS commercialFlag,
            group_size_min AS groupSizeMin,
            group_size_max AS groupSizeMax,
            indoor_outdoor_flag AS indoor,
            prize AS costs,
            location_id AS locationId,
            base_memory_id AS baseMemoryId,
            title_image_url AS firebaseUrl,
            website_url AS websiteUrl
        FROM activity
        WHERE id = ?
    `;

    try {
        const [rows] = await db.query(query, [activityId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching activity details (${query}): ${error.message}`);
        throw error;
    }
};

const fetchActivityCreatorNameFromDatabase = async (userId) => {
    const query = `
        SELECT 
            name as creator_name
        FROM users
        WHERE user_id = ?
    `;

    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching activity creator name (${query}): ${error.message}`);
        throw error;
    }
};

const fetchActivityMemoryCountFromDatabase = async (activityId) => {
    const query = `
        SELECT 
            count(memory_id) as memories_count
        FROM memories
        WHERE activity_id = ?
    `;

    try {
        const [rows] = await db.query(query, [activityId]);
        return rows.length > 0 ? rows[0].memories_count : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching activity details (${query}): ${error.message}`);
        throw error;
    }
};

const fetchActivitySeasonsFromDatabase = async (activityId) => {
    const query = `
        SELECT 
            s.season_id,
            s.name
        FROM has_season hs
        JOIN season s ON hs.season_id = s.season_id
        WHERE hs.activity_id = ?
    `;

    try {
        const [rows] = await db.query(query, [activityId]);
        return rows || [];
    } catch (error) {
        logger.error(`Data Access error; Error fetching activity seasons (${query}): ${error.message}`);
        throw error;
    }
};

const fetchActivityWeatherFromDatabase = async (activityId) => {
    const query = `
        SELECT 
            w.weather_id,
            w.name,
            w.icon_name
        FROM has_weather hw
        JOIN weather w ON hw.weather_id = w.weather_id
        WHERE hw.activity_id = ?
    `;

    try {
        const [rows] = await db.query(query, [activityId]);
        return rows || [];
    } catch (error) {
        logger.error(`Data Access error; Error fetching activity weather (${query}): ${error.message}`);
        throw error;
    }
};

const fetchActivityLocationFromDatabase = async (locationId) => {
    if (!locationId) return null;

    const query = `
        SELECT 
            location_id AS location_id,
            longitude,
            latitude,
            country,
            locality
        FROM location
        WHERE location_id = ?
    `;

    try {
        const [rows] = await db.query(query, [locationId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching location details (${query}): ${error.message}`);
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
    const query = `SELECT id as activityId, title, group_size_min AS groupSizeMin, group_size_max AS groupSizeMax, indoor_outdoor_flag AS indoor, prize AS costs, title_image_url AS firebaseUrl 
    FROM activity WHERE creator_id = ? AND active_flag = 1`;

    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting all activities from user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchSuggestedActivitiesFromDatabase = async (userId) => {
    const query = `
        SELECT 
            a.id as activityId, 
            a.title, 
            a.group_size_min AS groupSizeMin, 
            a.group_size_max AS groupSizeMax, 
            a.indoor_outdoor_flag AS indoor, 
            a.prize AS costs, 
            a.title_image_url AS firebaseUrl, 
            a.description 
        FROM 
            activity a
        LEFT JOIN 
            is_bookmarked ib ON a.id = ib.activity_id AND ib.user_id = ?
        WHERE 
            a.creator_id != ? AND 
            a.active_flag = 1 AND
            ib.activity_id IS NULL; 
    `; // ib.activity_id IS NULL means the activity is NOT bookmarked by the user

    try {
        const [rows] = await db.query(query, [userId, userId]); 
        return rows.length > 0 ? rows : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting suggested activities for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchUsersBookmarkedActivitiesFromDatabase = async (userId) => {
    const query = `SELECT a.id as activityId, a.title, a.group_size_min AS groupSizeMin, a.group_size_max AS groupSizeMax, a.title_image_url as firebaseUrl FROM activity a JOIN is_bookmarked b ON a.id = b.activity_id WHERE b.user_id = ?`;

    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting suggested activities for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchFilteredActivitiesFromDatabase = async (filter) => {
    try {
        let params = [];
        let query = `
            SELECT 
                a.id, 
                a.title, 
                a.group_size_min AS groupSizeMin, 
                a.group_size_max AS groupSizeMax, 
                a.indoor_outdoor_flag AS indoor, 
                a.prize AS costs, 
                a.title_image_url AS firebaseUrl
            FROM activity a
            LEFT JOIN location l ON a.location_id = l.location_id
        `;

        // Build WHERE clauses based on filter parameters
        let whereConditions = ['a.active_flag = 1']; // Only active activities

        // Filter by name (using LIKE for partial matches)
        if (filter.name.trim() !== '') {
            whereConditions.push('a.title LIKE ?');
            params.push(`%${filter.name}%`);
        }

        // Filter by group size (activities that can accommodate the requested size)
        if (filter.groupSizeMin > 1) {
            whereConditions.push('a.group_size_min <= ?');
            params.push(filter.groupSizeMin);
        }

        if (filter.groupSizeMax < 16) {
            whereConditions.push('a.group_size_max >= ?');
            params.push(filter.groupSizeMax);
        }

        // Filter by price (assuming price is max willing to pay)
        if (filter.price > 0) {
            whereConditions.push('a.prize <= ?');
            params.push(filter.price);
        }

        // Handle location and distance filtering
        if (filter.location.trim() !== '') {
            // If location is provided, join with location table and calculate distance
            // Using Haversine formula to calculate distance in kilometers
            const [lat, lng] = await geocodeLocation(filter.location);

            if (lat && lng) {
                query += `
                    , (
                        6371 * acos(
                            cos(radians(?)) * 
                            cos(radians(l.latitude)) * 
                            cos(radians(l.longitude) - radians(?)) + 
                            sin(radians(?)) * 
                            sin(radians(l.latitude))
                        )
                    ) AS distance `;

                params.push(lat, lng, lat);

                whereConditions.push('distance <= ?');
                params.push(filter.distance);
            }
        }

        // Season filtering
        if (filter.season.trim() !== '') {
            query += `
                LEFT JOIN has_season hs ON a.id = hs.activity_id
                LEFT JOIN season s ON hs.season_id = s.id `;
            whereConditions.push('s.name = ?');
            params.push(filter.season);
        }

        // Weather filtering
        if (filter.weather.trim() !== '') {
            query += `
                LEFT JOIN has_weather hw ON a.id = hw.activity_id
                LEFT JOIN weather w ON hw.weather_id = w.id `;
            whereConditions.push('w.name = ?');
            params.push(filter.weather);
        }

        // Tag filtering
        if (filter.tag.trim() !== '') {
            query += `
                LEFT JOIN has_tag ht ON a.id = ht.activity_id
                LEFT JOIN tag t ON ht.tag_id = t.id `;
            whereConditions.push('t.name = ?');
            params.push(filter.tag);
        }

        // Add all WHERE conditions
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        // Group by to avoid duplicates due to joins
        query += ' GROUP BY a.id';

        // Order by distance if location is provided
        if (filter.location.trim() !== '') {
            query += ' ORDER BY distance ASC';
        } else {
            query += ' ORDER BY a.title ASC';
        }

        const [rows] = await db.query(query, params);
        return rows.length > 0 ? rows : [];
    } catch (error) {
        logger.error(`Data Access error; Error fetching filtered activities: ${error.message}`);
        throw error;
    }
};

const fetchUserActivityCountFromDatabase = async (userId) => {
    const query = 'SELECT count(id) as activity_count FROM activity WHERE creator_id = ?';

    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting suggested activities for user (${query}): ${error.message}`);
        throw error;
    }
};

const geocodeLocation = async (locationString) => {
    try {
        // This would be replaced with your actual geocoding service
        // e.g., Google Maps Geocoding API, Mapbox, or your own database lookup

        // For example with a third-party geocoding service:
        // const response = await geocodingService.geocode(locationString);
        // return [response.lat, response.lng];

        // Or with a database lookup:
        const [locations] = await db.query(
            'SELECT latitude, longitude FROM location WHERE locality LIKE ?',
            [`%${locationString}%`]
        );

        if (locations.length > 0) {
            return [locations[0].latitude, locations[0].longitude];
        }

        return [null, null];
    } catch (error) {
        logger.error(`Geocoding error for location "${locationString}": ${error.message}`);
        return [null, null];
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
            website_url,
            base_memory_id
        ) VALUES (?, ?, ?, NOW(), 1, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const params = [
            activity.title,
            activity.description || 'no description added',
            activity.creatorId,
            0,
            activity.groupSizeMin || 1,
            activity.groupSizeMax || 10,
            activity.isIndoorFlag,
            activity.prize || 0,
            activity.locationId || 1,
            activity.websiteUrl || null,
            activity.leadMemoryId || null,
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

const updateMemoriesActivityId = async (activityId, memoryId) => {
    const query = `UPDATE memories SET activity_id = ? WHERE memories.memory_id = ?`;

    try {
        await db.query(query, [activityId, memoryId]);
    } catch (error) {
        logger.error(`Data Access error; Error updating memories activityId (${query}): ${error.message}`);
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

const archiveActivityDatabase = async (activityId) => {
    const query = `
        UPDATE activity 
        SET active_flag  = 0 
        WHERE id = ?
    `;

    try {
        await db.query(query, [
            activityId
        ]);
    } catch (error) {
        logger.error(`Data Access error; Error archiving activity (${query}): ${error.message}`);
        throw error;
    }
};

const updateActivityThumbmailDatabase = async (activityId, imageUrl) => {
    const query = `
        UPDATE activity 
        SET title_image_url = ? 
        WHERE id = ?
    `;

    try {
        await db.query(query, [
            imageUrl,
            activityId
        ]);
    } catch (error) {
        logger.error(`Data Access error; Error archiving activity (${query}): ${error.message}`);
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

const updateActivityInDatabase = async (activity) => {
    const query = `
        UPDATE activity
        SET 
            title = ?, 
            description = ?, 
            group_size_min = ?, 
            group_size_max = ?, 
            indoor_outdoor_flag = ?, 
            prize = ?, 
            location_id = ?, 
            website_url = ?, 
            base_memory_id = ?
        WHERE id = ?
    `;

    const params = [
        activity.title,
        activity.description || 'no description added',
        activity.groupSizeMin || 1,
        activity.groupSizeMax || 10,
        activity.isIndoorFlag,
        activity.prize || 0,
        activity.locationId || 1,
        activity.websiteUrl || null,
        activity.leadMemoryId || null,
        activity.activityId
    ];

    try {
        await db.query(query, params);
    } catch (error) {
        logger.error(`Data Access error; Error updating activity (${query}): ${error.message}`);
        throw error;
    }
};

const deleteWeatherRelations = async (activityId) => {
    const query = `DELETE FROM has_weather WHERE activity_id = ?`;
    await db.query(query, [activityId]);
};

const deleteSeasonRelations = async (activityId) => {
    const query = `DELETE FROM has_season WHERE activity_id = ?`;
    await db.query(query, [activityId]);
};


module.exports = {
    addActivityToDatabase,
    fetchActivityDetailsFromDatabase,
    fetchActivitySeasonsFromDatabase,
    fetchActivityWeatherFromDatabase,
    fetchActivityLocationFromDatabase,
    fetchAllActivitiesFromDatabase,
    addUserActivityToDatabase,
    addLocationToDatabase,
    addWeatherRelationsToDatabase,
    addSeasonRelationsToDatabase,
    updateActivityFiles,
    setActivityToActive,
    fetchAllUserActivitiesFromDatabase,
    fetchSuggestedActivitiesFromDatabase,
    fetchFilteredActivitiesFromDatabase,
    fetchActivityCreatorNameFromDatabase,
    fetchActivityMemoryCountFromDatabase,
    updateMemoriesActivityId,
    fetchUserActivityCountFromDatabase,
    archiveActivityDatabase,
    updateActivityInDatabase,
    deleteWeatherRelations,
    deleteSeasonRelations,
    updateActivityThumbmailDatabase,
    fetchUsersBookmarkedActivitiesFromDatabase
}