const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');
const { validateStatsUID } = require('../../middleware/validation/validateMemorystats');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getUserDisplayStats, getMemoryCountByUser, getMemoryCountByUserForYear, getFriendCountByUser, getSharedMemoriesCount, getVisitedCountries } = require('./memoryStatsService');


/**
 * GET the full statas for display by user
 * @route GET /display/:userId
 * @description Get all the needed status for the stats frontend component
 */
router.get('/display/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
    const userId = req.params.userId;

    try {
        const displayStats = await getUserDisplayStats(userId);
        if (displayStats) {
            res.json(displayStats);
        } else {
            res.json({ stats: null });
        }
    } catch (error) {
        logger.error(`Controller error; MEMORY STATS GET /display/:userId ${error.message}`);
        next(error);
    }
});

/**
 * GET count of memories created by a user
 * @route GET /created/:userId
 * @description Get the count of memories created by a specific user
 */
router.get('/created/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
    const userId = req.params.userId;

    try {
        const memoryCount = await getMemoryCountByUser(userId);
        if (memoryCount) {
            res.json(memoryCount);
        } else {
            res.json({ count: 0 });
        }
    } catch (error) {
        logger.error(`Controller error; MEMORY STATS GET /created/:userId ${error.message}`);
        next(error);
    }
});


/**
 * GET count of memories created by a user in the current year
 * @route GET /createdthisyear/:userId
 * @description Get the count of memories created by a specific user in the current year
 */
router.get('/createdthisyear/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * GET count of friends for a user
 * @route GET /friendcount/:userId
 * @description Get the count of friends for a specific user
 */
router.get('/friendcount/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * GET count of shared memories between two users
 * @route GET /shared-memories/:user1Id/:user2Id
 * @description Get the count of shared memories between two specified users
 */
router.get('/shared-memories/:user1Id/:user2Id', authenticateFirebaseToken, validateStatsUID, handleValidationErrors, async (req, res, next) => {
    const { user1Id, user2Id } = req.params;

    try {
        const sharedMemoriesCount = await getSharedMemoriesCount(user1Id, user2Id);
        res.json({ sharedMemoriesCount });
    } catch (error) {
        logger.error(`Controller error; SHARED MEMORIES GET /shared-memories/:user1Id/:user2Id ${error.message}`);
        next(error);
    }
});

/**
 * GET List of Countries visited by the user
 * @route GET /visitedCounties/:userId
 * @description Get s list of all the countries a user has made memories in
 */
router.get('/visitedCounties/:userId', authenticateFirebaseToken, validateStatsUID, handleValidationErrors, async (req, res, next) => {
    const userId = req.params;

    try {
        const visitedCountryList = await getVisitedCountries(userId);
        res.json({ visitedCountryList });
    } catch (error) {
        logger.error(`Controller error; VISITED COUNTRY GET /shared-memories/:user1Id/:user2Id ${error.message}`);
        next(error);
    }
});

module.exports = router;