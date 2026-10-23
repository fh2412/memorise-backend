// Storage limits per account type – single source of truth for the backend.
// Must match the frontend BillingService (FREE 5 GB, PRO 50 GB, UNLIMITED).
//
// ADJUST: the keys must match the values stored in your users table
// (e.g. 'FREE' vs 'free' vs 0/1/2).

const GiB = 1024 ** 3;

const STORAGE_LIMITS = {
  FREE: 5 * GiB,
  PRO: 50 * GiB,
  UNLIMITED: Infinity,
};

const getStorageLimitBytes = (accountType) => {
  const key = String(accountType ?? 'FREE').toUpperCase();
  return STORAGE_LIMITS[key] ?? STORAGE_LIMITS.FREE;
};

module.exports = { getStorageLimitBytes, STORAGE_LIMITS };
