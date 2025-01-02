// validation.js
const { body, check } = require('express-validator');

const validateFirebaseUID = [
  check('id')
    .exists()
    .withMessage('Firebase UID is required')
    .isUUID('v4')
    .withMessage('Invalid Firebase UID format')
];

module.exports = { validateFirebaseUID };