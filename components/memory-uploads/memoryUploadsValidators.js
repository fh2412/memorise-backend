const { body, param } = require('express-validator');

const MAX_FILES_PER_SESSION = 1000;
const MAX_FILE_BYTES = 200 * 1024 * 1024; // keep in sync with the frontend picker

const memoryIdParam = param('memoryId').isInt({ min: 1 }).withMessage('Invalid memoryId').toInt();

const validateCreateUploadSession = [
  memoryIdParam,
  body('expectedFileCount').isInt({ min: 1, max: MAX_FILES_PER_SESSION }).toInt(),
  body('expectedBytes').isInt({ min: 1, max: MAX_FILES_PER_SESSION * MAX_FILE_BYTES }).toInt(),
];

const validateRegisterPhoto = [
  memoryIdParam,
  body('clientId').isUUID(4),
  body('uploadSessionId').isUUID(4),
  body('storagePath').isString().isLength({ min: 1, max: 512 }),
  body('downloadUrl').isURL({ protocols: ['https'], require_protocol: true }).isLength({ max: 2048 }),
  body('sizeBytes').isInt({ min: 1, max: MAX_FILE_BYTES }).toInt(),
  body('thumbPath').isString().isLength({ min: 1, max: 512 }),
  body('thumbUrl').isURL({ protocols: ['https'], require_protocol: true }).isLength({ max: 2048 }),
  body('thumbSizeBytes').isInt({ min: 1 }).toInt(),
  body('width').isInt({ min: 1, max: 100000 }).toInt(),
  body('height').isInt({ min: 1, max: 100000 }).toInt(),
  body('mimeType').isString().matches(/^image\/[a-z0-9.+-]+$/i),
  body('originalFileName').optional().isString().isLength({ max: 255 }),
  body('isCover').isBoolean().toBoolean(),
  body('takenAt').optional({ values: 'null' }).matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/),
  body('lat').optional({ values: 'null' }).isFloat({ min: -90, max: 90 }).toFloat(),
  body('lng').optional({ values: 'null' }).isFloat({ min: -180, max: 180 }).toFloat(),
];

const validateCompleteUploadSession = [
  memoryIdParam,
  param('sessionId').isUUID(4),
  body('uploadedClientIds').isArray({ max: MAX_FILES_PER_SESSION }),
  body('uploadedClientIds.*').isUUID(4),
  body('canceledClientIds').isArray({ max: MAX_FILES_PER_SESSION }),
  body('canceledClientIds.*').isUUID(4),
];

const validateListMemoryPhotos = [memoryIdParam];

const validateDeletePhotos = [
  memoryIdParam,
  body('photoIds').isArray({ min: 1, max: 500 }),
  body('photoIds.*').isUUID(),
];

const validateSetCover = [
  memoryIdParam,
  body('photoId').isUUID(),
];

module.exports = {
  validateCreateUploadSession,
  validateRegisterPhoto,
  validateCompleteUploadSession,
  validateListMemoryPhotos,
  validateDeletePhotos,
  validateSetCover,
};
