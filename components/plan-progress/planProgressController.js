const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, param } = require('express-validator');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { memoryIdParam, onlyFields, handle } = require('../plan-shared/planHttp');
const service = require('./planProgressService');

const validateSetMilestone = [
  memoryIdParam,
  param('milestone').isIn(['destination', 'stay', 'transport'])
    .withMessage('Dates are completed by locking them in the date finder'),
  onlyFields(['state']),
  body('state').exists().withMessage('state is required').bail()
    .custom((v) => {
      if (v !== null && v !== 'done' && v !== 'skipped') throw new Error("state must be 'done', 'skipped' or null");
      return true;
    }),
];

/**
 * PUT manual milestone state (owner only)
 * @route PUT /memories/:memoryId/plan/milestones/:milestone
 * @body { state: 'done' | 'skipped' | null }
 * @returns 200 { milestones } | 403 MILESTONE_OWNER_ONLY | 404
 */
router.put('/milestones/:milestone', authenticateFirebaseToken, validateSetMilestone, handleValidationErrors,
  handle('PUT /plan/milestones/:milestone', async (req, res) => {
    const milestones = await service.setMilestone(
      req.user.uid, Number(req.params.memoryId), req.params.milestone, req.body.state);
    res.json({ milestones });
  }));

module.exports = router;