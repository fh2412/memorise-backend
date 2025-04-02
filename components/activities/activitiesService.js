const { addActivityToDatabase, fetchActivityFromDatabase, fetchAllActivitiesFromDatabase, addUserActivityToDatabase,
    addLocationToDatabase,
    addWeatherRelationsToDatabase,
    addSeasonRelationsToDatabase,
    updateActivityFiles,
    setActivityToActive } = require('./activitiesDataAccess')
const logger = require('../../middleware/logger');

const createActivity = async (title) => {
    try {
        return await addActivityToDatabase(title);
    } catch (error) {
        logger.error(`Service error; Error createActivity: ${error.message}`);
        throw error;
    }
};

const getActivityById = async (activityId) => {
    try {
        return await fetchActivityFromDatabase(activityId);
    } catch (error) {
        logger.error(`Service error; Error getActivityById: ${error.message}`);
        throw error;
    }
};

const getAllActivities = async () => {
    try {
        return await fetchAllActivitiesFromDatabase();
    } catch (error) {
        logger.error(`Service error; Error getAllActivities: ${error.message}`);
        throw error;
    }
};

/**
 * Creates a new activity with all related data
 * @param {Object} activityData - All data needed for activity creation
 * @returns {Promise<Object>} Object with activityId
 */
const createUserActivity = async (activityData) => {
    try {
        // Start a transaction
        // Note: If you're using a database that supports transactions, you should implement them here

        // 1. If location provided, create it
        let locationId = null;
        if (activityData.location.longitude !== 0 && activityData.location.latitude !== 0) {
            locationId = await addLocationToDatabase(activityData.location);
        }
        else {
            locationId = 1;
        }

        if (activityData.isIndoorFlag) {
            activityData.isIndoorFlag = 'Indoor';
        } else {
            activityData.isIndoorFlag = 'Outdoor';
        }

        // 2. Create activity
        const activityId = await addUserActivityToDatabase({
            title: activityData.title,
            description: activityData.description,
            creatorId: activityData.creatorId,
            groupSizeMin: activityData.groupSizeMin,
            groupSizeMax: activityData.groupSizeMax,
            isIndoorFlag: activityData.isIndoorFlag,
            commercialFlag: activityData.commercialFlag,
            prize: activityData.prize,
            locationId: locationId,
            websiteUrl: activityData.websiteUrl
        });

        // 3. Add weather relations if provided
        if (activityData.weathers && activityData.weathers.length > 0) {
            await addWeatherRelationsToDatabase(activityId, activityData.weathers);
        }

        // 4. Add season relations if provided
        if (activityData.seasons && activityData.seasons.length > 0) {
            await addSeasonRelationsToDatabase(activityId, activityData.seasons);
        }

        // Return the created activity ID
        return { activityId };
    } catch (error) {
        logger.error(`Service error; Error createActivity: ${error.message}`);
        throw error;
    }
};

/**
 * Updates an activity with file URLs
 * @param {string|number} activityId - The ID of the activity
 * @param {string} titlePictureUrl - URL of the title picture
 * @param {string[]} supportingDocUrls - Array of supporting document URLs
 * @returns {Promise<void>}
 */
const updateActivityWithFiles = async (activityId, titlePictureUrl, supportingDocUrls) => {
    try {
        // Store supporting doc URLs as JSON string if provided
        const storageUrl = supportingDocUrls && supportingDocUrls.length > 0
            ? JSON.stringify(supportingDocUrls)
            : null;

        await updateActivityFiles(activityId, titlePictureUrl, storageUrl);
    } catch (error) {
        logger.error(`Service error; Error updateActivityWithFiles: ${error.message}`);
        throw error;
    }
};

/**
 * Finalizes an activity after creation
 * @param {string|number} activityId - The ID of the activity
 * @returns {Promise<void>}
 */
const finalizeActivity = async (activityId) => {
    try {
        // Set activity to active status
        await setActivityToActive(activityId);
    } catch (error) {
        logger.error(`Service error; Error finalizeActivity: ${error.message}`);
        throw error;
    }
};

module.exports = {
    createActivity,
    getActivityById,
    getAllActivities,
    createUserActivity,
    updateActivityWithFiles,
    finalizeActivity
};