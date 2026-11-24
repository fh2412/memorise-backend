const express = require('express');
const router = express.Router({ mergeParams: true });
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { handle } = require('../plan-shared/planHttp');
const v = require('./planExpensesValidators');
const service = require('./planExpensesService');

const ids = (req) => ({
  memoryId: Number(req.params.memoryId),
  expenseId: Number(req.params.expenseId),
  itemId: Number(req.params.itemId),
});

// Every write returns the full, recalculated ledger → the client never computes balances itself.

/**
 * GET ledger: expenses, participants (incl. placeholders + former members), balances,
 * currency settings, booking suggestions, viewer
 * @route GET /api/memories/:memoryId/plan/expenses
 */
router.get('/', authenticateFirebaseToken, v.validateList, handleValidationErrors,
  handle('GET /plan/expenses', async (req, res) => {
    res.json(await service.getLedger(req.user.uid, ids(req).memoryId));
  }));

/**
 * POST add expense
 * @body { title, category?, amountCents, currency, paidBy:"u:<id>"|"p:<id>", spentOn?, split, notes? }
 *       split = { mode:'equal', participants:[key] } | { mode:'custom', shares:[{ participant, amountCents }] }
 * @returns 201 ledger | 400 EXPENSE_SPLIT_MISMATCH, EXPENSE_PARTICIPANT_UNKNOWN, EXPENSE_PAYER_UNKNOWN
 */
router.post('/', authenticateFirebaseToken, v.validateCreate, handleValidationErrors,
  handle('POST /plan/expenses', async (req, res) => {
    res.status(201).json(await service.createExpense(req.user.uid, ids(req).memoryId, req.body));
  }));

/**
 * PUT currency settings (owner)
 * @body { baseCurrency?, rates?: { HUF: 0.0025, ... } }   (1 unit = rate × base)
 * Registered before /:expenseId so "currency" is never parsed as an id.
 */
router.put('/currency', authenticateFirebaseToken, v.validateCurrency, handleValidationErrors,
  handle('PUT /plan/expenses/currency', async (req, res) => {
    res.json(await service.setCurrency(req.user.uid, ids(req).memoryId, req.body));
  }));

/**
 * POST booking → expense (equal split; all current participants unless given)
 * @route POST /api/memories/:memoryId/plan/expenses/from-booking/:itemId
 * @body { participants?: [key] }
 * @returns 201 ledger | 409 EXPENSE_BOOKING_EXISTS | 400 EXPENSE_BOOKING_INCOMPLETE
 */
router.post('/from-booking/:itemId', authenticateFirebaseToken, v.validateFromBooking, handleValidationErrors,
  handle('POST /plan/expenses/from-booking/:itemId', async (req, res) => {
    const { memoryId, itemId } = ids(req);
    res.status(201).json(await service.createFromBooking(req.user.uid, memoryId, itemId, req.body));
  }));

/** PATCH expense (creator, payer, owner) @returns ledger | 403 EXPENSE_EDIT_FORBIDDEN */
router.patch('/:expenseId', authenticateFirebaseToken, v.validateUpdate, handleValidationErrors,
  handle('PATCH /plan/expenses/:expenseId', async (req, res) => {
    const { memoryId, expenseId } = ids(req);
    res.json(await service.updateExpense(req.user.uid, memoryId, expenseId, req.body));
  }));

/** DELETE expense (creator, payer, owner) @returns ledger */
router.delete('/:expenseId', authenticateFirebaseToken, v.validateDelete, handleValidationErrors,
  handle('DELETE /plan/expenses/:expenseId', async (req, res) => {
    const { memoryId, expenseId } = ids(req);
    res.json(await service.deleteExpense(req.user.uid, memoryId, expenseId));
  }));

module.exports = router;
