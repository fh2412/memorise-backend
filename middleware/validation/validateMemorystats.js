const { param } = require('express-validator');


const validateStatsUID = [
    param('user1Id')
    .exists()
    .withMessage('Firebase UID is required')
    .isUUID('v4')
    .withMessage('Invalid Firebase UID format'),
  param('user2Id')
    .exists()
    .withMessage('Firebase UID is required')
    .isUUID('v4')
    .withMessage('Invalid Firebase UID format')
];

module.exports = { validateStatsUID }