const { body, param, query } = require('express-validator');
const { ISO_DATE, isRealDate } = require('../memory-create/memoryCreateValidators');

const CREATABLE_TYPES = ['note', 'idea', 'todo', 'link'];        // poll/booking get their own endpoints
const CATEGORIES = ['dates', 'destination', 'stay', 'transport', 'activity', 'other'];
const STATUSES = ['open', 'done', 'dismissed'];                   // 'decided' is set by the poll service only
const CREATE_FIELDS = ['type', 'title', 'description', 'category', 'payload', 'due_date',
  'board_x', 'board_y', 'color', 'assignees'];
const PATCH_FIELDS = [...CREATE_FIELDS, 'status'];
const MAX_PAYLOAD_CHARS = 10_000;
const BOARD_MAX = 10_000;

const memoryIdParam = param('memoryId').isInt({ min: 1 }).toInt();
const itemIdParam = param('itemId').isInt({ min: 1 }).toInt();

/** Whitelist: unknown keys are rejected instead of silently ignored. */
const onlyFields = (allowed) => body().custom((b) => {
  if (b === null || typeof b !== 'object' || Array.isArray(b)) throw new Error('Body must be an object');
  const keys = Object.keys(b);
  if (keys.length === 0) throw new Error('Body must not be empty');
  const unknown = keys.filter(k => !allowed.includes(k));
  if (unknown.length) throw new Error(`Unknown fields: ${unknown.join(', ')}`);
  return true;
});

const titleRule = (field) => field.isString().bail().trim().isLength({ min: 1, max: 200 });

const sharedRules = [
  body('description').optional({ values: 'null' }).isString().isLength({ max: 5000 }),
  body('category').optional().isIn(CATEGORIES),
  body('payload').optional({ values: 'null' }).isObject().bail()
    .custom((p) => {
      if (JSON.stringify(p).length > MAX_PAYLOAD_CHARS) throw new Error('payload too large');
      return true;
    }),
  body('payload.url').optional({ values: 'null' }).isString().bail().isLength({ max: 2048 }).bail()
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('due_date').optional({ values: 'null' }).matches(ISO_DATE).bail().custom(isRealDate),
  body('board_x').optional().isInt({ min: 0, max: BOARD_MAX }).toInt(),
  body('board_y').optional().isInt({ min: 0, max: BOARD_MAX }).toInt(),
  body('color').optional({ values: 'null' }).matches(/^#[0-9a-f]{6}$/i),
  body('assignees').optional().isArray({ max: 100 }),
  body('assignees.*').isString().isLength({ min: 1, max: 128 }),
];

const validateListItems = [memoryIdParam];

const validateCreateItem = [
  memoryIdParam,
  onlyFields(CREATE_FIELDS),
  body('type').isIn(CREATABLE_TYPES),
  titleRule(body('title')),
  ...sharedRules,
];

const validatePatchItem = [
  memoryIdParam,
  itemIdParam,
  onlyFields(PATCH_FIELDS),
  body('type').optional().isIn(CREATABLE_TYPES),
  titleRule(body('title').optional()),
  body('status').optional().isIn(STATUSES),
  ...sharedRules,
];

const validateDeleteItem = [memoryIdParam, itemIdParam];

const validateListEvents = [
  memoryIdParam,
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('before').optional().isInt({ min: 1 }).toInt(),
  query('after').optional().isInt({ min: 0 }).toInt().bail()
    .custom((_, { req }) => {
      if (req.query.before !== undefined) throw new Error('Use either before or after');
      return true;
    }),
];


module.exports = {
  validateListItems, validateCreateItem, validatePatchItem, validateDeleteItem, validateListEvents,
};