const { param, body } = require('express-validator');


const validateLocationId = [
  param('locationId')
    .exists().withMessage('Location ID is required')
    .notEmpty().withMessage('Location ID must not be empty')
    .isInt().withMessage('Location ID must be an INT'),
];

const validateCreateLocation = [
  body('longitude')
    .exists().withMessage('Longitude is required')
    .isFloat().withMessage('Longitude must be a number'),

  body('latitude')
    .exists().withMessage('Latitude is required')
    .isFloat().withMessage('Latitude must be a number'),

  body('country')
    .exists().withMessage('Country is required')
    .isString().withMessage('Country must be a string'),

  body('countryCode')
    .exists().withMessage('countryCode is required')
    .isString().withMessage('countryCode must be a string'),

  body('city')
    .optional()
    .isString().withMessage('City must be a string'),
];

module.exports = { validateLocationId, validateCreateLocation }