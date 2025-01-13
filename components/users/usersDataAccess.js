const db = require('../../config/db');
const logger = require('../../middleware/logger');
const admin = require('firebase-admin');


const fetchAllUsers = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error selecting all users (SELECT * FROM users): ${error.message}`);
        throw error;
    }
};

const fetchUserById = async (userId) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting user by id (SELECT * FROM users WHERE user_id = ?): ${error.message}`);
        throw error;
    }
};

const fetchUserMemories = async (userId) => {
    try {
        const [rows] = await db.query(`
        SELECT m.* 
        FROM memories m 
        INNER JOIN user_has_memory um ON m.memory_id = um.memory_id
        WHERE um.user_id = ?`,
            [userId]
        );
        return rows.length > 0 ? rows : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting users memories ( SELECT m.* FROM memories & user_has_memories WHERE um.user_id = ?): ${error.message}`);
        throw error;
    }
};

const fetchUserCountry = async (userId) => {
    try {
        const [rows] = await db.query('SELECT country FROM users WHERE user_id = ?', [userId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting users country (SELECT country FROM users WHERE user_id = ?): ${error.message}`);
        throw error;
    }
};

const searchUsersData = async (userId, searchTerm) => {
    const escapedTerm = `%${searchTerm.replace(/[\\%_\&,\/;'\*!()+=\${}:'<@\]^~|#?]/g, '\\$&')}%`;

    const query = `
      SELECT u.email, u.username, u.name, u.user_id, u.dob
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
        logger.error(`Data Access error; Error searching for searchterm ${escapedTerm} in users: ${error.message}` );
        throw error;
    }
};

const createFirebaseUser = async (email, displayName, password) => {
    return await admin.auth().createUser({
        email,
        displayName,
        password,
    });
};

const generateCustomToken = async (uid) => {
    return await admin.auth().createCustomToken(uid);
};

const saveUserInDatabase = async (uid, email) => {
    try {
        await db.query('INSERT INTO users (user_id, email) VALUES (?, ?)', [uid, email]);
    } catch (error) {
        logger.error(`Data Access error; Error creating users (INSERT INTO users (user_id, email) VALUES (?, ?)): ${error.message}` );
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
        logger.error(`Data Access error; Error updating user (UPDATE users SET name = ?, ...): ${error.message}` );
        throw error;
    }
};

const updateUserProfilePicData = async (userId, profilepic) => {
    const query = `UPDATE users SET profilepic = ? WHERE user_id = ?`;

    try {
        await db.query(query, [profilepic, userId]);
    } catch (error) {
        logger.error(`Data Access error; Error updating users profile pic (UPDATE users SET profilepic = ? WHERE user_id = ?): ${error.message}` );
        throw error;
    }
};

const deleteUserData = async (userId) => {
    const query = 'DELETE FROM users WHERE user_id = ?';

    try {
        await db.query(query, [userId]);
    } catch (error) {
        logger.error(`Data Access error; Error deleting user (DELETE FROM users WHERE user_id = ?): ${error.message}` );
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
