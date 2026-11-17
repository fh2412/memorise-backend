const { run, inList } = require('../plan-shared/planDb');

const EXPENSE_COLUMNS = `
  e.expense_id, e.memory_id, e.title, e.category, e.amount_cents, e.currency,
  e.paid_by_type, e.paid_by_id, DATE_FORMAT(e.spent_on, '%Y-%m-%d') AS spent_on,
  e.split_mode, e.notes, e.source_booking_id, e.created_by, e.created_at, e.updated_at`;

// ---------- participants ----------

/** Current crew incl. placeholders. Separate queries avoid UNION collation clashes. */
const findParticipantsDb = async (conn, memoryId) => {
  const users = await run(conn, `
    SELECT u.user_id AS id, u.name, u.profilepic_thumb, 1 AS is_creator
    FROM memories m JOIN users u ON u.user_id = m.user_id
    WHERE m.memory_id = ?
    UNION ALL
    SELECT u.user_id, u.name, u.profilepic_thumb, 0
    FROM user_has_memory uhm JOIN users u ON u.user_id = uhm.user_id
    WHERE uhm.memory_id = ? AND uhm.status = 'friend'
  `, [memoryId, memoryId]);
  const placeholders = await run(conn, `
    SELECT p.id, p.name
    FROM placeholder_has_memory phm JOIN placeholders p ON p.id = phm.placeholder_id
    WHERE phm.memory_id = ?
  `, [memoryId]);
  return { users, placeholders };
};

/** Names for users that left the crew but still appear in expenses. */
const findUserNamesDb = async (conn, userIds) => {
  if (userIds.length === 0) return [];
  return run(conn, `SELECT user_id AS id, name, profilepic_thumb FROM users WHERE user_id IN (${inList(userIds)})`, userIds);
};

// ---------- expenses ----------

const findExpensesDb = async (conn, memoryIds) => {
  if (memoryIds.length === 0) return [];
  return run(conn, `
    SELECT ${EXPENSE_COLUMNS} FROM plan_expenses e
    WHERE e.memory_id IN (${inList(memoryIds)})
    ORDER BY e.spent_on DESC, e.expense_id DESC
  `, memoryIds);
};

const findExpenseForUpdateDb = async (conn, memoryId, expenseId) => {
  const rows = await run(conn, `
    SELECT ${EXPENSE_COLUMNS} FROM plan_expenses e
    WHERE e.expense_id = ? AND e.memory_id = ?
    FOR UPDATE
  `, [expenseId, memoryId]);
  return rows[0] ?? null;
};

const findSharesDb = async (conn, expenseIds) => {
  if (expenseIds.length === 0) return [];
  return run(conn, `
    SELECT expense_id, participant_type, participant_id, share_cents
    FROM plan_expense_shares WHERE expense_id IN (${inList(expenseIds)})
  `, expenseIds);
};

const insertExpenseDb = async (conn, memoryId, userId, e) => {
  const result = await run(conn, `
    INSERT INTO plan_expenses
      (memory_id, title, category, amount_cents, currency, paid_by_type, paid_by_id,
       spent_on, split_mode, notes, source_booking_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [memoryId, e.title, e.category, e.amount_cents, e.currency, e.paid_by_type, e.paid_by_id,
      e.spent_on, e.split_mode, e.notes ?? null, e.source_booking_id ?? null, userId]);
  return result.insertId;
};

const updateExpenseDb = (conn, memoryId, expenseId, e) => run(conn, `
  UPDATE plan_expenses
  SET title = ?, category = ?, amount_cents = ?, currency = ?, paid_by_type = ?, paid_by_id = ?,
      spent_on = ?, split_mode = ?, notes = ?
  WHERE expense_id = ? AND memory_id = ?
`, [e.title, e.category, e.amount_cents, e.currency, e.paid_by_type, e.paid_by_id,
    e.spent_on, e.split_mode, e.notes ?? null, expenseId, memoryId]);

/** shares: [{ type, id, cents }] */
const replaceSharesDb = async (conn, expenseId, shares) => {
  await run(conn, 'DELETE FROM plan_expense_shares WHERE expense_id = ?', [expenseId]);
  if (shares.length === 0) return;
  await run(conn, `
    INSERT INTO plan_expense_shares (expense_id, participant_type, participant_id, share_cents)
    VALUES ${shares.map(() => '(?, ?, ?, ?)').join(', ')}
  `, shares.flatMap(s => [expenseId, s.type, s.id, s.cents]));
};

const deleteExpenseDb = (conn, memoryId, expenseId) => run(conn,
  'DELETE FROM plan_expenses WHERE expense_id = ? AND memory_id = ?', [expenseId, memoryId]);

// ---------- currency ----------

const findBaseCurrenciesDb = async (conn, memoryIds) => {
  if (memoryIds.length === 0) return [];
  return run(conn, `SELECT memory_id, base_currency FROM plan_currency WHERE memory_id IN (${inList(memoryIds)})`, memoryIds);
};

const findRatesDb = async (conn, memoryIds) => {
  if (memoryIds.length === 0) return [];
  return run(conn, `SELECT memory_id, currency, rate FROM plan_currency_rates WHERE memory_id IN (${inList(memoryIds)})`, memoryIds);
};

const upsertBaseCurrencyDb = (conn, memoryId, base, userId) => run(conn, `
  INSERT INTO plan_currency (memory_id, base_currency, updated_by) VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE base_currency = VALUES(base_currency), updated_by = VALUES(updated_by)
`, [memoryId, base, userId]);

/** rates: [{ currency, rate }] – replaces all rates of the memory. */
const replaceRatesDb = async (conn, memoryId, rates) => {
  await run(conn, 'DELETE FROM plan_currency_rates WHERE memory_id = ?', [memoryId]);
  if (rates.length === 0) return;
  await run(conn, `
    INSERT INTO plan_currency_rates (memory_id, currency, rate) VALUES ${rates.map(() => '(?, ?, ?)').join(', ')}
  `, rates.flatMap(r => [memoryId, r.currency, r.rate]));
};

// ---------- bookings → expenses ----------

const BOOKING_FOR_EXPENSE = `
  i.item_id, i.title, b.kind, b.price_cents, b.currency, b.paid_by, b.status,
  DATE_FORMAT(b.starts_at, '%Y-%m-%d') AS start_day`;

/** Bookings with price + payer, not cancelled, not yet turned into an expense. */
const findBookingSuggestionsDb = (conn, memoryId) => run(conn, `
  SELECT ${BOOKING_FOR_EXPENSE}
  FROM plan_items i
  JOIN plan_bookings b ON b.item_id = i.item_id
  WHERE i.memory_id = ? AND i.status <> 'dismissed' AND b.status <> 'cancelled'
    AND b.price_cents IS NOT NULL AND b.price_cents > 0 AND b.paid_by IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM plan_expenses e WHERE e.source_booking_id = i.item_id)
  ORDER BY b.starts_at, i.item_id
`, [memoryId]);

const findBookingForExpenseDb = async (conn, memoryId, itemId) => {
  const rows = await run(conn, `
    SELECT ${BOOKING_FOR_EXPENSE},
      EXISTS (SELECT 1 FROM plan_expenses e WHERE e.source_booking_id = i.item_id) AS has_expense
    FROM plan_items i
    JOIN plan_bookings b ON b.item_id = i.item_id
    WHERE i.item_id = ? AND i.memory_id = ?
    FOR UPDATE
  `, [itemId, memoryId]);
  return rows[0] ?? null;
};

module.exports = {
  findParticipantsDb, findUserNamesDb,
  findExpensesDb, findExpenseForUpdateDb, findSharesDb,
  insertExpenseDb, updateExpenseDb, replaceSharesDb, deleteExpenseDb,
  findBaseCurrenciesDb, findRatesDb, upsertBaseCurrencyDb, replaceRatesDb,
  findBookingSuggestionsDb, findBookingForExpenseDb,
};
