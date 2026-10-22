const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authenticateFirebaseToken'); // ADJUST path
const { handleValidationErrors } = require('../../middleware/validation'); // ADJUST path
const { validateUpdateMemoryDetails, validateListPlaceholders } = require('./memoryEditValidators');
const { updateMemoryDetails, listPlaceholders } = require('./memoryEditService');

/**
 * PUT Update a memory (details, location, crew) in one transaction
 * @route PUT /:memoryId
 * @returns 200 { memoryId, locationId, placeholders } | 400 | 403 | 404
 */
router.put('/:memoryId(\\d+)',
  authenticateFirebaseToken,
  validateUpdateMemoryDetails,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const result = await updateMemoryDetails(req.params.memoryId, req.user.uid, req.body);
      res.json(result);
    } catch (error) {
      logger.error(`Controller error; PUT /:memoryId ${error.message}`);
      next(error);
    }
  }
);

/**
 * GET Placeholders of a memory
 * @route GET /:memoryId/placeholders
 * @returns 200 { placeholders: { id, name }[] } | 403 | 404
 */
router.get('/:memoryId(\\d+)/placeholders',
  authenticateFirebaseToken,
  validateListPlaceholders,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const placeholders = await listPlaceholders(req.params.memoryId, req.user.uid);
      res.json({ placeholders });
    } catch (error) {
      logger.error(`Controller error; GET /:memoryId/placeholders ${error.message}`);
      next(error);
    }
  }
);

module.exports = router;
