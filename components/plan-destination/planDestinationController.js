const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { memoryIdParam, onlyFields, handle } = require('../plan-shared/planHttp');
const { assertLocation } = require('../plan-polls/planPollsValidators');
const service = require('./planDestinationService');

const validateSet = [
  memoryIdParam,
  onlyFields(['label', 'location']),
  body('label').isString().bail().trim().isLength({ min: 1, max: 200 }),
  // omitted = keep coordinates; null = name only; object = new pin
  body('location').optional().custom(assertLocation),
];

/**
 * PUT set / change the destination (owner)
 * @route PUT /api/memories/:memoryId/plan/destination
 * @body { label, location?: PlanLocation | null }
 * @returns 200 { destination } | 400 | 403 DESTINATION_OWNER_ONLY | 404
 */
router.put('/', authenticateFirebaseToken, validateSet, handleValidationErrors,
  handle('PUT /plan/destination', async (req, res) => {
    const input = { label: req.body.label };
    if ('location' in req.body) input.location = req.body.location; // keep "omitted" distinct from null
    res.json(await service.setDestination(req.user.uid, Number(req.params.memoryId), input));
  }));

/**
 * DELETE remove the destination (owner) → Destination milestone is open again
 * @returns 200 { destination: null }
 */
router.delete('/', authenticateFirebaseToken, memoryIdParam, handleValidationErrors,
  handle('DELETE /plan/destination', async (req, res) => {
    res.json(await service.removeDestination(req.user.uid, Number(req.params.memoryId)));
  }));

module.exports = router;
