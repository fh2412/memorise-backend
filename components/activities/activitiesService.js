const { addActivityToDatabase, fetchActivityFromDatabase, fetchAllActivitiesFromDatabase } = require('./activitiesDataAccess')
const logger = require('../../middleware/logger');

const createActivity = async (title) => {
    try {
        return await addActivityToDatabase(title);
    } catch (error) {
        logger.error('Service error:', error.message);
        throw error;
    }
};

const getActivityById = async (activityId) => {
    try {
        return await fetchActivityFromDatabase(activityId);
    } catch (error) {
        logger.error('Service error:', error.message);
        throw error;
    }
};

const getAllActivities = async () => {
    try {
        return await fetchAllActivitiesFromDatabase();
    } catch (error) {
        logger.error('Service error:', error.message);
        throw error;
    }
};

module.exports = {
    createActivity,
    getActivityById,
    getAllActivities,
};