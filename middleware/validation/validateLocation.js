const { param, body } = require('express-validator');


const validateLocationId = [
    param('locationId')
        .exists().withMessage('Memory ID is required')
        .isMongoId().withMessage('Memory ID must be a valid MongoDB ObjectId'),
];

const validateCreateLocation = [
    body('lng')
      .exists().withMessage('Longitude is required')
      .isFloat().withMessage('Longitude must be a number'),
  
    body('lat')
      .exists().withMessage('Latitude is required')
      .isFloat().withMessage('Latitude must be a number'),
  
    body('l_country')
      .exists().withMessage('Country is required')
      .isString().withMessage('Country must be a string'),
  
    body('l_city')
      .exists().withMessage('City is required')
      .isString().withMessage('City must be a string'),
  ];
  

module.exports = { validateLocationId, validateCreateLocation }