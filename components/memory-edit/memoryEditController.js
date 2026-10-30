const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { validateUpdateMemoryDetails, validateListPlaceholders } = require('./memoryEditValidators');
const { updateMemoryDetails, listPlaceholders, updateMemoryDates  } = require('./memoryEditService');

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

/**
 * PATCH Set or clear only the dates of a memory (owner only)
 * @route PATCH /:memoryId/dates
 * @body { startDate: 'YYYY-MM-DD' | null, endDate?: 'YYYY-MM-DD' | null }
 * @returns 200 { memoryId, startDate, endDate, changed } | 400 | 403 DATES_OWNER_ONLY | 404
 */
router.patch('/:memoryId(\\d+)/dates',
  authenticateFirebaseToken,
  validateUpdateMemoryDates,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const result = await updateMemoryDates(req.user.uid, Number(req.params.memoryId), req.body);
      res.json(result);
    } catch (error) {
      logger.error(`Controller error; PATCH /:memoryId/dates ${error.message}`);
      next(error);
    }
  }
);

module.exports = router;
