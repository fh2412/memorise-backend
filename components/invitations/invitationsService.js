const { getValidInviteByMemoryId, createInvite } = require('./invitationsDataAccess');
const logger = require('../../middleware/logger');
const crypto = require('crypto');

const getOrCreateInviteLink = async (memoryId) => {

    try {
        // 1. Check for existing valid invite
        const existingInvite = await getValidInviteByMemoryId(memoryId);

        if (existingInvite) {
            return existingInvite.invite_token;
        }

        // 2. Create new invite
        const token = crypto.randomBytes(32).toString('hex');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // +7 days

        const newInvite = {
            memory_id: memoryId,
            invite_token: token,
            expires_at: expiresAt,
            max_uses: null,
            created_by: null // optionally pass user later
        };

        await createInvite(newInvite);

        return token;
    } catch (error) {
        logger.error(`Service error; Error in getOrCreateInviteLink: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getOrCreateInviteLink
}