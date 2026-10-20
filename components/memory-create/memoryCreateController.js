const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authenticateFirebaseToken'); // ADJUST path
const { handleValidationErrors } = require('../../middleware/validation'); // ADJUST path
const { validateCreateMemory } = require('./memoryCreateValidators');
const { createMemoryWithDetails } = require('./memoryCreateService');

/**
 * POST Create a memory (finished or planned) in one transaction
 * @route POST /
 * @description Creates memory + location + crew (friends & placeholders) + optional upload session.
 *              Idempotent per requestId: a retry returns the existing memory (200, created=false).
 * @returns 201 | 200 { created, memoryId, locationId, activityId, placeholders, uploadSessionId, storageUsedBytes }
 *          409 STORAGE_FULL | 400 CREW_USER_NOT_FOUND
 */
router.post('/',
  authenticateFirebaseToken,
  validateCreateMemory,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const result = await createMemoryWithDetails(req.user.uid, req.body);
      res.status(result.created ? 201 : 200).json(result);
    } catch (error) {
      logger.error(`Controller error; POST /memories ${error.message}`);
      next(error);
    }
  }
);

module.exports = router;
