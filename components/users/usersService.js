const { fetchAllUsers, fetchUserById, fetchUserMemories, fetchUserCountry, createFirebaseUser, fetchUserStorageData, searchUsersData, generateCustomToken, saveUserInDatabase, updateUserData, updateUserProfilePicData, deleteUserData } = require('./usersDataAccess');
const logger = require('../../middleware/logger');


const getAllUsers = async () => {
    try {
        return await fetchAllUsers();
    } catch (error) {
        logger.error(`Service error; Error getAllUsers: ${error.message}`);
        throw error;
    }
};

const getUserById = async (userId) => {
    try {
        return await fetchUserById(userId);
    } catch (error) {
        logger.error(`Service error; Error getUserById: ${error.message}`);
        throw error;
    }
};

const getUserMemories = async (userId) => {
    try {
        return await fetchUserMemories(userId);
    } catch (error) {
        logger.error(`Service error; Error getUserMemories: ${error.message}`);
        throw error;
    }
};

const getUserCountry = async (userId) => {
    try {
        return await fetchUserCountry(userId);
    } catch (error) {
        logger.error(`Service error; Error getUserCountry: ${error.message}`);
        throw error;
    }
};

const getUserStorageData = async (userId) => {
    try {
        return await fetchUserStorageData(userId);
    } catch (error) {
        logger.error(`Service error; Error getUserStorageData: ${error.message}`);
        throw error;
    }
};

const searchUsers = async (userId, searchTerm) => {
    try {
        return await searchUsersData(userId, searchTerm);
    } catch (error) {
        logger.error(`Service error; Error searchUsers: ${error.message}`);
        throw error;
    }
};

const postCreateUser = async (email, displayName, password) => {
    try {
        const firebaseUser = await createFirebaseUser(email, displayName, password);
        const customToken = await generateCustomToken(firebaseUser.uid);
        await saveUserInDatabase(firebaseUser.uid, email);

        return { firebaseUid: firebaseUser.uid, token: customToken };
    } catch (error) {
        logger.error(`Service error; Error postCreateUser: ${error.message}`);
        throw error;
    }
};

const updateUser = async (userId, userDetails) => {
    try {
        await updateUserData(userId, userDetails);
    } catch (error) {
        logger.error(`Service error; Error updateUser: ${error.message}`);
        throw error;
    }
};

const updateUserProfilePic = async (userId, profilepic) => {
    try {
        await updateUserProfilePicData(userId, profilepic);
    } catch (error) {
        logger.error(`Service error; Error updateUserProfilePic: ${error.message}`);
        throw error;
    }
};

const deleteUser = async (userId) => {
    try {
        await deleteUserData(userId);
    } catch (error) {
        logger.error(`Service error; Error deleteUser: ${error.message}`);
        throw error;
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    getUserMemories,
    getUserCountry,
    searchUsers,
    postCreateUser,
    updateUser,
    updateUserProfilePic,
    deleteUser,
    getUserStorageData
};
