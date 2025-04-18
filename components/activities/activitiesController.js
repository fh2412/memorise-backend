const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const logger = require('../../middleware/logger');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { createActivity, getActivityDetails, getAllActivities, createUserActivity, updateActivityWithFiles, finalizeActivity, getAllUserActivities, getSuggestedActivity, getFilteredActivities } = require('./activitiesService');
const { validateActivityId, validateCreateActivity, validateUpdateActivity, validateUserCreateActivity } = require('../../middleware/validation/validateActivity');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');


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
 * GET all activities of an User
 * @route GET /userActivities/:userId
 * @description returns an array of all activities in the memorise database from a user by ID
 */
router.get('/userActivities/:userId', authenticateFirebaseToken, validateFirebaseUID, async (req, res) => {
    const userId = req.params.userId;

    try {
        const activities = await getAllUserActivities(userId);
        res.json(activities);
    } catch (error) {
        logger.error(`Controller error; ACTIVITY GET /userActivities/:userId: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET activity by id
 * @route GET /:activityId
 * @description returns a activity by the provided activity id
 */
router.get('/details/:activityId', authenticateFirebaseToken, validateActivityId, handleValidationErrors, async (req, res) => {
    const activityId = req.params.activityId;

    try {
        const activity = await getActivityDetails(activityId);
        
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        
        res.json(activity);
    } catch (error) {
        logger.error(`Controller error; ACTIVITY GET /activities/:activityId: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET get suggested activities
 * @route GET /suggestedActivities/:userId
 * @description returns a list of suggested activities for a user
 */
router.get('/suggestedActivities/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;
    try {
        const activity = await getSuggestedActivity(userId);
        if (activity) {
            res.json(activity);
        } else {
            res.status(404).json({ message: 'No suggested Activities found for this User' });
        }
    } catch (error) {
        logger.error(`Controller error; ACTIVITY GET /suggestedActivities/:userId ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET filtered activities
 * @route GET /activities/filtered
 * @description Returns activities filtered by multiple criteria including location, distance, tags, group size, price, season, weather, and name
 */
router.get('/filtered', authenticateFirebaseToken, async (req, res) => {
    try {
        // Extract filter parameters from query params
        const filter = {
            location: req.query.location || "",
            distance: parseInt(req.query.distance) || 25,
            tag: req.query.tag || "",
            groupSizeMin: parseInt(req.query.groupSizeMin) || 1,
            groupSizeMax: parseInt(req.query.groupSizeMax) || 16,
            price: parseInt(req.query.price) || 0,
            season: req.query.season || "",
            weather: req.query.weather || "",
            name: req.query.name || ""
        };

        const activities = await getFilteredActivities(filter);
        res.json(activities);
    } catch (error) {
        logger.error(`Controller error; ACTIVITY GET /filtered: ${error.message}`);
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
    const { title, description, groupSizeMin, groupSizeMax, indoor, costs, location, websiteUrl, seasons, weathers, leadMemoryId } = req.body;
    try {
        const creatorId = req.user.uid;
        const activityData = {
            title, description, creatorId, groupSizeMin, groupSizeMax, isIndoorFlag: indoor,
            costs, location, websiteUrl, seasons, weathers, leadMemoryId
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
    const { titlePictureUrl } = req.body;

    try {
        // Verify user owns this activity (could be middleware)
        await updateActivityWithFiles(id, titlePictureUrl);
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