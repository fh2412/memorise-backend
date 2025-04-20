const { addActivityToDatabase, fetchActivityDetailsFromDatabase, fetchActivitySeasonsFromDatabase, fetchActivityWeatherFromDatabase, fetchActivityLocationFromDatabase, fetchAllActivitiesFromDatabase, addUserActivityToDatabase,
    addLocationToDatabase,
    addWeatherRelationsToDatabase,
    addSeasonRelationsToDatabase,
    updateActivityFiles,
    setActivityToActive,
    fetchAllUserActivitiesFromDatabase,
    fetchSuggestedActivitiesFromDatabase,
    fetchFilteredActivitiesFromDatabase,
    fetchActivityCreatorNameFromDatabase,
    fetchActivityMemoryCountFromDatabase } = require('./activitiesDataAccess')
const logger = require('../../middleware/logger');

const createActivity = async (title) => {
    try {
        return await addActivityToDatabase(title);
    } catch (error) {
        logger.error(`Service error; Error createActivity: ${error.message}`);
        throw error;
    }
};

const getActivityDetails = async (activityId) => {
    try {
        const activity = await fetchActivityDetailsFromDatabase(activityId);

        if (!activity) {
            return null;
        }

        // Fetch related data in parallel
        const [seasons, weatherConditions, location] = await Promise.all([
            fetchActivitySeasonsFromDatabase(activityId),
            fetchActivityWeatherFromDatabase(activityId),
            fetchActivityLocationFromDatabase(activity.locationId)
        ]);

        // Combine all data
        return {
            ...activity,
            seasons,
            weatherConditions,
            location
        };
    } catch (error) {
        logger.error(`Service error; Error getActivityDetails for ID ${activityId}: ${error.message}`);
        throw error;
    }
};

const getActivityCreatorDetails = async (activityId, userId) => {
    try {
        const creator_name = await fetchActivityCreatorNameFromDatabase(userId);
        const created_activities_count = await fetchActivityMemoryCountFromDatabase(activityId);
        if (!creator_name) {
            return null;
        }

        return {
            ...creator_name,
            created_activities_count,
        };
    } catch (error) {
        logger.error(`Service error; Error getActivityDetails for ID ${activityId}: ${error.message}`);
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

const getAllUserActivities = async (userId) => {
    try {
        return await fetchAllUserActivitiesFromDatabase(userId);
    } catch (error) {
        logger.error(`Service error; Error getAllUserActivities: ${error.message}`);
        throw error;
    }
};

const getSuggestedActivity = async (userId) => {
    try {
        return await fetchSuggestedActivitiesFromDatabase(userId);
    } catch (error) {
        logger.error(`Service error; Error getSuggestedActivity: ${error.message}`);
        throw error;
    }
};

const getFilteredActivities = async (filter) => {
    try {
        return await fetchFilteredActivitiesFromDatabase(filter);
    } catch (error) {
        logger.error(`Service error; Error getFilteredActivities: ${error.message}`);
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
            prize: activityData.costs,
            locationId: locationId,
            websiteUrl: activityData.websiteUrl,
            leadMemoryId: activityData.leadMemoryId
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
const updateActivityWithFiles = async (activityId, titlePictureUrl) => {
    try {
        await updateActivityFiles(activityId, titlePictureUrl);
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
    getActivityDetails,
    getAllActivities,
    createUserActivity,
    updateActivityWithFiles,
    finalizeActivity,
    getAllUserActivities,
    getSuggestedActivity,
    getFilteredActivities,
    getActivityCreatorDetails
};