const { param } = require('express-validator');


const validateFriendsUID = [
  param('senderId')
    .exists()
    .withMessage('Firebase UID is required')
    .isUUID('v4')
    .withMessage('Invalid Firebase UID format'),
  param('receiverId')
    .exists()
    .withMessage('Firebase UID is required')
    .isUUID('v4')
    .withMessage('Invalid Firebase UID format')
];

module.exports = { validateFriendsUID }