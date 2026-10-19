/**
 * Creates an Error the central errorHandler understands (err.status).
 * `code` is a stable machine-readable identifier for the frontend (e.g. 'STORAGE_FULL').
 */
const httpError = (status, message, code) => {
  const error = new Error(message);
  error.status = status;
  if (code) error.code = code;
  return error;
};

module.exports = { httpError };
