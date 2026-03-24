const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateMemoryId } = require('../../middleware/validation/validateMemory');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getOrCreateInviteLink } = require('./invitationsService');

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
    }
);

module.exports = router;