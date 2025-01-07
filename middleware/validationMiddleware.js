// validationMiddleware.js
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
 
  next();
};

module.exports = handleValidationErrors;