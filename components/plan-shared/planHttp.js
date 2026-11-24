const { body, param } = require('express-validator');
const logger = require('../../middleware/logger');

const memoryIdParam = param('memoryId').isInt({ min: 1 }).toInt();
const itemIdParam = param('itemId').isInt({ min: 1 }).toInt();

/** Whitelist: unknown keys are rejected instead of silently ignored. */
const onlyFields = (allowed, { nonEmpty = false } = {}) => body().custom((b) => {
  if (b === null || typeof b !== 'object' || Array.isArray(b)) throw new Error('Body must be an object');
  const keys = Object.keys(b);
  if (nonEmpty && keys.length === 0) throw new Error('Body must not be empty');
  const unknown = keys.filter(k => !allowed.includes(k));
  if (unknown.length) throw new Error(`Unknown fields: ${unknown.join(', ')}`);
  return true;
});

/** Same try/catch + log line as the other controllers. */
const handle = (label, fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    logger.error(`Controller error; ${label} ${error.message}`);
    next(error);
  }
};

module.exports = { memoryIdParam, itemIdParam, onlyFields, handle };