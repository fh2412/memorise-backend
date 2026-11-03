const express = require('express');
const router = express.Router({ mergeParams: true });
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const v = require('./planPollsValidators');
const service = require('./planPollsService');

const ids = (req) => ({
  memoryId: Number(req.params.memoryId),
  itemId: Number(req.params.itemId),
  optionId: Number(req.params.optionId),
});

/** Same try/catch + log line as the other controllers. */
const handle = (label, fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    logger.error(`Controller error; ${label} ${error.message}`);
    next(error);
  }
};

/**
 * POST create a poll (optionally promoted from an idea)
 * @route POST /memories/:memoryId/plan/polls
 * @returns 201 { item } | 400 POLL_TOO_FEW_OPTIONS, POLL_DUPLICATE_OPTION, POLL_SOURCE_INVALID | 404
 */
router.post('/', authenticateFirebaseToken, v.validateCreatePoll, handleValidationErrors,
  handle('POST /plan/polls', async (req, res) => {
    const item = await service.createPoll(req.user.uid, ids(req).memoryId, req.body);
    res.status(201).json({ item });
  }));

/**
 * PATCH poll settings (deadline, member options, hide results) – owner / poll creator
 * @route PATCH /memories/:memoryId/plan/polls/:itemId
 * @returns 200 { item } | 403 | 409 POLL_DECIDED
 */
router.patch('/:itemId', authenticateFirebaseToken, v.validateUpdatePollSettings, handleValidationErrors,
  handle('PATCH /plan/polls/:itemId', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.json({ item: await service.updatePollSettings(req.user.uid, memoryId, itemId, req.body) });
  }));

/**
 * PUT replace my votes ([] = withdraw)
 * @route PUT /memories/:memoryId/plan/polls/:itemId/votes/me
 * @returns 200 { item } | 400 | 409 POLL_CLOSED, POLL_DECIDED
 */
router.put('/:itemId/votes/me', authenticateFirebaseToken, v.validateVote, handleValidationErrors,
  handle('PUT /plan/polls/:itemId/votes/me', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.json({ item: await service.setMyVotes(req.user.uid, memoryId, itemId, req.body.optionIds) });
  }));

/**
 * POST add an option
 * @route POST /memories/:memoryId/plan/polls/:itemId/options
 * @returns 201 { item } | 403 POLL_OPTIONS_LOCKED | 409
 */
router.post('/:itemId/options', authenticateFirebaseToken, v.validateAddOption, handleValidationErrors,
  handle('POST /plan/polls/:itemId/options', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.status(201).json({ item: await service.addOption(req.user.uid, memoryId, itemId, req.body) });
  }));

/**
 * PATCH edit an option's text / location (votes stay)
 * @route PATCH /memories/:memoryId/plan/polls/:itemId/options/:optionId
 */
router.patch('/:itemId/options/:optionId', authenticateFirebaseToken, v.validateUpdateOption, handleValidationErrors,
  handle('PATCH /plan/polls/:itemId/options/:optionId', async (req, res) => {
    const { memoryId, itemId, optionId } = ids(req);
    res.json({ item: await service.updateOption(req.user.uid, memoryId, itemId, optionId, req.body) });
  }));

/**
 * DELETE remove an option incl. its votes – owner / poll creator
 * @route DELETE /memories/:memoryId/plan/polls/:itemId/options/:optionId
 */
router.delete('/:itemId/options/:optionId', authenticateFirebaseToken, v.validateOptionParams, handleValidationErrors,
  handle('DELETE /plan/polls/:itemId/options/:optionId', async (req, res) => {
    const { memoryId, itemId, optionId } = ids(req);
    res.json({ item: await service.deleteOption(req.user.uid, memoryId, itemId, optionId) });
  }));

/**
 * POST decide the poll – owner / poll creator
 * @route POST /memories/:memoryId/plan/polls/:itemId/decide
 * @body { optionId, location? }
 * @returns 200 { item, needsLocation } | 403 | 409 POLL_ALREADY_DECIDED
 */
router.post('/:itemId/decide', authenticateFirebaseToken, v.validateDecide, handleValidationErrors,
  handle('POST /plan/polls/:itemId/decide', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.json(await service.decidePoll(req.user.uid, memoryId, itemId, req.body));
  }));

/**
 * PUT location of a decided destination poll → writes the memory's location
 * @route PUT /memories/:memoryId/plan/polls/:itemId/destination
 */
router.put('/:itemId/destination', authenticateFirebaseToken, v.validateSetDestination, handleValidationErrors,
  handle('PUT /plan/polls/:itemId/destination', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.json({ item: await service.setDestination(req.user.uid, memoryId, itemId, req.body) });
  }));

/**
 * POST undo the decision – owner / poll creator
 * @route POST /memories/:memoryId/plan/polls/:itemId/reopen
 */
router.post('/:itemId/reopen', authenticateFirebaseToken, v.validatePollParams, handleValidationErrors,
  handle('POST /plan/polls/:itemId/reopen', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.json({ item: await service.reopenPoll(req.user.uid, memoryId, itemId) });
  }));

module.exports = router;