const { updateUserStorageTakenDb } = require('./billingDataAccess')
const logger = require('../../middleware/logger');

const updateUserStorageTakenService = async (userId, changed_space) => {
    try {
        logger.warn(changed_space);
        await updateUserStorageTakenDb(userId, changed_space);
    } catch (error) {
        logger.error(`Service error; Error updateUserStorageTakenService: ${error.message}`);
        throw error;
    }
};

module.exports = {
    updateUserStorageTakenService
}