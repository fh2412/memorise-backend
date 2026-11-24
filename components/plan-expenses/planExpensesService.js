const logger = require('../../middleware/logger');
const { httpError } = require('../../middleware/errorHandling/httpError');
const { withTransaction } = require('../memory-uploads/memoryUploadsDatalink');
const planDl = require('../plan-items/planItemsDatalink');
const { requireMembership } = require('../plan-items/planItemsService');
const { resolveToday } = require('../plan-shared/phase');
const { keyOf, parseKey, splitEqually } = require('./planExpensesLedger');
const { loadLedger, loadParticipants } = require('./planExpensesReader');
const dl = require('./planExpensesDatalink');

const BOOKING_CATEGORY = { stay: 'stay', transport: 'transport', activity: 'activity' };

const logUnexpected = (fn, error) => {
  if (!error.status) logger.error(`Service error; ${fn}: ${error.message}`);
};

const withMember = async (fnName, userId, memoryId, fn) => {
  try {
    return await withTransaction(async (conn) => {
      const membership = await requireMembership(conn, memoryId, userId);
      return fn(conn, membership);
    });
  } catch (error) {
    logUnexpected(fnName, error);
    throw error;
  }
};

/** Creator, payer (if a user) or plan owner. */
const canEdit = (membership, userId, e) =>
  membership.isCreator || e.created_by === userId || (e.paid_by_type === 'user' && e.paid_by_id === userId);

/** Turns the API split into DB shares. `allowed` = participant keys that may appear. */
const buildShares = (amountCents, split, allowed) => {
  const assertKnown = (key) => {
    if (!allowed.has(key)) throw httpError(400, 'Participant is not part of the crew', 'EXPENSE_PARTICIPANT_UNKNOWN');
  };

  let list;
  if (split.mode === 'equal') {
    const keys = [...new Set(split.participants)];
    keys.forEach(assertKnown);
    list = splitEqually(amountCents, keys);
  } else {
    const keys = split.shares.map(s => s.participant);
    if (new Set(keys).size !== keys.length) throw httpError(400, 'Each participant may appear once', 'EXPENSE_DUPLICATE_SHARE');
    keys.forEach(assertKnown);
    const sum = split.shares.reduce((acc, s) => acc + s.amountCents, 0);
    if (sum !== amountCents) {
      throw httpError(400, 'The shares must add up to the total amount', 'EXPENSE_SPLIT_MISMATCH');
    }
    list = split.shares.filter(s => s.amountCents > 0).map(s => ({ key: s.participant, cents: s.amountCents }));
    if (list.length === 0) throw httpError(400, 'At least one share must be above zero', 'EXPENSE_SPLIT_EMPTY');
  }
  return list.map(({ key, cents }) => ({ ...parseKey(key), cents }));
};

const ledgerResponse = async (conn, memoryId, userId, membership) => ({
  ...(await loadLedger(conn, memoryId)),
  bookingSuggestions: (await dl.findBookingSuggestionsDb(conn, memoryId)).map(b => ({
    item_id: b.item_id, title: b.title, kind: b.kind,
    price_cents: Number(b.price_cents), currency: b.currency, paid_by: keyOf('user', b.paid_by),
  })),
  viewer: { key: keyOf('user', userId), userId, isOwner: membership.isCreator },
});

// ---------- read ----------

const getLedger = (userId, memoryId) =>
  withMember('getLedger', userId, memoryId, (conn, membership) => ledgerResponse(conn, memoryId, userId, membership));

// ---------- write ----------

const createExpense = (userId, memoryId, input) =>
  withMember('createExpense', userId, memoryId, async (conn, membership) => {
    const allowed = new Set((await loadParticipants(conn, memoryId)).map(p => p.key));
    if (!allowed.has(input.paidBy)) throw httpError(400, '"Paid by" must be a crew member', 'EXPENSE_PAYER_UNKNOWN');
    const payer = parseKey(input.paidBy);
    const shares = buildShares(input.amountCents, input.split, allowed);
    const title = input.title.trim();

    const expenseId = await dl.insertExpenseDb(conn, memoryId, userId, {
      title,
      category: input.category ?? 'other',
      amount_cents: input.amountCents,
      currency: input.currency,
      paid_by_type: payer.type,
      paid_by_id: payer.id,
      spent_on: input.spentOn ?? resolveToday(null),
      split_mode: input.split.mode,
      notes: input.notes?.trim() || null,
    });
    await dl.replaceSharesDb(conn, expenseId, shares);
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'expense_added', itemTitle: title });
    return ledgerResponse(conn, memoryId, userId, membership);
  });

const updateExpense = (userId, memoryId, expenseId, input) =>
  withMember('updateExpense', userId, memoryId, async (conn, membership) => {
    const current = await dl.findExpenseForUpdateDb(conn, memoryId, expenseId);
    if (!current) throw httpError(404, 'Expense not found', 'EXPENSE_NOT_FOUND');
    if (!canEdit(membership, userId, current)) {
      throw httpError(403, 'Only the creator, the payer or the plan owner can edit this expense', 'EXPENSE_EDIT_FORBIDDEN');
    }

    const currentShares = await dl.findSharesDb(conn, [expenseId]);
    const currentKeys = currentShares.map(s => keyOf(s.participant_type, s.participant_id));
    // Former members already in this expense may stay; new keys must be current crew
    const allowed = new Set([...(await loadParticipants(conn, memoryId)).map(p => p.key), ...currentKeys]);
    const currentPayer = keyOf(current.paid_by_type, current.paid_by_id);

    const paidBy = input.paidBy ?? currentPayer;
    if (!allowed.has(paidBy) && paidBy !== currentPayer) {
      throw httpError(400, '"Paid by" must be a crew member', 'EXPENSE_PAYER_UNKNOWN');
    }
    const amount = input.amountCents ?? Number(current.amount_cents);

    let split = input.split;
    if (!split && amount !== Number(current.amount_cents)) {
      if (current.split_mode !== 'equal') {
        throw httpError(400, 'Please update the custom shares together with the amount', 'EXPENSE_SPLIT_MISMATCH');
      }
      split = { mode: 'equal', participants: currentKeys };
    }

    const payer = parseKey(paidBy);
    const row = {
      title: input.title?.trim() ?? current.title,
      category: input.category ?? current.category,
      amount_cents: amount,
      currency: input.currency ?? current.currency,
      paid_by_type: payer.type,
      paid_by_id: payer.id,
      spent_on: input.spentOn ?? current.spent_on,
      split_mode: split?.mode ?? current.split_mode,
      notes: 'notes' in input ? (input.notes?.trim() || null) : current.notes,
    };
    await dl.updateExpenseDb(conn, memoryId, expenseId, row);
    if (split) await dl.replaceSharesDb(conn, expenseId, buildShares(amount, split, allowed));

    await planDl.insertEventDb(conn, { memoryId, userId, action: 'expense_updated', itemTitle: row.title });
    return ledgerResponse(conn, memoryId, userId, membership);
  });

const deleteExpense = (userId, memoryId, expenseId) =>
  withMember('deleteExpense', userId, memoryId, async (conn, membership) => {
    const current = await dl.findExpenseForUpdateDb(conn, memoryId, expenseId);
    if (!current) throw httpError(404, 'Expense not found', 'EXPENSE_NOT_FOUND');
    if (!canEdit(membership, userId, current)) {
      throw httpError(403, 'Only the creator, the payer or the plan owner can delete this expense', 'EXPENSE_DELETE_FORBIDDEN');
    }
    await dl.deleteExpenseDb(conn, memoryId, expenseId);
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'expense_deleted', itemTitle: current.title });
    return ledgerResponse(conn, memoryId, userId, membership);
  });

/** Booking with price + payer → expense, split equally (all current participants by default). */
const createFromBooking = (userId, memoryId, itemId, { participants } = {}) =>
  withMember('createFromBooking', userId, memoryId, async (conn, membership) => {
    const b = await dl.findBookingForExpenseDb(conn, memoryId, itemId);
    if (!b) throw httpError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
    if (Number(b.has_expense) === 1) throw httpError(409, 'This booking is already an expense', 'EXPENSE_BOOKING_EXISTS');
    if (b.status === 'cancelled') throw httpError(409, 'Cancelled bookings cannot become expenses', 'EXPENSE_BOOKING_CANCELLED');
    if (!b.price_cents || !b.paid_by) {
      throw httpError(400, 'The booking needs a price and "paid by" first', 'EXPENSE_BOOKING_INCOMPLETE');
    }

    const all = await loadParticipants(conn, memoryId);
    const allowed = new Set(all.map(p => p.key));
    const payerKey = keyOf('user', b.paid_by);
    if (!allowed.has(payerKey)) throw httpError(400, 'The payer is no longer part of the crew', 'EXPENSE_PAYER_UNKNOWN');

    const keys = participants?.length ? participants : all.map(p => p.key);
    const amount = Number(b.price_cents);
    const shares = buildShares(amount, { mode: 'equal', participants: keys }, allowed);

    const expenseId = await dl.insertExpenseDb(conn, memoryId, userId, {
      title: b.title,
      category: BOOKING_CATEGORY[b.kind] ?? 'other',
      amount_cents: amount,
      currency: b.currency,
      paid_by_type: 'user',
      paid_by_id: b.paid_by,
      spent_on: b.start_day ?? resolveToday(null),
      split_mode: 'equal',
      source_booking_id: b.item_id,
    });
    await dl.replaceSharesDb(conn, expenseId, shares);
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'expense_added', itemId: b.item_id, itemTitle: b.title });
    return ledgerResponse(conn, memoryId, userId, membership);
  });

/** Owner only. `rates` replaces all rates; the base currency itself never has a rate. */
const setCurrency = (userId, memoryId, { baseCurrency, rates }) =>
  withMember('setCurrency', userId, memoryId, async (conn, membership) => {
    if (!membership.isCreator) {
      throw httpError(403, 'Only the plan owner can change currencies', 'CURRENCY_OWNER_ONLY');
    }
    const current = (await loadLedger(conn, memoryId)).currency;
    const base = baseCurrency ?? current.base;
    const nextRates = rates ?? current.rates;

    await dl.upsertBaseCurrencyDb(conn, memoryId, base, userId);
    await dl.replaceRatesDb(conn, memoryId, Object.entries(nextRates)
      .filter(([cur]) => cur !== base)
      .map(([currency, rate]) => ({ currency, rate })));
    await planDl.insertEventDb(conn, { memoryId, userId, action: 'currency_updated', itemTitle: base });
    return ledgerResponse(conn, memoryId, userId, membership);
  });

module.exports = { getLedger, createExpense, updateExpense, deleteExpense, createFromBooking, setCurrency };
