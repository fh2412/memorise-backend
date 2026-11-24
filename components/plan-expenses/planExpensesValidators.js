const { body, param } = require('express-validator');
const { memoryIdParam, onlyFields } = require('../plan-shared/planHttp');
const { ISO_DATE, isRealDate } = require('../memory-create/memoryCreateValidators');

const CATEGORIES = ['food', 'transport', 'stay', 'activity', 'other'];
const MAX_AMOUNT_CENTS = 100_000_000;
const MAX_PARTICIPANTS = 100;
const KEY_RX = /^(u|p):.{1,128}$/;

/** ISO currencies with 2 minor digits only – amounts are stored in cents. */
const CURRENCIES = new Set(Intl.supportedValuesOf('currency').filter((c) => {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: c }).resolvedOptions().maximumFractionDigits === 2;
  } catch {
    return false;
  }
}));
const isCurrency = (v) => typeof v === 'string' && CURRENCIES.has(v);

const expenseIdParam = param('expenseId').isInt({ min: 1 }).toInt();
const itemIdParam = param('itemId').isInt({ min: 1 }).toInt();

/** { mode:'equal', participants:[key] } | { mode:'custom', shares:[{ participant, amountCents }] } */
const assertSplit = (split) => {
  if (!split || typeof split !== 'object' || Array.isArray(split)) throw new Error('split must be an object');
  if (split.mode === 'equal') {
    const unknown = Object.keys(split).filter(k => k !== 'mode' && k !== 'participants');
    if (unknown.length) throw new Error(`Unknown split fields: ${unknown.join(', ')}`);
    if (!Array.isArray(split.participants) || split.participants.length === 0 || split.participants.length > MAX_PARTICIPANTS) {
      throw new Error('split.participants must list 1–100 participants');
    }
    if (split.participants.some(k => !KEY_RX.test(k))) throw new Error('Invalid participant key');
    return true;
  }
  if (split.mode === 'custom') {
    const unknown = Object.keys(split).filter(k => k !== 'mode' && k !== 'shares');
    if (unknown.length) throw new Error(`Unknown split fields: ${unknown.join(', ')}`);
    if (!Array.isArray(split.shares) || split.shares.length === 0 || split.shares.length > MAX_PARTICIPANTS) {
      throw new Error('split.shares must list 1–100 shares');
    }
    for (const s of split.shares) {
      if (!s || typeof s !== 'object' || !KEY_RX.test(s.participant)) throw new Error('Invalid share participant');
      if (!Number.isInteger(s.amountCents) || s.amountCents < 0 || s.amountCents > MAX_AMOUNT_CENTS) {
        throw new Error('Invalid share amount');
      }
    }
    return true;
  }
  throw new Error("split.mode must be 'equal' or 'custom'");
};

const FIELDS = ['title', 'category', 'amountCents', 'currency', 'paidBy', 'spentOn', 'split', 'notes'];

const rules = (optional) => {
  const o = (chain) => (optional ? chain.optional() : chain);
  return [
    o(body('title')).isString().bail().trim().isLength({ min: 1, max: 200 }),
    body('category').optional().isIn(CATEGORIES),
    o(body('amountCents')).isInt({ min: 1, max: MAX_AMOUNT_CENTS }).toInt(),
    o(body('currency')).custom((v) => {
      if (!isCurrency(v)) throw new Error('Unsupported currency');
      return true;
    }),
    o(body('paidBy')).isString().bail().matches(KEY_RX),
    body('spentOn').optional().matches(ISO_DATE).bail().custom(isRealDate),
    o(body('split')).custom(assertSplit),
    body('notes').optional({ values: 'null' }).isString().isLength({ max: 2000 }),
  ];
};

const validateList = [memoryIdParam];
const validateCreate = [memoryIdParam, onlyFields(FIELDS), ...rules(false)];
const validateUpdate = [memoryIdParam, expenseIdParam, onlyFields(FIELDS, { nonEmpty: true }), ...rules(true)];
const validateDelete = [memoryIdParam, expenseIdParam];
const validateFromBooking = [memoryIdParam, itemIdParam, onlyFields(['participants']),
  body('participants').optional().isArray({ min: 1, max: MAX_PARTICIPANTS }),
  body('participants.*').isString().matches(KEY_RX)];

const validateCurrency = [
  memoryIdParam,
  onlyFields(['baseCurrency', 'rates'], { nonEmpty: true }),
  body('baseCurrency').optional().custom((v) => {
    if (!isCurrency(v)) throw new Error('Unsupported currency');
    return true;
  }),
  body('rates').optional().custom((rates) => {
    if (!rates || typeof rates !== 'object' || Array.isArray(rates)) throw new Error('rates must be an object');
    const entries = Object.entries(rates);
    if (entries.length > 30) throw new Error('Too many rates');
    for (const [cur, rate] of entries) {
      if (!isCurrency(cur)) throw new Error(`Unsupported currency: ${cur}`);
      if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0 || rate >= 1_000_000) {
        throw new Error(`Invalid rate for ${cur}`);
      }
    }
    return true;
  }),
];

module.exports = {
  CATEGORIES, isCurrency,
  validateList, validateCreate, validateUpdate, validateDelete, validateFromBooking, validateCurrency,
};
