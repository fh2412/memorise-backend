const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');
const { validateStatsUID } = require('../../middleware/validation/validateMemorystats');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getMemoryCountByUser, getMemoryCountByUserForYear, getFriendCountByUser, getSharedMemoriesCount } = require('./memoryStatsService');

/**
 * GET count of memories created by a user
 * @route GET /created/:userId
 * @description Get the count of memories created by a specific user
 */
router.get('/created/:userId', validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const memoryCount = await getMemoryCountByUser(userId);
        if (memoryCount) {
            res.json(memoryCount);
        } else {
            res.json({ message: 'No Memories created yet' });
        }
    } catch (error) {
        logger.error(`Controller error; MEMORY STATS GET /created/:userId ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


/**
 * GET count of memories created by a user in the current year
 * @route GET /createdthisyear/:userId
 * @description Get the count of memories created by a specific user in the current year
 */
router.get('/createdthisyear/:userId', validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const currentYear = new Date().getFullYear();
        const memoryCount = await getMemoryCountByUserForYear(userId, currentYear);
        if (memoryCount) {
            res.json(memoryCount);
        } else {
            res.json({ message: 'No Memories created yet' });
        }
    } catch (error) {
        logger.error(`Controller error; MEMORY STATS GET /createdthisyear/:userId ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET count of friends for a user
 * @route GET /friendcount/:userId
 * @description Get the count of friends for a specific user
 */
router.get('/friendcount/:userId', validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const friendCount = await getFriendCountByUser(userId);
        if (friendCount) {
            res.json(friendCount);
        } else {
            res.json({ message: 'No friends found' });
        }
    } catch (error) {
        logger.error(`Controller error; FRIEND COUNT GET /friendcount/:userId ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET count of shared memories between two users
 * @route GET /shared-memories/:user1Id/:user2Id
 * @description Get the count of shared memories between two specified users
 */
router.get('/shared-memories/:user1Id/:user2Id', validateStatsUID, handleValidationErrors, async (req, res) => {
    const { user1Id, user2Id } = req.params;

    try {
        const sharedMemoriesCount = await getSharedMemoriesCount(user1Id, user2Id);
        res.json({ sharedMemoriesCount });
    } catch (error) {
        logger.error(`Controller error; SHARED MEMORIES GET /shared-memories/:user1Id/:user2Id ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

module.exports = router;