const { body } = require('express-validator');

const validatePinnedMemoryId = [
  body('memoryId')
    .exists().withMessage('Memory ID is required')
    .notEmpty().withMessage('Title must not be empty')
    .isInt().withMessage('Memory ID must be an INT'),
];

module.exports = { validatePinnedMemoryId };