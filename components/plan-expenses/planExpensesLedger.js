// Pure money logic (no DB). Integer cents everywhere; step 2 builds the settlement on top.

/** Participant keys used by the API: "u:<userId>" or "p:<placeholderId>". */
const keyOf = (type, id) => `${type === 'placeholder' ? 'p' : 'u'}:${id}`;

const parseKey = (key) => {
  const m = typeof key === 'string' ? /^(u|p):(.{1,128})$/.exec(key) : null;
  return m ? { type: m[1] === 'p' ? 'placeholder' : 'user', id: m[2] } : null;
};

/** Equal split; leftover cents go to the first keys (sorted → deterministic). */
const splitEqually = (amountCents, keys) => {
  const sorted = [...new Set(keys)].sort();
  const n = sorted.length;
  const base = Math.floor(amountCents / n);
  const rest = amountCents - base * n;
  return sorted.map((key, i) => ({ key, cents: base + (i < rest ? 1 : 0) }));
};

/**
 * Net balance per participant (paid − owed), per currency and – if all rates are
 * known – converted to the base currency. Positive = gets money back.
 *
 * expenses:  [{ expense_id, amount_cents, currency, paid_by_type, paid_by_id }]
 * shares:    Map<expense_id, [{ participant_type, participant_id, share_cents }]>
 * rates:     Map<currency, number>  (1 unit = rate × base)
 */
const computeBalances = ({ expenses, shares, base, rates }) => {
  const byCurrency = new Map();
  const totals = new Map();
  const add = (cur, key, delta) => {
    if (!byCurrency.has(cur)) byCurrency.set(cur, new Map());
    const m = byCurrency.get(cur);
    m.set(key, (m.get(key) ?? 0) + delta);
  };

  for (const e of expenses) {
    const amount = Number(e.amount_cents);
    add(e.currency, keyOf(e.paid_by_type, e.paid_by_id), amount);
    totals.set(e.currency, (totals.get(e.currency) ?? 0) + amount);
    for (const s of shares.get(e.expense_id) ?? []) {
      add(e.currency, keyOf(s.participant_type, s.participant_id), -Number(s.share_cents));
    }
  }

  const rateOf = (cur) => (cur === base ? 1 : rates.get(cur));
  const used = [...byCurrency.keys()];
  const missingRates = used.filter(cur => rateOf(cur) == null);

  let converted = null;
  let totalConverted = null;
  if (missingRates.length === 0) {
    const sum = new Map();
    for (const [cur, m] of byCurrency) {
      for (const [key, net] of m) sum.set(key, (sum.get(key) ?? 0) + net * rateOf(cur));
    }
    converted = Object.fromEntries([...sum].map(([k, v]) => [k, Math.round(v)]));
    totalConverted = Math.round([...totals].reduce((acc, [cur, t]) => acc + t * rateOf(cur), 0));
  }

  return {
    base,
    byCurrency: Object.fromEntries([...byCurrency].map(([cur, m]) => [cur, Object.fromEntries(m)])),
    converted,          // { key: cents in base } | null if a rate is missing
    missingRates,       // currencies without a rate
    totals: Object.fromEntries(totals),
    totalConverted,
  };
};

module.exports = { keyOf, parseKey, splitEqually, computeBalances };
