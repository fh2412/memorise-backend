const db = require('../../config/db');
const logger = require('../../middleware/logger');
const { getFirebaseAdmin } = require('../../config/firebaseAdmin');


const fetchAllUsers = async () => {
    const query = `SELECT * FROM users`;
    
    try {
        const [rows] = await db.query(query);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error selecting all users (${query}): ${error.message}`);
        throw error;
    }
};

const fetchUserById = async (userId) => {
    const query = `SELECT * FROM users WHERE user_id = ?`;
    
    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting user by id (${query}): ${error.message}`);
        throw error;
    }
};

const fetchUserMemories = async (userId) => {
    const query = `
        SELECT m.* 
        FROM memories m 
        INNER JOIN user_has_memory um ON m.memory_id = um.memory_id
        WHERE um.user_id = ?`

    try {
        const [rows] = await db.query(query,[userId]);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting users memories (${query}): ${error.message}`);
        throw error;
    }
};

const fetchUserCountry = async (userId) => {
    const query = `SELECT country FROM users WHERE user_id = ?`

    try {
        const [rows] = await db.query(query, [userId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting users country (${query}): ${error.message}`);
        throw error;
    }
};

const searchUsersData = async (userId, searchTerm) => {
    const escapedTerm = `%${searchTerm.replace(/[\\%_&,/;'*!()+=${}:'<@\]^~|#?]/g, '\\$&')}%`;

    const query = `
      SELECT u.email, u.username, u.name, u.user_id, u.dob, u.profilepic
      FROM users u
      WHERE u.user_id <> ?
      AND u.user_id NOT IN (
        SELECT user_id1 FROM friendships WHERE user_id2 = ?
        UNION ALL
        SELECT user_id2 FROM friendships WHERE user_id1 = ?
      )
      AND (
        u.email LIKE ? OR u.username LIKE ? OR u.name LIKE ?
      )
      LIMIT 5;
    `;

    try {
        const [results] = await db.query(query, [userId, userId, userId, escapedTerm, escapedTerm, escapedTerm]);
        return results;
    } catch (error) {
        logger.error(`Data Access error; Error searching for searchterm ${escapedTerm} in users: ${error.message}`);
        throw error;
    }
};

const createFirebaseUser = async (email, displayName, password) => {
    const admin = getFirebaseAdmin();
    logger.info(email);
    return await admin.auth().createUser({
        email,
        displayName,
        password,
    });
};

const generateCustomToken = async (uid) => {
    const admin = getFirebaseAdmin();
    return await admin.auth().createCustomToken(uid);
};

const saveUserInDatabase = async (uid, email) => {
    const query = `INSERT INTO users (user_id, email) VALUES (?, ?)`;

    try {
        await db.query(query, [uid, email]);
    } catch (error) {
        logger.error(`Data Access error; Error creating users (${query}): ${error.message}`);
        throw error;
    }
};

const updateUserData = async (userId, { name, bio, dob, gender, country, username, instagram }) => {
    const query = `
      UPDATE users 
      SET name = ?, bio = ?, dob = ?, gender = ?, country = ?, username = ?, instagram = ?
      WHERE user_id = ?
    `;

    try {
        await db.query(query, [name, bio, dob, gender, country, username, instagram, userId]);
    } catch (error) {
        logger.error(`Data Access error; Error updating user (${query}): ${error.message}`);
        throw error;
    }
};

const updateUserProfilePicData = async (userId, profilepic) => {
    const query = `UPDATE users SET profilepic = ? WHERE user_id = ?`;

    try {
        await db.query(query, [profilepic, userId]);
    } catch (error) {
        logger.error(`Data Access error; Error updating users profile pic (${query}): ${error.message}`);
        throw error;
    }
};

const deleteUserData = async (userId) => {
    const query = 'DELETE FROM users WHERE user_id = ?';

    try {
        await db.query(query, [userId]);
    } catch (error) {
        logger.error(`Data Access error; Error deleting user (${query}): ${error.message}`);
        throw error;
    }
};


module.exports = {
    fetchAllUsers,
    fetchUserById,
    fetchUserMemories,
    fetchUserCountry,
    searchUsersData,
    createFirebaseUser,
    generateCustomToken,
    saveUserInDatabase,
    updateUserData,
    updateUserProfilePicData,
    deleteUserData,
};
