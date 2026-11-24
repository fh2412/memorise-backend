const { body } = require('express-validator');
const { memoryIdParam, itemIdParam, onlyFields } = require('../plan-shared/planHttp');
const { isRealLocal, isValidTimeZone } = require('../plan-shared/localTime');
const { assertLocation } = require('../plan-polls/planPollsValidators');

const KINDS = ['stay', 'transport', 'activity'];
const STATUSES = ['option', 'booked', 'cancelled'];
const TRANSPORT_MODES = ['flight', 'train', 'bus', 'car', 'ferry', 'other'];
const CURRENCIES = new Set(Intl.supportedValuesOf('currency'));
const MAX_PRICE_CENTS = 100_000_000; // 1 Mio.

const DETAIL_FIELDS = [
  'title', 'description', 'status', 'provider', 'url', 'confirmationCode',
  'startsAt', 'startTz', 'endsAt', 'endTz',
  'transportMode', 'origin', 'destination', 'carrier', 'transportNumber',
  'address', 'location', 'priceCents', 'currency', 'paidBy', 'notes',
];
const CREATE_FIELDS = [...DETAIL_FIELDS, 'kind', 'sourcePollId', 'board_x', 'board_y', 'color'];

const text = (field, max) =>
  body(field).optional({ values: 'null' }).isString().bail().trim().isLength({ max });

const localRule = (field) => body(field).optional({ values: 'null' }).custom((v) => {
  if (!isRealLocal(v)) throw new Error(`${field} must be YYYY-MM-DDTHH:mm`);
  return true;
});

const tzRule = (field) => body(field).optional({ values: 'null' }).custom((v) => {
  if (!isValidTimeZone(v)) throw new Error(`${field} must be an IANA time zone, e.g. Europe/Vienna`);
  return true;
});

const sharedRules = [
  text('description', 5000),
  body('status').optional().isIn(STATUSES),
  text('provider', 200),
  body('url').optional({ values: 'null' }).isString().bail().isLength({ max: 2048 }).bail()
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
  text('confirmationCode', 100),
  localRule('startsAt'), tzRule('startTz'),
  localRule('endsAt'), tzRule('endTz'),
  body('transportMode').optional({ values: 'null' }).isIn(TRANSPORT_MODES),
  text('origin', 200),
  text('destination', 200),
  text('carrier', 100),
  text('transportNumber', 40),
  text('address', 500),
  body('location').optional().custom(assertLocation),
  body('priceCents').optional({ values: 'null' }).isInt({ min: 0, max: MAX_PRICE_CENTS }).toInt(),
  body('currency').optional().custom((v) => {
    if (typeof v !== 'string' || !CURRENCIES.has(v)) throw new Error('Unknown currency');
    return true;
  }),
  body('paidBy').optional({ values: 'null' }).isString().isLength({ min: 1, max: 128 }),
  text('notes', 5000),
];

const validateCreateBooking = [
  memoryIdParam,
  onlyFields(CREATE_FIELDS),
  body('kind').isIn(KINDS),
  body('title').isString().bail().trim().isLength({ min: 1, max: 200 }),
  body('sourcePollId').optional({ values: 'null' }).isInt({ min: 1 }).toInt(),
  body('board_x').optional().isInt({ min: 0, max: 10_000 }).toInt(),
  body('board_y').optional().isInt({ min: 0, max: 10_000 }).toInt(),
  body('color').optional({ values: 'null' }).matches(/^#[0-9a-f]{6}$/i),
  ...sharedRules,
];

// kind is fixed after creation (it IS the category)
const validateUpdateBooking = [
  memoryIdParam,
  itemIdParam,
  onlyFields(DETAIL_FIELDS, { nonEmpty: true }),
  body('title').optional().isString().bail().trim().isLength({ min: 1, max: 200 }),
  ...sharedRules,
];

module.exports = { validateCreateBooking, validateUpdateBooking };
