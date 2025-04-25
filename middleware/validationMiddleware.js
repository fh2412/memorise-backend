// validationMiddleware.js
const { validationResult } = require('express-validator');
const logger = require('./logger');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));

    // Log the validation errors
    logger.error({
      message: 'Validation errors occurred',
      errors: errorMessages,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });

    const error = new Error('Validation failed');
    error.status = 400;
    error.errors = errorMessages;
    error.validationError = true;
    return next(error); // Key change: Pass the error to next()
  }
  next();
};

module.exports = handleValidationErrors;
