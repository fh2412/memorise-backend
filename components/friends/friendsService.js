const { getFriendsFromDB, getFriendshipStatusFromDB, getMissingMemoryFriendsFromDB, getPendingFriendsFromDB, getIngoingFriendRequestsFromDB, getFriendSuggestionsFromDB, insertFriendRequest, insertFriend, updateFriendRequestStatus } = require('./friendsDataAccess')
const logger = require('../../middleware/logger');

const getFriendsService = async (userId) => {
    try {
        const friends = await getFriendsFromDB(userId);
        return friends;
    } catch (error) {
        logger.error(`Service error; Error getFriendsService: ${error.message}`);
        throw error;
    }
};

const getFriendshipStatusService = async (userId1, userId2) => {
    try {
        const statusResults = await getFriendshipStatusFromDB(userId1, userId2);

        let result = 'empty';
        if (statusResults.length > 0) {
            for (const row of statusResults) {
                if (row.status === 'accepted') {
                    result = 'accepted';
                    break;
                } else if (row.status === 'pending') {
                    result = row.user_id1 == userId1 ? 'pending' : 'waiting';
                }
            }
        }

        return result;
    } catch (error) {
        logger.error(`Service error; Error getFriendshipStatusService: ${error.message}`);
        throw error;
    }
};

const getMissingMemoryFriendsService = async (userId, memoryId) => {
    try {
        const missingMemoryFriends = await getMissingMemoryFriendsFromDB(userId, memoryId);
        return missingMemoryFriends;
    } catch (error) {
        logger.error(`Service error; Error getMissingMemoryFriendsService: ${error.message}`);
        throw error;
    }
};

const getPendingFriendsService = async (userId) => {
    try {
        const pendingFriends = await getPendingFriendsFromDB(userId);
        return pendingFriends;
    } catch (error) {
        logger.error(`Service error; Error getPendingFriendsService: ${error.message}`);
        throw error;
    }
};

const getIngoingFriendRequestsService = async (userId) => {
    try {
        const ingoingRequests = await getIngoingFriendRequestsFromDB(userId);
        return ingoingRequests;
    } catch (error) {
        logger.error(`Service error; Error getIngoingFriendRequestsService: ${error.message}`);
        throw error;
    }
};

const getFriendSuggestionsService = async (userId) => {
    try {
        const suggestions = await getFriendSuggestionsFromDB(userId);
        return suggestions;
    } catch (error) {
        logger.error(`Service error; Error getFriendSuggestionsService: ${error.message}`);
        throw error;
    }
};

const sendFriendRequestService = async (senderId, receiverId) => {
    try {
        await insertFriendRequest(senderId, receiverId);
    } catch (error) {
        logger.error(`Service error; Error sendFriendRequestService: ${error.message}`);
        throw error;
    }
};

const addFriendService = async (senderId, receiverId) => {
    try {
        await insertFriend(senderId, receiverId);
    } catch (error) {
        logger.error(`Service error; Error addFriendService: ${error.message}`);
        throw error;
    }
};

const acceptFriendRequestService = async (userId1, userId2) => {
    try {
        await updateFriendRequestStatus(userId1, userId2);
    } catch (error) {
        logger.error(`Service error; Error acceptFriendRequestService: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getFriendsService,
    getFriendshipStatusService,
    getMissingMemoryFriendsService,
    getPendingFriendsService,
    getIngoingFriendRequestsService,
    getFriendSuggestionsService,
    sendFriendRequestService,
    addFriendService,
    acceptFriendRequestService,
}