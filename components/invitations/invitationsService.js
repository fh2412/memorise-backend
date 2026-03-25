const { getValidInviteByMemoryId, createInvite, getMemoryTitleByInviteToken, getValidInviteWithMemory, addUserToMemory, incrementInviteUsage } = require('./invitationsDataAccess');
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

const getMemoryNameByToken = async (token) =>{
    const existingInvite = await getMemoryTitleByInviteToken(token);

        if (existingInvite) {
            return existingInvite.title;
        }
};

const joinMemoryByInvite = async (userId, token) => {

    // 1. Validate invite
    const invite = await getValidInviteWithMemory(token);

    if (!invite) {
        throw new Error('Invalid or expired invite link');
    }

    const memoryId = invite.memory_id;

    try {
        // 2. Add user to memory
        await addUserToMemory(userId, memoryId, 'link');

    } catch (error) {
        // Duplicate entry → user already joined
        if (error.code === 'ER_DUP_ENTRY') {
            return { message: 'User already part of this memory' };
        }
        throw error;
    }

    // 3. Increment usage
    await incrementInviteUsage(invite.invite_id);

    return { message: 'Successfully joined memory' };
};

module.exports = {
    getOrCreateInviteLink,
    getMemoryNameByToken,
    joinMemoryByInvite
}