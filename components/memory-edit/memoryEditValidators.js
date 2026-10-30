const { body, param } = require('express-validator');
const { ISO_DATE, isRealDate } = require('../memory-create/memoryCreateValidators');

const MAX_CREW = 100;

const isRealDate = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    throw new Error('Invalid date');
  }
  return true;
};

const nullableDay = (field, { required }) => body(field).custom((value) => {
  if (value === undefined && !required) return true;
  if (value === null) return true;
  if (typeof value !== 'string' || !ISO_DATE.test(value)) {
    throw new Error(`${field} must be YYYY-MM-DD or null`);
  }
  return isRealDate(value);
});

const hasValue = (field) => body(field).exists({ values: 'null' });

const memoryIdParam = param('memoryId').isInt({ min: 1 }).withMessage('Invalid memoryId').toInt();

const validateUpdateMemoryDetails = [
  memoryIdParam,

  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional({ values: 'null' }).isString().isLength({ max: 5000 }),

  body('startDate').optional({ values: 'null' }).matches(ISO_DATE).bail().custom(isRealDate),
  body('endDate').optional({ values: 'null' }).matches(ISO_DATE).bail().custom(isRealDate).bail()
    .custom((end, { req }) => {
      if (!req.body.startDate) throw new Error('endDate requires startDate');
      if (end < req.body.startDate) throw new Error('endDate must not be before startDate');
      return true;
    }),

  // missing = unchanged, null = remove, object = new location
  body('location').optional({ values: 'null' }).isObject(),
  body('location.lat').if(hasValue('location')).isFloat({ min: -90, max: 90 }).toFloat(),
  body('location.lng').if(hasValue('location')).isFloat({ min: -180, max: 180 }).toFloat(),
  body('location.city').optional({ values: 'null' }).isString().isLength({ max: 255 }),
  body('location.country').optional({ values: 'null' }).isString().isLength({ max: 255 }),
  body('location.countryCode').optional({ values: 'falsy' }).isString().isLength({ min: 2, max: 2 }),

  // missing = unchanged, array = complete desired crew
  body('crew').optional().isArray({ max: MAX_CREW }),
  body('crew.*').custom((entry) => {
    const keys = ['userId', 'placeholderId', 'placeholderName']
      .filter(k => typeof entry?.[k] === 'string' && entry[k].trim().length > 0);
    if (keys.length !== 1) throw new Error('Each crew entry needs exactly one of userId, placeholderId, placeholderName');
    return true;
  }),
  body('crew.*.userId').optional().isString().isLength({ max: 128 }),
  body('crew.*.placeholderId').optional().isUUID(),
  body('crew.*.placeholderName').optional().isString().trim().isLength({ max: 100 }),
];

const validateListPlaceholders = [memoryIdParam];

const validateUpdateMemoryDates = [
  param('memoryId').isInt({ min: 1 }).toInt(),
  body().custom((b) => {
    const unknown = Object.keys(b ?? {}).filter(k => k !== 'startDate' && k !== 'endDate');
    if (unknown.length) throw new Error(`Unknown fields: ${unknown.join(', ')}`);
    return true;
  }),
  nullableDay('startDate', { required: true }),          // null = clear the dates
  nullableDay('endDate', { required: false }).bail().custom((end, { req }) => {
    if (end == null) return true;
    if (req.body.startDate == null) throw new Error('endDate requires startDate');
    if (end < req.body.startDate) throw new Error('endDate must not be before startDate');
    return true;
  }),
];

module.exports = { validateUpdateMemoryDetails, validateListPlaceholders, validateUpdateMemoryDates };
