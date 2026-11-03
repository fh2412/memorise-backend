const { body, param } = require('express-validator');

const POLL_CATEGORIES = ['destination', 'stay', 'transport', 'activity', 'other']; // 'dates' → date finder
const MAX_OPTIONS = 20;
const MAX_CLOSE_DAYS = 366;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
const LOCATION_KEYS = ['lat', 'lng', 'city', 'country', 'countryCode'];

const memoryIdParam = param('memoryId').isInt({ min: 1 }).toInt();
const itemIdParam = param('itemId').isInt({ min: 1 }).toInt();
const optionIdParam = param('optionId').isInt({ min: 1 }).toInt();

const onlyFields = (allowed, { nonEmpty = false } = {}) => body().custom((b) => {
  if (b === null || typeof b !== 'object' || Array.isArray(b)) throw new Error('Body must be an object');
  const keys = Object.keys(b);
  if (nonEmpty && keys.length === 0) throw new Error('Body must not be empty');
  const unknown = keys.filter(k => !allowed.includes(k));
  if (unknown.length) throw new Error(`Unknown fields: ${unknown.join(', ')}`);
  return true;
});

/** null/undefined = no location. */
const assertLocation = (loc) => {
  if (loc == null) return true;
  if (typeof loc !== 'object' || Array.isArray(loc)) throw new Error('location must be an object');
  const unknown = Object.keys(loc).filter(k => !LOCATION_KEYS.includes(k));
  if (unknown.length) throw new Error(`Unknown location fields: ${unknown.join(', ')}`);
  if (typeof loc.lat !== 'number' || loc.lat < -90 || loc.lat > 90) throw new Error('location.lat invalid');
  if (typeof loc.lng !== 'number' || loc.lng < -180 || loc.lng > 180) throw new Error('location.lng invalid');
  for (const k of ['city', 'country']) {
    if (loc[k] != null && (typeof loc[k] !== 'string' || loc[k].length > 255)) throw new Error(`location.${k} invalid`);
  }
  if (loc.countryCode != null && loc.countryCode !== ''
      && (typeof loc.countryCode !== 'string' || loc.countryCode.length !== 2)) {
    throw new Error('location.countryCode invalid');
  }
  return true;
};

const labelRule = (chain) => chain.isString().bail().trim().isLength({ min: 1, max: 200 });
const locationRule = (field) => body(field).optional().custom(assertLocation);
const boolRule = (field) => body(field).optional().isBoolean().toBoolean();

/** null = no deadline. Must be in the future (1 min clock skew) and within a year. */
const closesAtRule = body('closesAt').optional().custom((v) => {
  if (v === null) return true;
  if (typeof v !== 'string' || !ISO_DATETIME.test(v)) throw new Error('closesAt must be an ISO 8601 timestamp or null');
  const t = Date.parse(v);
  if (Number.isNaN(t)) throw new Error('closesAt is not a valid date');
  if (t < Date.now() - 60_000) throw new Error('closesAt must be in the future');
  if (t > Date.now() + MAX_CLOSE_DAYS * 86_400_000) throw new Error('closesAt must be within one year');
  return true;
});

const validateCreatePoll = [
  memoryIdParam,
  onlyFields(['title', 'description', 'category', 'options', 'multiple', 'maxChoices', 'closesAt',
    'allowMemberOptions', 'hideResults', 'sourceItemId', 'board_x', 'board_y', 'color']),
  labelRule(body('title')),
  body('description').optional({ values: 'null' }).isString().isLength({ max: 5000 }),
  body('category').isIn(POLL_CATEGORIES).withMessage('Polls are not allowed in this category'),
  body('options').isArray({ min: 1, max: MAX_OPTIONS }),
  body('options.*').custom((o) => {
    if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('Each option must be an object');
    const unknown = Object.keys(o).filter(k => k !== 'label' && k !== 'location');
    if (unknown.length) throw new Error(`Unknown option fields: ${unknown.join(', ')}`);
    return assertLocation(o.location);
  }),
  labelRule(body('options.*.label')),
  boolRule('multiple'),
  body('maxChoices').optional({ values: 'null' }).isInt({ min: 2, max: MAX_OPTIONS }).toInt(),
  closesAtRule,
  boolRule('allowMemberOptions'),
  boolRule('hideResults'),
  body('sourceItemId').optional({ values: 'null' }).isInt({ min: 1 }).toInt(),
  body('board_x').optional().isInt({ min: 0, max: 10_000 }).toInt(),
  body('board_y').optional().isInt({ min: 0, max: 10_000 }).toInt(),
  body('color').optional({ values: 'null' }).matches(/^#[0-9a-f]{6}$/i),
];

const validateUpdatePollSettings = [
  memoryIdParam, itemIdParam,
  onlyFields(['closesAt', 'allowMemberOptions', 'hideResults'], { nonEmpty: true }),
  closesAtRule,
  boolRule('allowMemberOptions'),
  boolRule('hideResults'),
];

const validateVote = [
  memoryIdParam, itemIdParam,
  onlyFields(['optionIds']),
  body('optionIds').isArray({ max: MAX_OPTIONS }),
  body('optionIds.*').isInt({ min: 1 }).toInt(),
];

const validateAddOption = [
  memoryIdParam, itemIdParam,
  onlyFields(['label', 'location']),
  labelRule(body('label')),
  locationRule('location'),
];

const validateUpdateOption = [
  memoryIdParam, itemIdParam, optionIdParam,
  onlyFields(['label', 'location'], { nonEmpty: true }),
  labelRule(body('label').optional()),
  locationRule('location'),
];

const validateOptionParams = [memoryIdParam, itemIdParam, optionIdParam];
const validatePollParams = [memoryIdParam, itemIdParam];

const validateDecide = [
  memoryIdParam, itemIdParam,
  onlyFields(['optionId', 'location']),
  body('optionId').isInt({ min: 1 }).toInt(),
  locationRule('location'),
];

const validateSetDestination = [
  memoryIdParam, itemIdParam,
  onlyFields(['location']),
  body('location').exists({ values: 'null' }).withMessage('location is required').bail().custom(assertLocation),
];

module.exports = {
  validateCreatePoll, validateUpdatePollSettings, validateVote, validateAddOption,
  validateUpdateOption, validateOptionParams, validatePollParams, validateDecide, validateSetDestination,
};