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