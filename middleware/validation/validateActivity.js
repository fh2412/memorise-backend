const { param, body } = require('express-validator');


const validateActivityId = [
    param('activityId')
        .exists().withMessage('Activity ID is required')
        .isMongoId().withMessage('Activity ID must be a valid MongoDB ObjectId'),
];

const validateCreateActivity = [
    body('title')
        .exists().withMessage('Activity Title is required')
        .isString().withMessage('Activity Title must be a string'),
];

module.exports = { validateActivityId, validateCreateActivity }