const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const logger = require('../../middleware/logger');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { createActivity, getActivityById, getAllActivities } = require('./activitiesService');
const { validateActivityId, validateCreateActivity } = require('../../middleware/validation/validateActivity');

/**
 * GET all activities
 * @route GET /
 * @description returns an array of all activities in the memorise database
 */
router.get('/', authenticateFirebaseToken, async (req, res, next) => {
    try {
        const activities = await getAllActivities();
        res.json(activities);
    } catch (error) {
        logger.error(`Controller error; ACTIVITY GET /: ${error.message}`);
        next(error);
    }
});

/**
 * GET activity by id
 * @route GET /:activityId
 * @description returns a activity by the provided activity id
 */
router.get('/:activityId', authenticateFirebaseToken, validateActivityId, handleValidationErrors, async (req, res, next) => {
    const activityId = req.params.activityId;
    try {
        const activity = await getActivityById(activityId);
        if (activity) {
            res.json(activity);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        logger.error(`Controller error; ACTIVITY GET /:activityId: ${error.message}`);
        next(error);
    }
});

/**
 * POST new activity
 * @route POST /add-activity
 * @description creates a new activity
 */
router.post('/add-activity', authenticateFirebaseToken, validateCreateActivity, handleValidationErrors, async (req, res, next) => {
    const { title } = req.body;
    try {
        const activityId = await createActivity(title);
        res.json({ message: 'Activity created successfully', activityId: activityId });
    } catch (error) {
        logger.error(`Controller error; ACTIVITY POST /add-activity: ${error.message}`);
        next(error);
    }
});

module.exports = router;