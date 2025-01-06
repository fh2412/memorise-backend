const { body, param } = require('express-validator');
const firebaseUUIDRegex = /^[A-Za-z0-9_-]{28}$/;

const validateMemoryId = [
  param('memoryId')
    .exists().withMessage('Memory ID is required')
    .notEmpty().withMessage('Title must not be empty')
    .isInt().withMessage('Memory ID must be an INT'),
];

const validateCreateMemory = [
  body('creator_id')
    .exists()
    .withMessage('Firebase UID is required')
    .matches(firebaseUUIDRegex)
    .withMessage('Invalid UUID format. Must be a 28-character base64 URL-safe string.'),

  body('title')
    .exists().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .notEmpty().withMessage('Title must not be empty'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 10000 }).withMessage('Description is to long'),

  body('firestore_bucket_url')
    .exists().withMessage('Firebase Storage bucket URL is required')
    .isString().isLength({ min: 35, max: 45 })
    .withMessage('Firebase Storage bucket URL must be in the correct format'),

  body('location_id')
    .exists().withMessage('Memory ID is required')
    .notEmpty().withMessage('Title must not be empty')
    .isInt().withMessage('Memory ID must be an INT'),

  body('activity_id')
    .exists().withMessage('Memory ID is required')
    .notEmpty().withMessage('Title must not be empty')
    .isInt().withMessage('Memory ID must be an INT'),

  body('memory_date')
    .exists().withMessage('Memory date is required')
    .isISO8601().withMessage('Memory date must be in the format YYYY-MM-DDTHH:mm:ss.sssZ'),

  body('memory_end_date')
    .optional()
    .isISO8601().withMessage('Memory end date must be in the format YYYY-MM-DDTHH:mm:ss.sssZ'),

  body('title_pic')
    .exists().withMessage('Title picture URL is required')
    .isURL().withMessage('Title picture URL must be a valid URL')
    .custom(value => value.startsWith('https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories'))
    .withMessage('Title picture URL must be in the correct format'),
];

const validateAddFriendsToMemory = [
  body('memoryId')
    .exists().withMessage('Memory ID is required')
    .notEmpty().withMessage('Title must not be empty')
    .isInt().withMessage('Memory ID must be an INT'),

  body('emails')
    .exists().withMessage('Email list is required')
    .isArray().withMessage('Emails must be provided in an array')
    .custom(emails => {
      if (!emails.every(email => typeof email === 'string' && email.trim() !== '')) {
        throw new Error('Email list must contain only valid email addresses');
      }
      return true;
    }).withMessage('Email list must contain only valid email addresses'),
];

const validateUpdateMemory = [
  param('memoryId')
    .exists().withMessage('Memory ID is required')
    .notEmpty().withMessage('Title must not be empty')
    .isInt().withMessage('Memory ID must be an INT'),

  body('title')
    .exists().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .notEmpty().withMessage('Title must not be empty'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 10000 }).withMessage('Description is to long'),

  body('memory_date')
    .exists().withMessage('Memory date is required')
    .isISO8601().withMessage('Memory date must be in the format YYYY-MM-DDTHH:mm:ss.sssZ'),

  body('memory_end_date')
    .exists().withMessage('Memory end date is required')
    .isISO8601().withMessage('Memory end date must be in the format YYYY-MM-DDTHH:mm:ss.sssZ'),
];

const validateUpdatePictureCount = [
  param('memoryId')
    .exists().withMessage('Memory ID is required')
    .notEmpty().withMessage('Title must not be empty')
    .isInt().withMessage('Memory ID must be an INT'),

  body('picture_count')
    .exists().withMessage('Picture count is required')
    .isInt().withMessage('Picture count must be an integer'),
];

const validateUpdateMemoryLocation = [
  param('memoryId')
    .exists().withMessage('Memory ID is required')
    .notEmpty().withMessage('Title must not be empty')
    .isInt().withMessage('Memory ID must be an INT'),

  body('locationId')
    .exists().withMessage('Location ID is required')
    .isMongoId().withMessage('Location ID must be a valid MongoDB ObjectId'),
];

const validateUpdateTitlePic = [
  param('imageId')
    .exists().withMessage('Image ID is required'),

  body('imageUrl')
    .exists().withMessage('Title picture URL is required')
    .isURL().withMessage('Title picture URL must be a valid URL')
    .custom(value => value.startsWith('https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories'))
    .withMessage('Title picture URL must be in the correct format'),
];
module.exports = { validateMemoryId, validateCreateMemory, validateAddFriendsToMemory, validateUpdateMemory, validateUpdatePictureCount, validateUpdateMemoryLocation, validateUpdateTitlePic };