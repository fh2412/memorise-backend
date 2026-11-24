const logger = require('../logger');

const formatErrorResponse = (err, isProduction) => {
  const status = err.status || 500;
  const isClientError = status < 500;

  const errorResponse = {
    // 4xx messages are written for the user; 5xx messages may contain internals
    message: isClientError || !isProduction ? (err.message || 'Request failed') : 'Internal Server Error',
  };
  if (isClientError && typeof err.code === 'string') errorResponse.code = err.code;
  if (!isProduction) errorResponse.stack = err.stack;

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

  res.status(err.status || 500).json(formatErrorResponse(err, isProduction));
};

module.exports = errorHandler;