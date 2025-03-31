const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const logger = require('../../middleware/logger');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { createActivity, getActivityById, getAllActivities, createUserActivity, updateActivityWithFiles,finalizeActivity } = require('./activitiesService');
const { validateActivityId, validateCreateActivity, validateUpdateActivity, validateUserCreateActivity } = require('../../middleware/validation/validateActivity');

/**
 * GET all activities
 * @route GET /
 * @description returns an array of all activities in the memorise database
 */
router.get('/', authenticateFirebaseToken, async (req, res) => {
    try {
        const activities = await getAllActivities();
        res.json(activities);
    } catch (error) {
        logger.error(`Controller error; ACTIVITY GET /: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET activity by id
 * @route GET /:activityId
 * @description returns a activity by the provided activity id
 */
router.get('/:activityId', authenticateFirebaseToken, validateActivityId, handleValidationErrors, async (req, res) => {
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
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * POST new activity
 * @route POST /add-activity
 * @description creates a new activity
 */
router.post('/add-activity', authenticateFirebaseToken, validateCreateActivity, handleValidationErrors, async (req, res) => {
    const { title } = req.body;
    try {
        const activityId = await createActivity(title);
        res.json({ message: 'Activity created successfully', activityId: activityId });
    } catch (error) {
        logger.error(`Controller error; ACTIVITY POST /add-activity: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST new activity
 * @route POST /add-user-ctivity
 * @description Creates a new activity with all details
 */
router.post('/add-user-activity', authenticateFirebaseToken, validateUserCreateActivity, handleValidationErrors, async (req, res) => {
    const { title, description, groupSizeMin, groupSizeMax, indoor, commercialFlag, prize, location, websiteUrl, seasons, weathers } = req.body;
    try {
        const creatorId = req.user.uid;
        const activityData = {
            title, description, creatorId, groupSizeMin, groupSizeMax, indoorOutdoorFlag: indoor,
            commercialFlag, prize, location, websiteUrl, seasons, weathers
        };
        const result = await createUserActivity(activityData);
        res.json({
            message: 'Activity created successfully',
            activityId: result.activityId
        });
    } catch (error) {
        logger.error(`Controller error; ACTIVITY POST /add-activity: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * PUT update activity with files
 * @route PUT /update-activity/:id
 * @description Updates an activity with file URLs
 */
router.put('/update-activity/:id', authenticateFirebaseToken, validateUpdateActivity, handleValidationErrors, async (req, res) => {
    const { id } = req.params;
    const { titlePictureUrl, supportingDocUrls } = req.body;

    try {
        // Verify user owns this activity (could be middleware)
        await updateActivityWithFiles(id, titlePictureUrl, supportingDocUrls);
        res.json({ message: 'Activity updated with files successfully' });
    } catch (error) {
        logger.error(`Controller error; ACTIVITY PUT /update-activity/${id}: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST finalize activity
 * @route POST /finalize-activity/:id
 * @description Finalizes activity creation (optional cleanup steps)
 */
router.post('/finalize-activity/:id', authenticateFirebaseToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Verify user owns this activity (could be middleware)
        await finalizeActivity(id);
        res.json({ message: 'Activity finalized successfully' });
    } catch (error) {
        logger.error(`Controller error; ACTIVITY POST /finalize-activity/${id}: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;