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

const validateUserCreateActivity = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional(),
    body('groupSize').optional().isInt({min: 1}).withMessage('Group size must be a positive integer'),
    body('indoor_outdoor_flag').optional().isIn(['indoor', 'outdoor', 'both']).withMessage('Invalid indoor/outdoor flag'),
    body('commercialFlag').optional().isBoolean().withMessage('Commercial flag must be boolean'),
    body('prize').optional(),
    body('location').optional().isObject().withMessage('Location must be an object'),
    body('location.longitude').optional().isFloat().withMessage('Longitude must be a number'),
    body('location.latitude').optional().isFloat().withMessage('Latitude must be a number'),
    body('websiteUrl').optional().isURL().withMessage('Invalid website URL'),
    body('seasons').optional().isArray().withMessage('Seasons must be an array'),
    body('weathers').optional().isArray().withMessage('Weathers must be an array')
];

const validateUpdateActivity = [
    body('titlePictureUrl').optional().isString().withMessage('Title picture URL must be a string'),
    body('supportingDocUrls').optional().isArray().withMessage('Supporting document URLs must be an array')
];

module.exports = { validateActivityId, validateCreateActivity, validateUserCreateActivity, validateUpdateActivity }