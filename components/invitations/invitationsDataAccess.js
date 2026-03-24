const db = require('../../config/db');
const logger = require('../../middleware/logger');

const getValidInviteByMemoryId = async (memoryId) => {
    const query = `
        SELECT *
        FROM memory_invites
        WHERE memory_id = ?
          AND is_active = TRUE
          AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1
    `;

    try {
        const [rows] = await db.query(query, [memoryId]);
        return rows[0] || null;
    } catch (error) {
        logger.error(`Data Access error; Error in getValidInviteByMemoryId: ${error.message}`);
        throw error;
    }
};

const createInvite = async (invite) => {
    const query = `
        INSERT INTO memory_invites (
            memory_id,
            invite_token,
            created_by,
            expires_at,
            max_uses
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        await db.query(
            query,
            [
                invite.memory_id,
                invite.invite_token,
                invite.created_by,
                invite.expires_at,
                invite.max_uses
            ]);
    } catch (error) {
        logger.error(`Data Access error; Error in createInvite: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getValidInviteByMemoryId,
    createInvite
}