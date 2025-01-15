const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const logger = require('../../middleware/logger');
const { getFriendsService, getFriendshipStatusService, getMissingMemoryFriendsService, getPendingFriendsService, getIngoingFriendRequestsService, getFriendSuggestionsService, sendFriendRequestService, addFriendService, acceptFriendRequestService } = require('./friendsService');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');
const { validateMemoryId } = require('../../middleware/validation/validateMemory');
const { validateStatsUID } = require('../../middleware/validation/validateMemorystats');
const { validateFriendsUID, validateFriendsStatusUID } = require('../../middleware/validation/validateFriends');
const handleValidationErrors = require('../../middleware/validationMiddleware');


/**
 * GET users friends
 * @route GET /:userId
 * @description gets all the friends of a user by id
 */
router.get('/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const friends = await getFriendsService(userId);
        res.json(friends);
    } catch (error) {
        logger.error(`Controller error; FRIENDS GET /:userId: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET two users friend status
 * @route GET /status/:userId1/:userId2
 * @description returns the status of friends between two users
 */
router.get('/status/:userId1/:userId2', authenticateFirebaseToken, validateFriendsStatusUID, handleValidationErrors, async (req, res) => {
    const { userId1, userId2 } = req.params;

    try {
        const status = await getFriendshipStatusService(userId1, userId2);
        res.json(status);
    } catch (error) {
        logger.error(`Controller error; FRIENDS GET /status/:userId1/:userId2: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET friends missing from a memory
 * @route GET /missingMemory/:memoryId/:userId
 * @description gets all the friends missing in a certain memory to make suggestions for adding friends to memory
 */
router.get('/missingMemory/:memoryId/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, validateMemoryId, async (req, res) => {
    const { userId, memoryId } = req.params;

    try {
        const missingMemoryFriends = await getMissingMemoryFriendsService(userId, memoryId);
        res.json(missingMemoryFriends);
    } catch (error) {
        logger.error(`Controller error; FRIENDS GET /missingMemory/:memoryId/:userId: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET pending friend request per user id
 * @route GET /pending/:userId
 * @description gets all the pending friend request a user has by id
 */
router.get('/pending/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const pendingFriends = await getPendingFriendsService(userId);
        res.json(pendingFriends);
    } catch (error) {
        logger.error(`Controller error; FRIENDS GET /pending/:userId: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET ingoing friend request per user id
 * @route GET /ingoing/:userId
 * @description gets all the ingoing friend request a user has by id
 */
router.get('/ingoing/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const ingoingRequests = await getIngoingFriendRequestsService(userId);
        res.json(ingoingRequests);
    } catch (error) {
        logger.error(`Controller error; FRIENDS GET /ingoing/:userId: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET friend suggestions
 * @route GET /friend-suggestions/:userId
 * @description gets suggestions for new friends by user id
 */
router.get('/friend-suggestions/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const suggestions = await getFriendSuggestionsService(userId);
        res.json(suggestions);
    } catch (error) {
        logger.error(`Controller error; FRIENDS GET /friend-suggestions/:userId: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST sends a friend request
 * @route POST /send_request
 * @description inserts a database entry for a sent request from uid1 to uid2
 */
router.post('/send_request', authenticateFirebaseToken, validateFriendsUID, handleValidationErrors, async (req, res) => {
    const { senderId, receiverId } = req.body;

    try {
        await sendFriendRequestService(senderId, receiverId);
        res.json({ message: 'Friendship request sent successfully' });
    } catch (error) {
        logger.error(`Controller error; FRIENDS POST /send_request: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST adds a friend
 * @route POST /add_friend
 * @description inserts a database entry for an accepted request from uid1 to uid2
 */
router.post('/add_friend', authenticateFirebaseToken, validateFriendsUID, handleValidationErrors, async (req, res) => {
    const { senderId, receiverId } = req.body;

    try {
        await addFriendService(senderId, receiverId);
        res.json({ message: 'Friend added successfully' });
    } catch (error) {
        logger.error(`Controller error; FRIENDS POST /add_friend: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * PUT accepts a friend request
 * @route PUT /accept_request/:userId1/:userId2
 * @description inserts a database entry for an accepted request from uid1 to uid2
 */
router.put('/accept_request/:userId1/:userId2', authenticateFirebaseToken, validateStatsUID, handleValidationErrors, async (req, res) => {
    const { userId1, userId2 } = req.params;

    try {
        await acceptFriendRequestService(userId1, userId2);
        res.json({ message: 'Friendship request accepted successfully' });
    } catch (error) {
        logger.error(`Controller error; FRIENDS POST /accept_request/:userId1/:userId2: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;  