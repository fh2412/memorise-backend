const db = require('../../config/db');
const logger = require('../middleware/logger');

const DEFAULT_NAME = 'Memorise User';
const MAX_NAME_LENGTH = 100;
const PLACEHOLDER_NAMES = new Set(['', 'N A', DEFAULT_NAME]);
const APPLE_RELAY_DOMAIN = '@privaterelay.appleid.com';

const mapUser = (row) => ({ id: row.user_id, email: row.email, name: row.name });

/** Picks a sensible display name: explicit input > email local part > default. */
const resolveDisplayName = (displayName, email) => {
    const input = typeof displayName === 'string' ? displayName.trim() : '';
    if (input) return input.slice(0, MAX_NAME_LENGTH);

    // Apple "Hide my email" addresses have random local parts – don't use them as a name
    if (typeof email === 'string' && email && !email.toLowerCase().endsWith(APPLE_RELAY_DOMAIN)) {
        const localPart = email.split('@')[0].trim();
        if (localPart) return localPart.slice(0, MAX_NAME_LENGTH);
    }
    return DEFAULT_NAME;
};

const findUserById = async (uid) => {
    const [rows] = await db.query('SELECT user_id, email, name FROM users WHERE user_id = ? LIMIT 1', [uid]);
    return rows[0] ? mapUser(rows[0]) : null;
};

/**
 * Idempotent: creates the MySQL user for a verified Firebase identity if missing,
 * otherwise keeps email in sync and fills a placeholder name.
 * Works for email/password, Google and Apple identically.
 * @returns {{ isNewUser: boolean, user: { id: string, email: string|null, name: string } }}
 */
const syncCurrentUser = async ({ uid, email, displayName }) => {
    const existing = await findUserById(uid);

    if (existing) {
        const user = { ...existing };

        if (email && email !== existing.email) {
            try {
                await db.query('UPDATE users SET email = ? WHERE user_id = ?', [email, uid]);
                user.email = email;
            } catch (error) {
                // Never block sign-in because of an email sync conflict
                logger.warn(`syncCurrentUser: email update failed for uid ${uid}: ${error.code || error.message}`);
            }
        }

        if (PLACEHOLDER_NAMES.has(existing.name ?? '') && typeof displayName === 'string' && displayName.trim()) {
            const name = resolveDisplayName(displayName, email);
            await db.query('UPDATE users SET name = ? WHERE user_id = ?', [name, uid]);
            user.name = name;
        }

        return { isNewUser: false, user };
    }

    const name = resolveDisplayName(displayName, email);
    try {
        await db.query('INSERT INTO users (user_id, email, name) VALUES (?, ?, ?)', [uid, email, name]);
        return { isNewUser: true, user: { id: uid, email, name } };
    } catch (error) {
        // Race condition: two parallel sync calls for the same uid
        if (error.code === 'ER_DUP_ENTRY') {
            const user = await findUserById(uid);
            if (user) return { isNewUser: false, user };
        }
        logger.error(`Data Access error; syncCurrentUser insert failed for uid ${uid}: ${error.message}`);
        throw error;
    }
};

module.exports = { syncCurrentUser };
