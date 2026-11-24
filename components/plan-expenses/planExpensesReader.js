// Read side (no service imports) → reusable by the live endpoint and step 2 settlement.
const { groupBy } = require('../plan-shared/planDb');
const { keyOf, computeBalances } = require('./planExpensesLedger');
const dl = require('./planExpensesDatalink');

const DEFAULT_BASE = 'EUR';

/** Current participants as API objects. */
const loadParticipants = async (conn, memoryId) => {
  const { users, placeholders } = await dl.findParticipantsDb(conn, memoryId);
  const seen = new Set();
  const list = [];
  for (const u of users) {
    const key = keyOf('user', u.id);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ key, type: 'user', id: u.id, name: u.name, avatar: u.profilepic_thumb ?? null,
      isPlaceholder: false, isCreator: Number(u.is_creator) === 1, isCurrent: true });
  }
  for (const p of placeholders) {
    const key = keyOf('placeholder', String(p.id));
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ key, type: 'placeholder', id: String(p.id), name: p.name, avatar: null,
      isPlaceholder: true, isCreator: false, isCurrent: true });
  }
  return list;
};

const toApiExpense = (e, shares) => ({
  expense_id: e.expense_id,
  title: e.title,
  category: e.category,
  amount_cents: Number(e.amount_cents),
  currency: e.currency,
  paid_by: keyOf(e.paid_by_type, e.paid_by_id),
  spent_on: e.spent_on,
  split_mode: e.split_mode,
  notes: e.notes,
  source_booking_id: e.source_booking_id,
  created_by: e.created_by,
  created_at: e.created_at,
  updated_at: e.updated_at,
  shares: shares.map(s => ({ participant: keyOf(s.participant_type, s.participant_id), cents: Number(s.share_cents) })),
});

/** Base currency + rates for many memories. */
const loadCurrencies = async (conn, memoryIds) => {
  const bases = new Map((await dl.findBaseCurrenciesDb(conn, memoryIds)).map(r => [r.memory_id, r.base_currency]));
  const rates = groupBy(await dl.findRatesDb(conn, memoryIds), 'memory_id');
  return new Map(memoryIds.map(id => [id, {
    base: bases.get(id) ?? DEFAULT_BASE,
    rates: new Map((rates.get(id) ?? []).map(r => [r.currency, Number(r.rate)])),
  }]));
};

/** Full ledger of one memory (expenses, participants incl. former ones, balances). */
const loadLedger = async (conn, memoryId) => {
  const [participants, rows, currencies] = await Promise.all([
    loadParticipants(conn, memoryId),
    dl.findExpensesDb(conn, [memoryId]),
    loadCurrencies(conn, [memoryId]),
  ]);
  const shares = groupBy(await dl.findSharesDb(conn, rows.map(r => r.expense_id)), 'expense_id');
  const expenses = rows.map(r => toApiExpense(r, shares.get(r.expense_id) ?? []));

  // Users referenced by expenses who left the crew → still listed (isCurrent: false)
  const known = new Set(participants.map(p => p.key));
  const formerIds = new Set();
  for (const e of expenses) {
    for (const key of [e.paid_by, ...e.shares.map(s => s.participant)]) {
      if (!known.has(key) && key.startsWith('u:')) formerIds.add(key.slice(2));
    }
  }
  for (const u of await dl.findUserNamesDb(conn, [...formerIds])) {
    participants.push({ key: keyOf('user', u.id), type: 'user', id: u.id, name: u.name,
      avatar: u.profilepic_thumb ?? null, isPlaceholder: false, isCreator: false, isCurrent: false });
  }

  const { base, rates } = currencies.get(memoryId);
  const balances = computeBalances({ expenses: rows, shares, base, rates });
  return {
    participants,
    expenses,
    balances,
    currency: { base, rates: Object.fromEntries(rates) },
  };
};

/** Small summary for cards (live endpoint). */
const loadBalanceSummary = async (conn, memoryId, viewerKey) => {
  const rows = await dl.findExpensesDb(conn, [memoryId]);
  if (rows.length === 0) return { base: (await loadCurrencies(conn, [memoryId])).get(memoryId).base, myNet: 0, totalSpent: 0, missingRates: [], expenseCount: 0 };
  const shares = groupBy(await dl.findSharesDb(conn, rows.map(r => r.expense_id)), 'expense_id');
  const { base, rates } = (await loadCurrencies(conn, [memoryId])).get(memoryId);
  const b = computeBalances({ expenses: rows, shares, base, rates });
  return {
    base,
    myNet: b.converted ? (b.converted[viewerKey] ?? 0) : null,
    totalSpent: b.totalConverted,
    missingRates: b.missingRates,
    expenseCount: rows.length,
  };
};

module.exports = { DEFAULT_BASE, loadParticipants, loadLedger, loadBalanceSummary, toApiExpense };
