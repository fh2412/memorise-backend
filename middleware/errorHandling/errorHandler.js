// apps/component-a/middlewares/errorHandler.js
const logger = require('../logger');

// Define an Error Response Formatter
const formatErrorResponse = (err, req, res, isProduction) => {
    const errorResponse = {
        message: err.message || 'Internal Server Error',
    };

    if (!isProduction) {
        // Include stack trace in development for debugging
        errorResponse.stack = err.stack;
    }

    return errorResponse;
};

// Central Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Log the error
    logger.error({
        message: err.message,
        stack: err.stack,
        status: err.status || 500,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
    });

    // Format the error response
    const errorResponse = formatErrorResponse(err, req, res, next, isProduction);

    // Send the response
    res.status(err.status || 500).json(errorResponse);
};

module.exports = errorHandler;
