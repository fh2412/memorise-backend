const { getFavouriteUserMemoryFromDB, getFavouriteMemoryFromDB, updateFavouriteMemoryInDB, insterFavouriteMemory, deleteFavouriteMemoryFromDB, deleteFavouriteMemoryAllFromDB } = require('./pinnedMemoriesDataAccess');
const logger = require('../../middleware/logger');

const getFavouriteMemories = async (userId) => {
    try {
        const memories = await getFavouriteUserMemoryFromDB(userId);
        return memories;
    } catch (error) {
        logger.error(`Service error; Error getFavouriteMemories: ${error.message}`);
        throw error;
    }
}

const getFavouriteMemory = async (memoryId) => {
    try {
        return await getFavouriteMemoryFromDB(memoryId);
    } catch (error) {
        logger.error(`Service error; Error getFavouriteMemory: ${error.message}`);
        throw error;
    }
};

const updateFavouriteMemory = async (userId, memoryIdToUpdate, updatedMemoryId) => {
    try {
        const updateResult = await updateFavouriteMemoryInDB(userId, memoryIdToUpdate, updatedMemoryId);

        if (updateResult.affectedRows === 0) {
            throw new Error('Favorite memory not found');
        }

        return { message: 'Favorite memory updated successfully' };
    } catch (error) {
        logger.error(`Service error; Error updateFavouriteMemory: ${error.message}`);
        throw error;
    }
}

const createFavouriteMemory = async (userId, memoryId) => {
    try {
        return await insterFavouriteMemory(userId, memoryId);
    } catch (error) {
        logger.error(`Service error; Error createFavouriteMemory: ${error.message}`);
        throw error;
    }
};

const deleteFavouriteMemory = async (userId, memoryIdToDelete) => {
    try {
        const deleteResult = await deleteFavouriteMemoryFromDB(userId, memoryIdToDelete);

        if (deleteResult.affectedRows === 0) {
            throw new Error('Favorite memory not found');
        }

        return { message: 'Favorite memory deleted successfully' };
    } catch (error) {
        logger.error(`Service error; Error deleteFavouriteMemory: ${error.message}`);
        throw error;
    }
};

const deleteFavouriteMemoryAll = async (memoryId) => {
    try {
        return await deleteFavouriteMemoryAllFromDB(memoryId);
    } catch (error) {
        logger.error(`Service error; Error deleteFavouriteMemoryAll: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getFavouriteMemories,
    getFavouriteMemory,
    updateFavouriteMemory,
    createFavouriteMemory,
    deleteFavouriteMemory,
    deleteFavouriteMemoryAll,
}

