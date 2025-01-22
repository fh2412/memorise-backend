const {
    fetchUsersForMemoryFromDB,
    fetchCreatedMemoriesFromDB,
    fetchAddedMemoriesFromDB,
    fetchAllMemoriesFromDB,
    fetchMemoryByIdFromDB,
    fetchMemoryFriendsFromDB,
    fetchMemoryFriends,
    getSharedMemoriesCount,
    createMemoryInDB,
    getUserIdByEmail,
    addUserToMemory,
    updateMemoryInDB,
    updatePictureCountInDB,
    updateLocationInDB,
    updateTitlePicInDB,
    checkMemoryExists,
    deleteFriendsByMemoryId,
    deleteMemoryById,
    deleteFriendFromMemory
} = require('./memoriesDataAccess');
const logger = require('../../middleware/logger');

const getUsersForMemory = async (memoryId) => {
    try {
        const users = await fetchUsersForMemoryFromDB(memoryId);
        return users;
    } catch (error) {
        logger.error(`Service error; Error in getUsersForMemory: ${error.message}`);
        throw error;
    }
};

const getCreatedMemories = async (userId) => {
    try {
        const memories = await fetchCreatedMemoriesFromDB(userId);
        return memories;
    } catch (error) {
        logger.error(`Service error; Error in getCreatedMemories: ${error.message}`);
        throw error;
    }
};

const getAddedMemories = async (userId) => {
    try {
        const memories = await fetchAddedMemoriesFromDB(userId);
        return memories;
    } catch (error) {
        logger.error(`Service error; Error in getAddedMemories: ${error.message}`);
        throw error;
    }
};

const getAllMemories = async (userId) => {
    try {
        const memories = await fetchAllMemoriesFromDB(userId);
        return memories;
    } catch (error) {
        logger.error(`Service error; Error in getAllMemories: ${error.message}`);
        throw error;
    }
};

const getMemoryById = async (memoryId) => {
    try {
        const memory = await fetchMemoryByIdFromDB(memoryId);
        return memory;
    } catch (error) {
        logger.error(`Service error; Error in getMemoryById: ${error.message}`);
        throw error;
    }
};

const getMemoryFriends = async (memoryId, userId) => {
    try {
        const friends = await fetchMemoryFriendsFromDB(memoryId, userId);
        return friends;
    } catch (error) {
        logger.error(`Service error; Error in getMemoryFriends: ${error.message}`);
        throw error;
    }
};

const getFriendsWithSharedCount = async (memoryId, userId) => {
    try {
        // Step 1: Get the list of friends
        const friends = await fetchMemoryFriends(memoryId);

        // Step 2: Get shared memories count for each friend
        const friendsWithSharedCount = await Promise.all(friends.map(friend =>
            getSharedMemoriesCount(userId, friend.user_id).then(sharedCount => ({
                ...friend,
                sharedMemoriesCount: sharedCount
            }))
        ));

        return friendsWithSharedCount;
    } catch (error) {
        logger.error(`Service error; Error in getFriendsWithSharedCount: ${error.message}`);
        throw error;
    }
};

const createMemory = async (memoryData) => {
    try {
        const memoryId = await createMemoryInDB(memoryData);
        return memoryId;
    } catch (error) {
        logger.error(`Service error; Error in createMemory: ${error.message}`);
        throw error;
    }
};

const addFriendsToMemory = async (emails, memoryId) => {
    try {
        for (const email of emails) {
            const userId = await getUserIdByEmail(email);
            if (userId) {
                await addUserToMemory(userId, memoryId);
            } else {
                logger.warn(`Service warning; User not found for email: ${email}`);
            }
        }
    } catch (error) {
        logger.error(`Service error; Error in addFriendsToMemory: ${error.message}`);
        throw error;
    }
};

const updateMemory = async (memoryId, updateData) => {
    try {
        const result = await updateMemoryInDB(memoryId, updateData);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Service error; Error in updateMemory: ${error.message}`);
        throw error;
    }
};

const updateMemoryPictureCount = async (memoryId, pictureCount) => {
    try {
        const result = await updatePictureCountInDB(memoryId, pictureCount);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Service error; Error in updateMemoryPictureCount: ${error.message}`);
        throw error;
    }
};

const updateMemoryLocation = async (memoryId, locationId) => {
    try {
        const result = await updateLocationInDB(memoryId, locationId);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Service error; Error in updateMemoryLocation: ${error.message}`);
        throw error;
    }
};

const updateTitlePic = async (imageId, imageUrl) => {
    try {
        const result = await updateTitlePicInDB(imageId, imageUrl);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Service error; Error in updateTitlePic: ${error.message}`);
        throw error;
    }
};

const deleteMemoryAndFriends = async (memoryId) => {
    try {
        // Check if the memory exists
        const memoryExists = await checkMemoryExists(memoryId);

        if (!memoryExists) {
            return false;
        }

        // Delete associated friends and the memory
        await deleteFriendsByMemoryId(memoryId);
        await deleteMemoryById(memoryId);
        return true;
    } catch (error) {
        logger.error(`Service error; Error in deleteMemoryAndFriends: ${error.message}`);
        throw error;
    }
};

const removeFriendFromMemory = async (userId, memoryId) => {
    try {
        await deleteFriendFromMemory(userId, memoryId);
    } catch (error) {
        logger.error(`Service error; Error in removeFriendFromMemory: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getUsersForMemory,
    getCreatedMemories,
    getAddedMemories,
    getAllMemories,
    getMemoryById,
    getMemoryFriends,
    getFriendsWithSharedCount,
    createMemory,
    addFriendsToMemory,
    updateMemory,
    updateMemoryPictureCount,
    updateMemoryLocation,
    updateTitlePic,
    deleteMemoryAndFriends,
    removeFriendFromMemory,
}