const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateMemoryId } = require('../../middleware/validation/validateMemory');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getOrCreateInviteLink, getMemoryNameByToken, joinMemoryByInvite } = require('./invitationsService');

router.get('/:memoryId/', authenticateFirebaseToken, validateMemoryId, handleValidationErrors, async (req, res) => {
    try {
        const { memoryId } = req.params;

        if (!memoryId) {
            return res.status(400).json({ message: 'memoryId is required' });
        }

        const inviteLink = await getOrCreateInviteLink(memoryId);

        return res.status(200).json({ inviteLink });

    } catch (error) {
        logger.error('Error in getOrCreateInviteLink:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/info/:token', authenticateFirebaseToken, handleValidationErrors, async (req, res) => {
    try {
        const { token } = req.params;

        const title = await getMemoryNameByToken(token);

        return res.status(200).json({ title });

    } catch (error) {
        logger.error('Error in getMemoryNameByToken:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/join/:token', authenticateFirebaseToken, async (req, res) => {
     try {
        const { token } = req.params;
        const { userId } = req.body;

        if (!token || !userId) {
            return res.status(400).json({
                message: 'Token and userId are required'
            });
        }

        const result = await joinMemoryByInvite(userId, token);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in joinMemory:', error);

        return res.status(400).json({
            message: error.message || 'Could not join memory'
        });
    }
});

module.exports = router;