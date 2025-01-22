const { param, body } = require('express-validator');


const validateActivityId = [
    param('activityId')
        .exists().withMessage('activityId is required')
        .notEmpty().withMessage('activityId must not be empty')
        .isInt().withMessage('activityId must be an INT'),
];

const validateCreateActivity = [
    body('title')
        .exists().withMessage('Activity Title is required')
        .notEmpty().withMessage('Title must not be empty')
        .isString().withMessage('Activity Title must be a string'),
];

module.exports = { validateActivityId, validateCreateActivity }