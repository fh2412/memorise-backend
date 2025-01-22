// validation.js
const { body, check } = require('express-validator');
const firebaseUUIDRegex = /^[A-Za-z0-9_-]{28}$/;


const validateFirebaseUID = [
  check('userId')
    .exists()
    .withMessage('Firebase UID is required')
    .matches(firebaseUUIDRegex)
    .withMessage('Invalid UUID format. Must be a 28-character base64 URL-safe string.'),
];

const validateUserEmail = [
  body('email')
    .exists()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
];

const validateUserPassword = [
  body('password')
    .exists()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
  // Optionally add more rules for password complexity
  // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/) // Example for complex password pattern
];

const validateProfilePicUrl = [
  body('profilepic')
    .exists()
    .withMessage('Profile picture URL is required')
    .isURL({
      require_protocol: true,
      protocols: ['https'],
      require_host: true,
      host_whitelist: ['firebasestorage.googleapis.com'],
    })
    .withMessage('Invalid profile picture URL format'),
];

const validateUserUpdate = [
  body('name')
    .exists()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),

  body('bio')
    .optional({ nullable: true })
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('gender')
    .optional({ nullable: true })
    .isIn(['Male', 'Female', 'Divers'])
    .withMessage('Invalid gender. Allowed values: Male, Female, Divers'),

  body('username')
    .optional({ nullable: true })
    .isString()
    .withMessage('Username must be a string')
    .isLength({ max: 50 })
    .withMessage('Username cannot exceed 50 characters'),

  body('instagram')
    .optional({ nullable: true })
    .isString()
    .withMessage('Instagram must be a string')
    .isLength({ max: 50 })
    .withMessage('Instagram cannot exceed 50 characters'),
];

module.exports = { validateFirebaseUID, validateUserEmail, validateUserPassword, validateProfilePicUrl, validateUserUpdate };