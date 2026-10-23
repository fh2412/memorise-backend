const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authenticateFirebaseToken');
const { handleValidationErrors } = require('../../middleware/validation');
const { createDownloadTicket, streamDownload } = require('./memoryDownloadService');

const MAX_PHOTOS = 2000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const memoryIdParam = param('memoryId').isInt({ min: 1 }).toInt();

/** "a,b,c" (form field) → ['a','b','c'] | null (= all photos) */
const parseIdList = (value) => (value ? String(value).split(',').filter(Boolean) : null);

/**
 * POST Ticket for a download (app → with Bearer token)
 * @route POST /:memoryId/download-ticket   { photoIds?: uuid[] }  (missing/empty = all photos)
 * @returns 200 { ticket, fileCount, totalBytes, expiresInSeconds } | 403 | 404 NO_PHOTOS
 */
router.post('/:memoryId(\\d+)/download-ticket',
  authenticateFirebaseToken,
  memoryIdParam,
  body('photoIds').optional().isArray({ max: MAX_PHOTOS }),
  body('photoIds.*').matches(UUID),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      res.json(await createDownloadTicket(req.params.memoryId, req.user.uid, req.body.photoIds));
    } catch (error) {
      logger.error(`Controller error; POST /:memoryId/download-ticket ${error.message}`);
      next(error);
    }
  }
);

/**
 * POST Stream the ZIP (browser form submit → with ticket, no Bearer header)
 * @route POST /:memoryId/download   form fields: ticket, photoIds? ("id1,id2,…")
 */
router.post('/:memoryId(\\d+)/download',
  express.urlencoded({ extended: false, limit: '120kb', parameterLimit: 5 }),
  memoryIdParam,
  body('ticket').isString().isLength({ min: 10, max: 1000 }),
  body('photoIds').optional().isString().isLength({ max: MAX_PHOTOS * 37 })
    .custom(value => parseIdList(value).every(id => UUID.test(id))),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      await streamDownload({
        memoryId: req.params.memoryId,
        ticket: req.body.ticket,
        photoIds: parseIdList(req.body.photoIds),
        res,
      });
    } catch (error) {
      logger.error(`Controller error; POST /:memoryId/download ${error.message}`);
      if (res.headersSent) {
        res.destroy(); // ZIP already started → browser shows "failed" instead of a corrupt file
        return;
      }
      next(error);
    }
  }
);

module.exports = router;
