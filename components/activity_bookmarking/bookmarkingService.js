const { fetchBookmarkedActivitiesFromDatabase, insertBookmarkToDatabase, deleteBookmarkFromDatabase } = require('./bookmarkingDataAccess')
const logger = require('../../middleware/logger');

const getBookmarkedActivities = async (userId) => {
    try {
        const activities = await fetchBookmarkedActivitiesFromDatabase(userId);
        if (!activities || activities.length === 0) {
            return [];
        }
        return activities;
    } catch (error) {
        logger.error(`Service error; Error getBookmarkedActivities for userID ${userId}: ${error.message}`);
        throw error;
    }
};

const addBookmark = async (userId, activityId) => {
    try {
        const result = await insertBookmarkToDatabase(userId, activityId);
        return result;
    } catch (error) {
        logger.error(`Service error; Error addBookmark for userID ${userId} and activityID ${activityId}: ${error.message}`);
        throw error;
    }
};

const removeBookmark = async (userId, activityId) => {
    try {
        const result = await deleteBookmarkFromDatabase(userId, activityId);
        return result;
    } catch (error) {
        logger.error(`Service error; Error removeBookmark for userID ${userId} and activityID ${activityId}: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getBookmarkedActivities,
    addBookmark,
    removeBookmark
}