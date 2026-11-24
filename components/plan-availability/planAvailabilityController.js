const express = require('express');
const router = express.Router({ mergeParams: true });
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const v = require('./planAvailabilityValidators');
const service = require('./planAvailabilityService');

const memoryIdOf = (req) => Number(req.params.memoryId);

/**
 * GET date finder data
 * @route GET /memories/:memoryId/plan/availability
 * @returns 200 { settings | null, members, availability } | 404
 */
router.get('/', authenticateFirebaseToken, v.validateGetAvailability, handleValidationErrors,
  async (req, res, next) => {
    try {
      res.json(await service.getAvailability(req.user.uid, memoryIdOf(req)));
    } catch (error) {
      logger.error(`Controller error; GET /plan/availability ${error.message}`);
      next(error);
    }
  });

/**
 * PUT replace own availability
 * @route PUT /memories/:memoryId/plan/availability/me
 * @body { yes: string[], maybe: string[] }
 * @returns 200 { availability } | 400 | 404
 */
router.put('/me', authenticateFirebaseToken, v.validatePutMyAvailability, handleValidationErrors,
  async (req, res, next) => {
    try {
      const availability = await service.setMyAvailability(req.user.uid, memoryIdOf(req), req.body);
      res.json({ availability });
    } catch (error) {
      logger.error(`Controller error; PUT /plan/availability/me ${error.message}`);
      next(error);
    }
  });

/**
 * PUT date search settings (owner only)
 * @route PUT /memories/:memoryId/plan/availability/settings
 * @body { rangeStart, rangeEnd, minDays, maxDays }
 * @returns 200 { settings } | 400 | 403 DATE_FINDER_OWNER_ONLY | 404
 */
router.put('/settings', authenticateFirebaseToken, v.validatePutSettings, handleValidationErrors,
  async (req, res, next) => {
    try {
      const settings = await service.updateSettings(req.user.uid, memoryIdOf(req), req.body);
      res.json({ settings });
    } catch (error) {
      logger.error(`Controller error; PUT /plan/availability/settings ${error.message}`);
      next(error);
    }
  });

module.exports = router;