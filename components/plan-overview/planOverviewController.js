const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { handle } = require('../plan-shared/planHttp');
const { listMyPlans } = require('./planOverviewService');
const { resolveToday } = require('../plan-shared/phase');


/**
 * GET my active plans (planning, upcoming, live) incl. crew and progress
 * @route GET /plans
 * @returns 200 PlanSummary[]
 */
router.get('/', authenticateFirebaseToken,
  handle('GET /plans', async (req, res) => {
    res.json(await listMyPlans(req.user.uid, resolveToday(req.query.today)));
  }));

module.exports = router;