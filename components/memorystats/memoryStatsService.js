const { fetchMemoryCountFromDB, fetchMemoryCountByYearFromDB, fetchFriendCountFromDB, fetchSharedMemoriesCountFromDB } = require('./memoryStatsDataAccess');
const logger = require('../../middleware/logger');

const getMemoryCountByUser = async (userId) => {
    try {
        const count = await fetchMemoryCountFromDB(userId);
        return count;
    } catch (error) {
        logger.error(`Service error; Error in getMemoryCountByUser: ${error.message}`);
        throw error;
    }
};

const getMemoryCountByUserForYear = async (userId, year) => {
    try {
        const count = await fetchMemoryCountByYearFromDB(userId, year);
        return count;
    } catch (error) {
        logger.error(`Service error; Error in getMemoryCountByUserForYear: ${error.message}`);
        throw error;
    }
};

const getFriendCountByUser = async (userId) => {
    try {
        const count = await fetchFriendCountFromDB(userId);
        return count;
    } catch (error) {
        logger.error(`Service error; Error in getFriendCountByUser: ${error.message}`);
        throw error;
    }
};

const getSharedMemoriesCount = async (user1Id, user2Id) => {
    try {
        const count = await fetchSharedMemoriesCountFromDB(user1Id, user2Id);
        return count;
    } catch (error) {
        logger.error(`Service error; Error in getSharedMemoriesCount: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getMemoryCountByUser, getMemoryCountByUserForYear, getFriendCountByUser, getSharedMemoriesCount,
}