const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { handle } = require('../plan-shared/planHttp');
const { resolveToday } = require('../plan-shared/phase');
const { listLive } = require('./liveMemoriesService');

/**
 * GET my live memories (max 5) with today's summary for the live cards
 * @route GET /api/live?today=YYYY-MM-DD   (browser date; ±1 day of UTC accepted, else UTC today)
 * @returns 200 LiveMemory[]
 */
router.get('/',
  authenticateFirebaseToken,
  query('today').optional().isString(),
  handleValidationErrors,
  handle('GET /live', async (req, res) => {
    res.json(await listLive(req.user.uid, resolveToday(req.query.today)));
  }));

module.exports = router;
