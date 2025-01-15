const db = require('../../config/db');
const logger = require('../../middleware/logger');

const fetchCompanyByUserIdFromDatabase = async (userId) => {
    const query = `
      SELECT companies.*
      FROM users
      JOIN companies ON users.company_id = companies.id
      WHERE users.user_id = ?`;

    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting users comapny (${query}): ${error.message}`);
        throw error;
    }
};

const insertCompanyIntoDatabase = async ({ name, phone, email, website }, userId) => {
    const query = `INSERT INTO companies (name, phone, email, website, owner_id) VALUES (?, ?, ?, ?, ?)`;

    try {
        const [result] = await db.query(query, [name, phone, email, website, userId]);
        return result.insertId;
    } catch (error) {
        logger.error(`Data Access error; Error creating new company (${query}): ${error.message}`);
        throw error;
    }
};

const linkCompanyToUser = async (companyId, userId) => {
    const query = `UPDATE users SET company_id = ? WHERE user_id = ?`

    try {
        await db.query(query, [companyId, userId]);
    } catch (error) {
        logger.error(`Data Access error; Error setting users company (${query}): ${error.message}`);
        throw error;
    }
};

const { v4: uuidv4 } = require('uuid');

const generateAndSaveCode = async (companyId) => {
    const code = uuidv4();
    const query = `INSERT INTO company_codes (code, company_id) VALUES (?, ?)`

    try {
        await db.query(query, [code, companyId]);
        return code;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            logger.error(`Duplicated Entry for company, try to regenerate!: ${error.message}`);
            return await generateAndSaveCode(companyId);
        } else {
            logger.error(`Data Access error; Error generating company code (${query}): ${error.message}`);
            throw error;
        }
    }
};

const updateCompanyInDB = async (companyId, { name, phone, email, website }) => {
    const query = 'UPDATE companies SET name = ?, phone = ?, email = ?, website = ? WHERE id = ?';

    try {
        await db.query(query, [name, phone, email, website, companyId]);
    } catch (error) {
        logger.error(`Data Access error; Error updating company (${query}): ${error.message}`);
        throw error;
    }
};


const updateUserCompanyId = async (userId, companyId) => {
    const query = `
      UPDATE users 
      SET company_id = ? 
      WHERE user_id = ?
    `;

    try {
        await db.query(query, [companyId, userId]);
    } catch (error) {
        logger.error(`Data Access error; Error updating users company (${query}): ${error.message}`);
        throw error;
    }
};

const findCompanyCode = async (code) => {
    return CompanyCode.findOne({ code });
};

const saveCompanyCode = async (companyCode) => {
    return companyCode.save();
};

const updateUserCompany = async (userId, companyId) => {
    return User.findByIdAndUpdate(userId, { companyId });
};

const deleteCompanyFromDB = async (companyId) => {
    const deleteQuery = `
      DELETE FROM companies
      WHERE id = ?
    `;

    try{
        await db.query(deleteQuery, [companyId]);
    } catch (error) {
        logger.error(`Data Access error; Error deleting company (${query}): ${error.message}`);
        throw error;
    }
};


module.exports = {
    fetchCompanyByUserIdFromDatabase,
    insertCompanyIntoDatabase,
    linkCompanyToUser,
    generateAndSaveCode,
    updateCompanyInDB,
    updateUserCompanyId,
    findCompanyCode,
    saveCompanyCode,
    updateUserCompany,
    deleteCompanyFromDB,
}