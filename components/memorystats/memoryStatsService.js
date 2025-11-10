const { fetchMemoryCountFromDB, fetchMemoryCountByYearFromDB, fetchAddedMemoryCountFromDB, fetchFriendCountFromDB, fetchSharedMemoriesCountFromDB } = require('./memoryStatsDataAccess');
const logger = require('../../middleware/logger');

const getUserDisplayStats = async (userId) => {
    try {
        const [memoryCount, yearCount, allCount, friendCount] = await Promise.all([
            fetchMemoryCountFromDB(userId),
            fetchMemoryCountByYearFromDB(userId),
            fetchAddedMemoryCountFromDB(userId),
            fetchFriendCountFromDB(userId)
        ]);

        const stats = {
            memoryCount: memoryCount.count,
            yearCount: yearCount.count,
            allCount: allCount, // already a number
            friendCount: friendCount.count
        };

        
        return stats;
    } catch (error) {
        logger.error(`Service error; Error in getUserDisplayStats: ${error.message}`);
        throw error;
    }
}

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
    getUserDisplayStats,getMemoryCountByUser, getMemoryCountByUserForYear, getFriendCountByUser, getSharedMemoriesCount,
}