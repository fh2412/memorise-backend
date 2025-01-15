const { fetchCompanyByUserIdFromDatabase, insertCompanyIntoDatabase, linkCompanyToUser, generateAndSaveCode, updateCompanyInDB, updateUserCompanyId, findCompanyCode, saveCompanyCode, updateUserCompany, deleteCompanyFromDB } = require('./companiesDataAccess')
const logger = require('../../middleware/logger');

const getCompanyByUserId = async (userId) => {
    try {
        return await fetchCompanyByUserIdFromDatabase(userId);
    } catch (error) {
        logger.error(`Service error; Error fetchCompanyByUserIdFromDatabase: ${error.message}`);
        throw error;
    }
};

const createCompanyForUser = async (userId, companyData) => {
    try {
        const companyId = await insertCompanyIntoDatabase(companyData, userId);
        await linkCompanyToUser(companyId, userId);
    } catch (error) {
        logger.error(`Service error; Error createCompanyForUser: ${error.message}`);
        throw error;
    }
};

const generateUniqueCompanyCode = async (companyId) => {
    try {
        return await generateAndSaveCode(companyId);
    } catch (error) {
        logger.error(`Service error; Error generateUniqueCompanyCode: ${error.message}`);
        throw error;
    }
};

const updateCompanyDetails = async (companyId, companyData) => {
    try {
        const result = await updateCompanyInDB(companyId, companyData);
        if (result.affectedRows === 0) {
            return null;
        }
        return { id: companyId, ...companyData };
    } catch (error) {
        logger.error(`Service error; Error updateCompanyDetails: ${error.message}`);
        throw error;
    }
};

const leaveCompany = async (userId) => {
    try {
        const result = await updateUserCompanyId(userId, null);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Service error; Error leaveCompany: ${error.message}`);
        throw error;
    }
};

const setCompanyOwner = async (userId, companyId) => {
    try {
        const result = await updateUserCompanyId(userId, companyId);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Service error; Error setCompanyOwner: ${error.message}`);
        throw error;
    }
};

const joinCompanyService = async (userId, code) => {
    try {
        const companyCode = await findCompanyCode(code);
        if (!companyCode) {
            return { success: false, status: 404, error: 'Invalid code' };
        }

        if (companyCode.isUsed) {
            return { success: false, status: 400, error: 'Code already used' };
        }

        companyCode.isUsed = true;
        await saveCompanyCode(companyCode);

        const user = await updateUserCompany(userId, companyCode.companyId);
        if (!user) {
            return { success: false, status: 404, error: 'User not found' };
        }

        return { success: true };
    } catch (error) {
        logger.error(`Service error; Error joinCompanyService: ${error.message}`);
        throw error;
    }
};

const deleteCompanyService = async (companyId) => {
    try {
        const result = await deleteCompanyFromDB(companyId);
        if (result.affectedRows === 0) {
            return { success: false, status: 404, error: 'Company not found' };
        }
        return { success: true };
    } catch (error) {
        logger.error(`Service error; Error deleteCompanyService: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getCompanyByUserId,
    createCompanyForUser,
    generateUniqueCompanyCode,
    updateCompanyDetails,
    leaveCompany,
    setCompanyOwner,
    joinCompanyService,
    deleteCompanyService,
}