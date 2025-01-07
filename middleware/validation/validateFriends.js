const { body } = require('express-validator');
const firebaseUUIDRegex = /^[A-Za-z0-9_-]{28}$/;


const validateFriendsUID = [
  body('senderId')
    .exists()
    .withMessage('Firebase UID is required')
    .matches(firebaseUUIDRegex)
    .withMessage('Invalid UUID format. Must be a 28-character base64 URL-safe string.'),
  body('receiverId')
    .exists()
    .withMessage('Firebase UID is required')
    .matches(firebaseUUIDRegex)
    .withMessage('Invalid UUID format. Must be a 28-character base64 URL-safe string.'),
];

module.exports = { validateFriendsUID }