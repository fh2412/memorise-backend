const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const logger = require('../../middleware/logger');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { updateUserStorageTakenService } = require('./billingService');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');


router.put('/freetier/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
    const { userId } = req.params;
    const { data_size } = req.body;

    logger.info(data_size);

    try {
        await updateUserStorageTakenService(userId, data_size);
        res.json({ message: 'Updated Storage Count of user successfully' });
    } catch (error) {
        logger.error(`Controller error; BILLINMG PUT /freetier/:userId: ${error.message}`);
        next(error);
    }
});

module.exports = router;