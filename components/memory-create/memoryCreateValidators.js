const { body } = require('express-validator');

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CREW = 100;
const MAX_FILES = 1000;
const MAX_FILE_BYTES = 200 * 1024 * 1024;

/** "2026-02-30" passes the regex but isn't a real day. */
const isRealDate = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    throw new Error('Invalid date');
  }
  return true;
};

const hasValue = (field) => body(field).exists({ values: 'null' });

const validateCreateMemory = [
  body('requestId').isUUID(4).withMessage('requestId must be a UUID v4'),

  body('title').isString().trim().isLength({ min: 0, max: 255 }),
  body('description').optional({ values: 'null' }).isString().isLength({ max: 5000 }),

  // Calendar days without time zone ("YYYY-MM-DD"). Optional → planned memories.
  body('startDate').optional({ values: 'null' }).matches(ISO_DATE).bail().custom(isRealDate),
  body('endDate').optional({ values: 'null' }).matches(ISO_DATE).bail().custom(isRealDate).bail()
    .custom((end, { req }) => {
      if (!req.body.startDate) throw new Error('endDate requires startDate');
      if (end < req.body.startDate) throw new Error('endDate must not be before startDate');
      return true;
    }),

  // Either a new location OR an existing locationId (e.g. from an activity).
  body('locationId').optional({ values: 'null' }).isInt({ min: 1 }).toInt(),
  body('location').optional({ values: 'null' }).isObject().bail()
    .custom((_, { req }) => {
      if (req.body.locationId != null) throw new Error('Use either location or locationId');
      return true;
    }),
  body('location.lat').if(hasValue('location')).isFloat({ min: -90, max: 90 }).toFloat(),
  body('location.lng').if(hasValue('location')).isFloat({ min: -180, max: 180 }).toFloat(),
  body('location.city').optional({ values: 'null' }).isString().isLength({ max: 255 }),
  body('location.country').optional({ values: 'null' }).isString().isLength({ max: 255 }),
  body('location.countryCode').optional({ values: 'falsy' }).isString().isLength({ min: 2, max: 2 }),

  body('activityId').optional({ values: 'null' }).isInt({ min: 1 }).toInt(),

  body('crew').optional().isArray({ max: MAX_CREW }),
  body('crew.*').custom((entry) => {
    const hasUser = typeof entry?.userId === 'string' && entry.userId.length > 0;
    const hasPlaceholder = typeof entry?.placeholderName === 'string' && entry.placeholderName.trim().length > 0;
    if (hasUser === hasPlaceholder) throw new Error('Each crew entry needs either userId or placeholderName');
    return true;
  }),
  body('crew.*.userId').optional().isString().isLength({ max: 128 }),
  body('crew.*.placeholderName').optional().isString().trim().isLength({ max: 100 }),

  // Optional: reserve storage for photos in the same transaction.
  body('upload').optional({ values: 'null' }).isObject(),
  body('upload.expectedFileCount').if(hasValue('upload')).isInt({ min: 1, max: MAX_FILES }).toInt(),
  body('upload.expectedBytes').if(hasValue('upload')).isInt({ min: 1, max: MAX_FILES * MAX_FILE_BYTES }).toInt(),
];

module.exports = { validateCreateMemory };
