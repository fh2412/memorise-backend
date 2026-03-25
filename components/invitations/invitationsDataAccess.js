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

const getMemoryTitleByInviteToken = async (inviteToken) => {
    const query = `
        SELECT m.title
        FROM memory_invites mi
        JOIN memories m ON mi.memory_id = m.memory_id
        WHERE mi.invite_token = ?
          AND mi.is_active = TRUE
          AND (mi.expires_at IS NULL OR mi.expires_at > NOW())
        LIMIT 1
    `;

    const [rows] = await db.execute(query, [inviteToken]);

    return rows[0] || null;
};


const getValidInviteWithMemory = async (token) => {
    const query = `
        SELECT *
        FROM memory_invites
        WHERE invite_token = ?
          AND is_active = TRUE
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (max_uses IS NULL OR current_uses < max_uses)
        LIMIT 1
    `;

    const [rows] = await db.execute(query, [token]);
    return rows[0] || null;
};


const addUserToMemory = async (userId, memoryId, status) => {
    const query = `
        INSERT INTO user_has_memory (user_id, memory_id, status)
        VALUES (?, ?, ?)
    `;

    await db.execute(query, [userId, memoryId, status]);
};


const incrementInviteUsage = async (inviteId) => {
    const query = `
        UPDATE memory_invites
        SET current_uses = current_uses + 1
        WHERE invite_id = ?
    `;

    await db.execute(query, [inviteId]);
};

module.exports = {
    getValidInviteByMemoryId,
    createInvite,
    getMemoryTitleByInviteToken,
    getValidInviteWithMemory,
    addUserToMemory,
    incrementInviteUsage
}