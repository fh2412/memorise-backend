const { body, param } = require('express-validator');
const { ISO_DATE, isRealDate } = require('../memory-create/memoryCreateValidators');

const MAX_RANGE_DAYS = 366;
const MAX_TRIP_DAYS = 30;

const memoryIdParam = param('memoryId').isInt({ min: 1 }).toInt();
const isoDay = (chain) => chain.isString().bail().matches(ISO_DATE).bail().custom(isRealDate);
const dayDiff = (from, to) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

const onlyFields = (allowed) => body().custom((b) => {
  if (b === null || typeof b !== 'object' || Array.isArray(b)) throw new Error('Body must be an object');
  const unknown = Object.keys(b).filter(k => !allowed.includes(k));
  if (unknown.length) throw new Error(`Unknown fields: ${unknown.join(', ')}`);
  return true;
});

const validateGetAvailability = [memoryIdParam];

const validatePutMyAvailability = [
  memoryIdParam,
  onlyFields(['yes', 'maybe']),
  body('yes').isArray({ max: MAX_RANGE_DAYS }),
  body('maybe').isArray({ max: MAX_RANGE_DAYS }),
  isoDay(body('yes.*')),
  isoDay(body('maybe.*')),
  body().custom((b) => {
    const { yes, maybe } = b ?? {};
    if (!Array.isArray(yes) || !Array.isArray(maybe)) return true; // reported by the rules above
    const all = [...yes, ...maybe];
    if (all.length > MAX_RANGE_DAYS) throw new Error(`At most ${MAX_RANGE_DAYS} days`);
    if (new Set(all).size !== all.length) throw new Error('Each day may appear only once');
    return true;
  }),
];

const validatePutSettings = [
  memoryIdParam,
  onlyFields(['rangeStart', 'rangeEnd', 'minDays', 'maxDays']),
  isoDay(body('rangeStart')),
  isoDay(body('rangeEnd')).bail().custom((end, { req }) => {
    const span = dayDiff(req.body.rangeStart, end) + 1;
    if (!(span >= 1)) throw new Error('rangeEnd must not be before rangeStart');
    if (span > MAX_RANGE_DAYS) throw new Error(`The search range may span at most ${MAX_RANGE_DAYS} days`);
    return true;
  }),
  body('minDays').isInt({ min: 1, max: MAX_TRIP_DAYS }).toInt(),
  body('maxDays').isInt({ min: 1, max: MAX_TRIP_DAYS }).toInt().bail()
    .custom((max, { req }) => {
      if (max < Number(req.body.minDays)) throw new Error('maxDays must be >= minDays');
      return true;
    }),
];

module.exports = { validateGetAvailability, validatePutMyAvailability, validatePutSettings };