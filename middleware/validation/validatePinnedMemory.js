const { body } = require('express-validator');

const validatePinnedMemoryId = [
    body('memoryId')
      .exists().withMessage('Memory ID is required')
      .isMongoId().withMessage('Memory ID must be a valid MongoDB ObjectId'),
];

module.exports = { validatePinnedMemoryId };