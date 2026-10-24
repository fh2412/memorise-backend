const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { getMapMemories } = require('./memoryMapService');

/**
 * GET Finished memories with a location for the home map
 * @route GET /map
 * @description The user comes from the token (the old /mapData/:userId accepted any user id).
 * @returns 200 { memories: MapMemory[] }
 */
router.get('/map', authenticateFirebaseToken, async (req, res, next) => {
  try {
    const memories = await getMapMemories(req.user.uid);
    res.json({ memories });
  } catch (error) {
    logger.error(`Controller error; GET /map ${error.message}`);
    next(error);
  }
});

module.exports = router;
