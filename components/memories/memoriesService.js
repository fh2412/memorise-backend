const {
    fetchUsersForMemoryFromDB,
    fetchAddedMemoriesFromDB,
    fetchUserAllMemoriesFromDB,
    fetchSinglePlannedMemoryFromDB,
    fetchUserPlannedMemoriesFromDB,
    fetchMemoryByIdFromDB,
    fetchMemoryFriendsFromDB,
    fetchMemoryDetailFriends,
    fetchMemoriesMapDataFromDB,
    getSharedMemoriesCount,
    createMemoryInDB,
    addUserToMemory,
    updateMemoryInDB,
    updatePictureCountInDB,
    updateLocationInDB,
    updateTitlePicInDB,
    updateMemoryTitleInDB,
    checkMemoryExists,
    deleteFriendsByMemoryId,
    deleteMemoryById,
    deleteFriendFromMemory,
    getOrCreateShareToken,
    fetchMemoryByShareToken,
    checkUserMemoryMembership,
    addUserToMemoryViaToken,
    incrementPictureCountInDB,
    fetchMemoriesSearchDataFromDB,
    createPlaceholderAndAssignToMemory,
    deletePlaceholderFromMemoryDL,
    claimPlaceholderTransactionDL,
    fetchUnclaimedPlaceholdersForMemory,
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

const getAddedMemories = async (userId, ascending, page, pageSize, filter) => {
    try {
        return await fetchAddedMemoriesFromDB(userId, ascending, page, pageSize, filter);
    } catch (error) {
        logger.error(`Service error; Error in getAddedMemories: ${error.message}`);
        throw error;
    }
};

const getUserAllMemories = async (userId, ascending, page, pageSize, filter) => {
    try {
        return await fetchUserAllMemoriesFromDB(userId, ascending, page, pageSize, filter);
    } catch (error) {
        logger.error(`Service error; Error in getUserAllMemories: ${error.message}`);
        throw error;
    }
};

const getUserPlannedMemories = async (userId) => {
    try {
        const flatRows = await fetchUserPlannedMemoriesFromDB(userId);
        
        const memoriesMap = flatRows.reduce((acc, row) => {
            if (!acc[row.memory_id]) {
                acc[row.memory_id] = {
                    memory_id: row.memory_id,
                    title: row.title,
                    memory_date: row.memory_date ? new Date(row.memory_date) : null,
                    memory_end_date: row.memory_end_date ? new Date(row.memory_end_date) : null,
                    crew_members: []
                };
            }

            if (row.crew_user_id) {
                acc[row.memory_id].crew_members.push({
                    user_id: row.crew_user_id,
                    name: row.crew_name,
                    email: row.crew_email,
                    dob: row.crew_dob ? new Date(row.crew_dob) : null,
                    gender: row.crew_gender,
                    profilepic: row.crew_profilepic,
                    profilepic_thumb: row.crew_profilepic_thumb,
                    country: row.crew_country,
                    isCreator: row.is_creator,
                    sharedMemoriesCount: 0 
                });
            }

            return acc;
        }, {});
        return Object.values(memoriesMap);

    } catch (error) {
        logger.error(`Service error; Error in getUserPlannedMemories: ${error.message}`);
        throw error;
    }
};

const getSinglePlannedMemory = async (memoryId) => {
    try {
        const flatRows = await fetchSinglePlannedMemoryFromDB(memoryId);
        
        if (flatRows.length === 0) {
            return null;
        }

        const memoriesMap = flatRows.reduce((acc, row) => {
            if (!acc[row.memory_id]) {
                acc[row.memory_id] = {
                    memory_id: row.memory_id,
                    title: row.title,
                    memory_date: row.memory_date ? new Date(row.memory_date) : null,
                    memory_end_date: row.memory_end_date ? new Date(row.memory_end_date) : null,
                    crew_members: []
                };
            }

            if (row.crew_user_id) {
                acc[row.memory_id].crew_members.push({
                    user_id: row.crew_user_id,
                    name: row.crew_name,
                    email: row.crew_email,
                    dob: row.crew_dob ? new Date(row.crew_dob) : null,
                    gender: row.crew_gender,
                    profilepic: row.crew_profilepic,
                    profilepic_thumb: row.crew_profilepic_thumb,
                    country: row.crew_country,
                    color: row.crew_color,
                    isCreator: Boolean(row.is_creator),
                    isPlaceholder: Boolean(row.is_placeholder), // Extract placeholder status
                    sharedMemoriesCount: 0,
                    status: row.is_placeholder ? 'offline' : 'online' // Give placeholders a default status
                });
            }

            return acc;
        }, {});

        return memoriesMap[memoryId] || null;

    } catch (error) {
        logger.error(`Service error; Error in getSinglePlannedMemory: ${error.message}`);
        throw error;
    }
};

const getMemoriesSearchData = async (userId, includeShared) => {
    try {
        const memories = await fetchMemoriesSearchDataFromDB(userId, includeShared);
        return memories;
    } catch (error) {
        logger.error(`Service error; Error in getMemoriesSearchData: ${error.message}`);
        throw error;
    }
};

const getMemoriesMapData = async (userId, includeShared) => {
    try {
        const memories = await fetchMemoriesMapDataFromDB(userId, includeShared);
        return memories;
    } catch (error) {
        logger.error(`Service error; Error in getMemoriesMapData: ${error.message}`);
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

const addFriendsToMemory = async (friendIds, memoryId) => {
    try {
        for (const id of friendIds) {
            await addUserToMemory(id, memoryId);
        }
    } catch (error) {
        logger.error(`Service error; Error in addFriendsToMemory: ${error.message}`);
        throw error;
    }
};

const incrementMemoryPictureCount = async (memoryId, increment) => {
    try {
        const result = await incrementPictureCountInDB(memoryId, increment);
        
        if (result.affectedRows > 0) {
            // Return the new count
            return result.newCount;
        }
        
        return null; // Memory not found
    } catch (error) {
        logger.error(`Service error; Error in incrementMemoryPictureCount: ${error.message}`);
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

const updateTitlePic = async (memoryId, imageUrl) => {
    try {
        const result = await updateTitlePicInDB(memoryId, imageUrl);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Service error; Error in updateTitlePic: ${error.message}`);
        throw error;
    }
};

const updateMemoryTitle = async (memoryId, newTitle) => {
    try {
        const result = await updateMemoryTitleInDB(memoryId, newTitle);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Service error; Error in updateMemoryTitle: ${error.message}`);
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

const validateShareToken = async (token, userId = null) => {
    try {
        const memory = await fetchMemoryByShareToken(token);

        if (!memory) {
            return { valid: false };
        }

        let alreadyMember = false;
        if (userId) {
            alreadyMember = await checkUserMemoryMembership(memory.memory_id, userId);
        }

        // Determine if this is a past memory or an upcoming trip
        const isPast = memory.memory_date ? new Date(memory.memory_date) < new Date() : false;

        // Fetch unclaimed placeholders for this memory
        const placeholders = await fetchUnclaimedPlaceholdersForMemory(memory.memory_id);

        return {
            valid: true,
            memoryId: memory.memory_id,
            title: memory.title,
            alreadyMember,
            isPast,
            placeholders
        };
    } catch (error) {
        logger.error(`Service error; Error in validateShareToken: ${error.message}`);
        throw error;
    }
};

/**
 * Join a memory via share token
 */
const joinMemoryViaToken = async (token, userId, placeholderId = null) => {
    try {
        const memory = await fetchMemoryByShareToken(token);

        if (!memory) {
            throw new Error('Invalid or expired share link');
        }

        const isPast = memory.memory_date ? new Date(memory.memory_date) < new Date() : false;
        const targetRoute = isPast ? `/memories/${memory.memory_id}` : `/planning/${memory.memory_id}`;

        // Check if user is already creator or member
        const alreadyMember = await checkUserMemoryMembership(memory.memory_id, userId);
        if (alreadyMember) {
            return {
                message: 'You are already a member of this trip',
                alreadyMember: true,
                memoryId: memory.memory_id,
                targetRoute
            };
        }

        // Handle join or claim
        if (placeholderId) {
            await claimPlaceholderTransactionDL(userId, placeholderId, memory.memory_id);
        } else {
            await addUserToMemoryViaToken(userId, memory.memory_id);
        }

        return {
            message: 'Successfully joined memory',
            alreadyMember: false,
            memoryId: memory.memory_id,
            targetRoute
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

const addPlaceholdersToMemory = async (placeholders, memoryId, createdBy) => {
  try {
    const createdPlaceholders = [];
    for (const placeholderData of placeholders) {
      const created = await createPlaceholderAndAssignToMemory(placeholderData, memoryId, createdBy);
      createdPlaceholders.push(created);
    }
    return createdPlaceholders;
  } catch (error) {
    logger.error(`Service error; Error in addPlaceholdersToMemory: ${error.message}`);
    throw error;
  }
};

const removePlaceholderFromMemory = async (placeholderId, memoryId) => {
  try {
    await deletePlaceholderFromMemoryDL(placeholderId, memoryId);
  } catch (error) {
    logger.error(`Service error; Error in removePlaceholderFromMemory: ${error.message}`);
    throw error;
  }
};

module.exports = {
    getUsersForMemory,
    getAddedMemories,
    getUserPlannedMemories,
    getSinglePlannedMemory,
    getUserAllMemories,
    getMemoriesSearchData,
    getMemoryById,
    getMemoriesMapData,
    getMemoryFriends,
    getFriendsWithSharedCount,
    createMemory,
    addFriendsToMemory,
    updateMemory,
    updateMemoryPictureCount,
    updateMemoryLocation,
    updateTitlePic,
    updateMemoryTitle,
    deleteMemoryAndFriends,
    removeFriendFromMemory,
    generateShareLink,
    validateShareToken,
    joinMemoryViaToken,
    checkMembership,
    incrementMemoryPictureCount,
    addPlaceholdersToMemory,
    removePlaceholderFromMemory
}