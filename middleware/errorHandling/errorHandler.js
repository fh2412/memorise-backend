const logger = require('../logger');

const formatErrorResponse = (err, req, res, isProduction) => {
    const errorResponse = {
        message: err.message || 'Internal Server Error',
    };

    if (!isProduction) {
        errorResponse.stack = err.stack;
    }

    return errorResponse;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';

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

    const errorResponse = formatErrorResponse(err, req, res, isProduction);

    res.status(err.status || 500).json(errorResponse);
};

module.exports = errorHandler;