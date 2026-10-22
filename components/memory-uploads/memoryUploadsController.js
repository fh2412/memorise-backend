const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const {
  validateCreateUploadSession,
  validateRegisterPhoto,
  validateCompleteUploadSession,
  validateDeletePhotos,
  validateSetCover,
  validateListMemoryPhotos,
} = require('./memoryUploadsValidators');
const {
  createUploadSession,
  registerPhoto,
  completeUploadSession,
  deleteMemoryPhotos,
  setCoverPhoto,
  listMemoryPhotos,
} = require('./memoryUploadsService');

/**
 * GET All photos of a memory
 * @route GET /:memoryId/photos
 * @returns 200 { photos: MemoryPhoto[] } | 403 | 404
 */
router.get('/:memoryId/photos',
  authenticateFirebaseToken,
  validateListMemoryPhotos,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const photos = await listMemoryPhotos(req.params.memoryId, req.user.uid);
      res.json({ photos });
    } catch (error) {
      logger.error(`Controller error; GET /:memoryId/photos ${error.message}`);
      next(error);
    }
  }
);

/**
 * POST Reserve storage for an upload batch
 * @route POST /:memoryId/upload-sessions
 * @returns 201 { uploadSessionId, storageUsedBytes } | 409 STORAGE_FULL
 */
router.post('/:memoryId/upload-sessions',
  authenticateFirebaseToken,
  validateCreateUploadSession,
  handleValidationErrors,
  async (req, res, next) => {
    const { memoryId } = req.params;
    const { expectedFileCount, expectedBytes } = req.body;

    try {
      const result = await createUploadSession(memoryId, req.user.uid, { expectedFileCount, expectedBytes });
      res.status(201).json(result);
    } catch (error) {
      logger.error(`Controller error; POST /:memoryId/upload-sessions ${error.message}`);
      next(error);
    }
  }
);

/**
 * POST Register one uploaded photo (idempotent per clientId)
 * @route POST /:memoryId/photos
 * @returns 200 { photoId, pictureCount }
 */
router.post('/:memoryId/photos',
  authenticateFirebaseToken,
  validateRegisterPhoto,
  handleValidationErrors,
  async (req, res, next) => {
    const { memoryId } = req.params;

    try {
      const result = await registerPhoto(memoryId, req.user.uid, req.body);
      res.json(result);
    } catch (error) {
      logger.error(`Controller error; POST /:memoryId/photos ${error.message}`);
      next(error);
    }
  }
);

/**
 * POST Complete an upload session (releases unused reservation)
 * @route POST /:memoryId/upload-sessions/:sessionId/complete
 * @returns 200 { status, storageUsedBytes, pictureCount }
 */
router.post('/:memoryId/upload-sessions/:sessionId/complete',
  authenticateFirebaseToken,
  validateCompleteUploadSession,
  handleValidationErrors,
  async (req, res, next) => {
    const { memoryId, sessionId } = req.params;
    const { uploadedClientIds, canceledClientIds } = req.body;

    try {
      const result = await completeUploadSession(memoryId, sessionId, req.user.uid, { uploadedClientIds, canceledClientIds });
      res.json(result);
    } catch (error) {
      logger.error(`Controller error; POST /:memoryId/upload-sessions/:sessionId/complete ${error.message}`);
      next(error);
    }
  }
);

/**
 * POST Delete photos of a memory
 * @route POST /:memoryId/photos/delete
 * @returns 200 { deletedPhotoIds, pictureCount, coverPhotoId, storageUsedBytes } | 403 NOT_PHOTO_OWNER
 */
router.post('/:memoryId(\\d+)/photos/delete',
  authenticateFirebaseToken,
  validateDeletePhotos,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      res.json(await deleteMemoryPhotos(req.params.memoryId, req.user.uid, req.body.photoIds));
    } catch (error) {
      logger.error(`Controller error; POST /:memoryId/photos/delete ${error.message}`);
      next(error);
    }
  }
);

/**
 * PUT Set the cover photo
 * @route PUT /:memoryId/cover
 * @returns 200 { coverPhotoId } | 404 PHOTO_NOT_FOUND
 */
router.put('/:memoryId(\\d+)/cover',
  authenticateFirebaseToken,
  validateSetCover,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      res.json(await setCoverPhoto(req.params.memoryId, req.user.uid, req.body.photoId));
    } catch (error) {
      logger.error(`Controller error; PUT /:memoryId/cover ${error.message}`);
      next(error);
    }
  }
);

module.exports = router;
