const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const logger = require('../../middleware/logger');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getBookmarkedActivities, addBookmark, removeBookmark } = require('./bookmarkingService');
//const {  } = require('../../middleware/validation/validateBookmarking');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');

router.get('/bookmarks/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;
    try {
        const bookmarkedActivities = await getBookmarkedActivities(userId);
        res.json(bookmarkedActivities);
    } catch (error) {
        logger.error(`Controller error; ACTIVITY GET /bookmarks: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

router.post('/bookmarks', authenticateFirebaseToken, async (req, res) => {
    const { userId, activityId } = req.body;
    try {
        if (!userId || !activityId) {
            return res.status(400).json({ message: 'Both userId and activityId are required' });
        }

        await addBookmark(userId, activityId);
        res.status(201).json({ message: 'Activity bookmarked successfully' });
    } catch (error) {
        logger.error(`Controller error; ACTIVITY POST /bookmarks: ${error.message}`);

        // Handle duplicate entry error specifically
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'This activity is already bookmarked' });
        }

        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

router.delete('/bookmarks/:userId/:activityId', authenticateFirebaseToken, async (req, res) => {
    const userId = req.params.userId;
    const activityId = req.params.activityId;
    try {
        const result = await removeBookmark(userId, activityId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        res.status(200).json({ message: 'Bookmark removed successfully' });
    } catch (error) {
        logger.error(`Controller error; ACTIVITY DELETE /bookmarks: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});