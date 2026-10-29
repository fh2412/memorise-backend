const express = require('express');
const router = express.Router({ mergeParams: true }); // :memoryId comes from the mount path
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const v = require('./planItemsValidators');
const service = require('./planItemsService');

const memoryIdOf = (req) => Number(req.params.memoryId);
const itemIdOf = (req) => Number(req.params.itemId);
const num = (v) => (v === undefined ? null : Number(v));

/**
 * GET all plan items of a memory
 * @route GET /memories/:memoryId/plan/items
 * @returns 200 { items } | 404 MEMORY_NOT_FOUND
 */
router.get('/items', authenticateFirebaseToken, v.validateListItems, handleValidationErrors,
  async (req, res, next) => {
    try {
      const board = await service.listItems(req.user.uid, memoryIdOf(req));
      res.json(board);
    } catch (error) {
      logger.error(`Controller error; GET /plan/items ${error.message}`);
      next(error);
    }
  });

/**
 * POST create a plan item
 * @route POST /memories/:memoryId/plan/items
 * @returns 201 { item } | 400 LINK_URL_REQUIRED, ASSIGNEE_NOT_IN_CREW | 404 MEMORY_NOT_FOUND
 */
router.post('/items', authenticateFirebaseToken, v.validateCreateItem, handleValidationErrors,
  async (req, res, next) => {
    try {
      const item = await service.createItem(req.user.uid, memoryIdOf(req), req.body);
      res.status(201).json({ item });
    } catch (error) {
      logger.error(`Controller error; POST /plan/items ${error.message}`);
      next(error);
    }
  });

/**
 * PATCH partial update (move, edit, toggle status, assignees)
 * @route PATCH /memories/:memoryId/plan/items/:itemId
 * @returns 200 { item } | 400 | 404 ITEM_NOT_FOUND
 */
router.patch('/items/:itemId', authenticateFirebaseToken, v.validatePatchItem, handleValidationErrors,
  async (req, res, next) => {
    try {
      const item = await service.updateItem(req.user.uid, memoryIdOf(req), itemIdOf(req), req.body);
      res.json({ item });
    } catch (error) {
      logger.error(`Controller error; PATCH /plan/items/:itemId ${error.message}`);
      next(error);
    }
  });

/**
 * DELETE a plan item (item creator or plan owner)
 * @route DELETE /memories/:memoryId/plan/items/:itemId
 * @returns 204 | 403 ITEM_DELETE_FORBIDDEN | 404 ITEM_NOT_FOUND
 */
router.delete('/items/:itemId', authenticateFirebaseToken, v.validateDeleteItem, handleValidationErrors,
  async (req, res, next) => {
    try {
      await service.deleteItem(req.user.uid, memoryIdOf(req), itemIdOf(req));
      res.status(204).end();
    } catch (error) {
      logger.error(`Controller error; DELETE /plan/items/:itemId ${error.message}`);
      next(error);
    }
  });

/**
 * GET activity feed, newest first, cursor-paged
 * @route GET /memories/:memoryId/plan/events?limit=30&before=<eventId>
 * @returns 200 { events }
 */
router.get('/events', authenticateFirebaseToken, v.validateListEvents, handleValidationErrors,
  async (req, res, next) => {
    try {
      const events = await service.listEvents(req.user.uid, memoryIdOf(req), {
        limit: num(req.query.limit) ?? 30,
        before: num(req.query.before),
        after: num(req.query.after),
      });
      res.json({ events });
    } catch (error) {
      logger.error(`Controller error; GET /plan/events ${error.message}`);
      next(error);
    }
  });

module.exports = router;