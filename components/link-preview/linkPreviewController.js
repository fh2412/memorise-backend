const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const linkPreviewLimiter = require('../../middleware/linkPreviewLimiter');
const { memoryIdParam, onlyFields, handle } = require('../plan-shared/planHttp');
const { getPreview } = require('./linkPreviewService');

const validatePreview = [
  memoryIdParam,
  onlyFields(['url', 'refresh']),
  body('url').isString().bail().trim().isLength({ min: 1, max: 2048 }),
  body('refresh').optional().isBoolean().toBoolean(),
];

/**
 * POST fetch (or read cached) link preview – crew members only
 * @route POST /api/memories/:memoryId/plan/link-preview
 * @body { url, refresh? }
 * @returns 200 { preview | null, error | null, cached }
 *          400 LINK_PREVIEW_INVALID_URL | LINK_PREVIEW_BLOCKED | 404 | 429
 */
router.post('/link-preview',
  authenticateFirebaseToken,
  linkPreviewLimiter,          // after auth → counts per user, not per IP
  validatePreview,
  handleValidationErrors,
  handle('POST /plan/link-preview', async (req, res) => {
    res.json(await getPreview(req.user.uid, Number(req.params.memoryId), req.body.url, {
      refresh: req.body.refresh === true,
    }));
  }));

module.exports = router;
