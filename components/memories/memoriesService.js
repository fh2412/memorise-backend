const {
    fetchUsersForMemoryFromDB,
    fetchCreatedMemoriesFromDB,
    fetchAddedMemoriesFromDB,
    fetchAllMemoriesFromDB,
    fetchMemoryByIdFromDB,
    fetchMemoryFriendsFromDB,
    fetchMemoryDetailFriends,
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
    deleteFriendFromMemory,
    getOrCreateShareToken,
    fetchMemoryByShareToken,
    checkUserMemoryMembership,
    addUserToMemoryViaToken,
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
        const friends = await fetchMemoryDetailFriends(memoryId, userId);

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

/**
 * Generate or retrieve share link for a memory
 */
const generateShareLink = async (memoryId, userId) => {
    try {
        // First verify the memory exists and user has permission
        const memory = await fetchMemoryByIdFromDB(memoryId);

        if (!memory) {
            throw new Error('Memory not found');
        }

        // Check if user is creator or member (has permission to share)
        const isMember = await checkUserMemoryMembership(memoryId, userId);

        if (!isMember) {
            throw new Error('User does not have permission to share this memory');
        }

        // Get or create share token
        const shareToken = await getOrCreateShareToken(memoryId);

        // Construct the share link (frontend URL will be passed from controller/env)
        return {
            shareToken,
            memoryId
        };
    } catch (error) {
        logger.error(`Service error; Error in generateShareLink: ${error.message}`);
        throw error;
    }
};

/**
 * Validate share token and return memory details
 */
const validateShareToken = async (token, userId = null) => {
    try {
        // Find memory by token
        const memory = await fetchMemoryByShareToken(token);

        if (!memory) {
            return { valid: false };
        }

        // If userId is provided, check if already a member
        let alreadyMember = false;
        if (userId) {
            alreadyMember = await checkUserMemoryMembership(memory.memory_id, userId);
        }

        return {
            valid: true,
            memory,
            alreadyMember
        };
    } catch (error) {
        logger.error(`Service error; Error in validateShareToken: ${error.message}`);
        throw error;
    }
};

/**
 * Join a memory via share token
 */
const joinMemoryViaToken = async (token, userId) => {
    try {
        // First validate the token and get memory
        const memory = await fetchMemoryByShareToken(token);

        if (!memory) {
            throw new Error('Invalid or expired share link');
        }

        // Check if user is the creator
        if (memory.user_id === userId) {
            return {
                message: 'You are the creator of this memory',
                alreadyMember: true,
                memory
            };
        }

        // Add user to memory
        const result = await addUserToMemoryViaToken(userId, memory.memory_id);

        if (result.alreadyMember) {
            return {
                message: 'You are already a member of this memory',
                alreadyMember: true,
                memory
            };
        }

        return {
            message: 'Successfully joined memory',
            alreadyMember: false,
            memory
        };
    } catch (error) {
        logger.error(`Service error; Error in joinMemoryViaToken: ${error.message}`);
        throw error;
    }
};

/**
 * Check if user is a member of a memory
 */
const checkMembership = async (memoryId, userId) => {
    try {
        const isMember = await checkUserMemoryMembership(memoryId, userId);
        return { isMember };
    } catch (error) {
        logger.error(`Service error; Error in checkMembership: ${error.message}`);
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
    generateShareLink,
    validateShareToken,
    joinMemoryViaToken,
    checkMembership,
}