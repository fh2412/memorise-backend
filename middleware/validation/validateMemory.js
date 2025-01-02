const { body, param } = require('express-validator');

const validateMemoryId = [
    param('memoryId')
      .exists().withMessage('Memory ID is required')
      .isMongoId().withMessage('Memory ID must be a valid MongoDB ObjectId'),
];

const validateCreateMemory = [
  body('creator_id')
    .exists()
    .withMessage('Firebase UID is required')
    .isUUID('v4')
    .withMessage('Invalid Firebase UID format'),

  body('title')
    .exists().withMessage('Title is required')
    .isString().withMessage('Title must be a string'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),

  body('firestore_bucket_url')
    .exists().withMessage('Firebase Storage bucket URL is required')
    .isURL().withMessage('Firebase Storage bucket URL must be a valid URL')
    .matches(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9]+\.[A-Za-z]+$/, 'i')
    .withMessage('Firebase Storage bucket URL must be in the correct format'),

  body('location_id')
    .exists().withMessage('Location ID is required')
    .isMongoId().withMessage('Location ID must be a valid MongoDB ObjectId'),

  body('activity_id')
    .exists().withMessage('Activity ID is required')
    .isMongoId().withMessage('Activity ID must be a valid MongoDB ObjectId'),

  body('memory_date')
    .exists().withMessage('Memory date is required')
    .isISO8601().withMessage('Memory date must be in the format YYYY-MM-DDTHH:mm:ss.sssZ'),

  body('memory_end_date')
    .optional()
    .isISO8601().withMessage('Memory end date must be in the format YYYY-MM-DDTHH:mm:ss.sssZ'),

  body('title_pic')
    .exists().withMessage('Title picture URL is required')
    .isURL().withMessage('Title picture URL must be a valid URL')
    .matches(/^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/.+\.appspot\.com\/o\/memories\/.+\/picture_\d+\.jpg\?alt=media&token=[a-z0-9-]+$/, 'i')
    .withMessage('Title picture URL must be in the correct format'),
];

const validateAddFriendsToMemory = [
    param('memoryId')
      .exists().withMessage('Memory ID is required')
      .isMongoId().withMessage('Memory ID must be a valid MongoDB ObjectId'),
  
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
      .isMongoId().withMessage('Memory ID must be a valid MongoDB ObjectId'),
  
    body('title')
      .exists().withMessage('Title is required')
      .isString().withMessage('Title must be a string'),
  
    body('description')
      .optional()
      .isString().withMessage('Description must be a string'), 
  
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
      .isMongoId().withMessage('Memory ID must be a valid MongoDB ObjectId'),
  
    body('picture_count')
      .exists().withMessage('Picture count is required')
      .isInt().withMessage('Picture count must be an integer'),
  ];

  const validateUpdateMemoryLocation = [
    param('memoryId')
      .exists().withMessage('Memory ID is required')
      .isMongoId().withMessage('Memory ID must be a valid MongoDB ObjectId'),
  
    body('locationId')
      .exists().withMessage('Location ID is required')
      .isMongoId().withMessage('Location ID must be a valid MongoDB ObjectId'),
  ];

  const validateUpdateTitlePic = [
    param('imageId')
      .exists().withMessage('Image ID is required')
      .isMongoId().withMessage('Image ID must be a valid MongoDB ObjectId'),
  
    body('imageUrl')
      .exists().withMessage('Image URL is required')
      .isURL().withMessage('Image URL must be a valid URL')
      .matches(/^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/.+\.appspot\.com\/o\/memories\/.+\/picture_\d+\.jpg\?alt=media&token=[a-z0-9-]+$/, 'i')
      .withMessage('Image URL must be in the correct format'),
  ];
module.exports = { validateMemoryId, validateCreateMemory, validateAddFriendsToMemory, validateUpdateMemory, validateUpdatePictureCount, validateUpdateMemoryLocation, validateUpdateTitlePic };