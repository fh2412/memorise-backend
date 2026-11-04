const express = require('express');
const router = express.Router({ mergeParams: true }); // :memoryId and :itemId come from the mount path
const { body, param, query } = require('express-validator');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { memoryIdParam, itemIdParam, onlyFields, handle } = require('../plan-shared/planHttp');
const { REACTIONS } = require('./planSocialReader');
const service = require('./planCommentsService');

const commentIdParam = param('commentId').isInt({ min: 1 }).toInt();
const bodyRule = body('body').isString().bail().trim().isLength({ min: 1, max: 2000 });
const ids = (req) => ({
  memoryId: Number(req.params.memoryId),
  itemId: Number(req.params.itemId),
  commentId: Number(req.params.commentId),
});

const validateList = [
  memoryIdParam, itemIdParam,
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('before').optional().isInt({ min: 1 }).toInt(),
];
const validateAdd = [memoryIdParam, itemIdParam, onlyFields(['body']), bodyRule];
const validateEdit = [memoryIdParam, itemIdParam, commentIdParam, onlyFields(['body']), bodyRule];
const validateDelete = [memoryIdParam, itemIdParam, commentIdParam];
const validateReaction = [memoryIdParam, itemIdParam, param('reaction').isIn(REACTIONS)];

/**
 * GET comments, newest first
 * @route GET /memories/:memoryId/plan/items/:itemId/comments?limit=50&before=<commentId>
 * @returns 200 { comments, hasMore }
 */
router.get('/comments', authenticateFirebaseToken, validateList, handleValidationErrors,
  handle('GET /plan/items/:itemId/comments', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.json(await service.listComments(req.user.uid, memoryId, itemId, {
      limit: req.query.limit ? Number(req.query.limit) : 50,
      before: req.query.before ? Number(req.query.before) : null,
    }));
  }));

/** @route POST .../comments  @body { body }  @returns 201 { comment } */
router.post('/comments', authenticateFirebaseToken, validateAdd, handleValidationErrors,
  handle('POST /plan/items/:itemId/comments', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.status(201).json({ comment: await service.addComment(req.user.uid, memoryId, itemId, req.body.body) });
  }));

/** @route PATCH .../comments/:commentId  @returns 200 { comment } | 403 COMMENT_EDIT_FORBIDDEN */
router.patch('/comments/:commentId', authenticateFirebaseToken, validateEdit, handleValidationErrors,
  handle('PATCH /plan/items/:itemId/comments/:commentId', async (req, res) => {
    const { memoryId, itemId, commentId } = ids(req);
    res.json({ comment: await service.editComment(req.user.uid, memoryId, itemId, commentId, req.body.body) });
  }));

/** @route DELETE .../comments/:commentId  @returns 204 | 403 COMMENT_DELETE_FORBIDDEN */
router.delete('/comments/:commentId', authenticateFirebaseToken, validateDelete, handleValidationErrors,
  handle('DELETE /plan/items/:itemId/comments/:commentId', async (req, res) => {
    const { memoryId, itemId, commentId } = ids(req);
    await service.deleteComment(req.user.uid, memoryId, itemId, commentId);
    res.status(204).end();
  }));

/** @route PUT .../reactions/:reaction (idempotent)  @returns 200 { reactions } */
router.put('/reactions/:reaction', authenticateFirebaseToken, validateReaction, handleValidationErrors,
  handle('PUT /plan/items/:itemId/reactions/:reaction', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.json({ reactions: await service.setReaction(req.user.uid, memoryId, itemId, req.params.reaction, true) });
  }));

/** @route DELETE .../reactions/:reaction  @returns 200 { reactions } */
router.delete('/reactions/:reaction', authenticateFirebaseToken, validateReaction, handleValidationErrors,
  handle('DELETE /plan/items/:itemId/reactions/:reaction', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.json({ reactions: await service.setReaction(req.user.uid, memoryId, itemId, req.params.reaction, false) });
  }));

module.exports = router;