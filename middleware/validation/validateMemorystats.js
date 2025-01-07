const { param } = require('express-validator');
const firebaseUUIDRegex = /^[A-Za-z0-9_-]{28}$/;


const validateStatsUID = [
  param('user1Id')
    .exists()
    .withMessage('Firebase UID is required')
    .matches(firebaseUUIDRegex)
    .withMessage('Invalid UUID format. Must be a 28-character base64 URL-safe string.'),
  param('user2Id')
    .exists()
    .withMessage('Firebase UID is required')
    .matches(firebaseUUIDRegex)
    .withMessage('Invalid UUID format. Must be a 28-character base64 URL-safe string.'),
];

module.exports = { validateStatsUID }