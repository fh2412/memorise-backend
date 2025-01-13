const express = require('express');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const router = express.Router();
const logger = require('../../middleware/logger');
const { getAllUsers, getUserById, getUserMemories, getUserCountry, searchUsers, postCreateUser, updateUser, updateUserProfilePic, deleteUser } = require('./usersService');
const { validateFirebaseUID, validateUserEmail, validateUserPassword, validateProfilePicUrl, validateUserUpdate } = require('../../middleware/validation/validateUsers');

/**
 * GET all users
 * @route GET /
 * @description returns an array of all users in the memorise database
 */
router.get('/', authenticateFirebaseToken, async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        logger.error(`Controller error; USERS GET /: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET user by id
 * @route GET /:userId
 * @description returns one User by the id given as route parameter
 */
router.get('/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await getUserById(userId);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found (/:userId)' });
        }
    } catch (error) {
        logger.error(`Controller error; USERS GET /:userId: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET users memories by id
 * @route GET /:userId/memories
 * @description returns all the memoies a user has created
 */
router.get('/:userId/memories', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    if (userId !== req.user.uid) {
        return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    try {
        const memories = await getUserMemories(userId);
        if (memories) {
            res.json(memories);
        } else {
            res.status(404).json({ message: 'No memories found for this user' });
        }
    } catch (error) {
        logger.error(`Controller error; USERS GET /:userId/memories: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET users home country
 * @route GET /country/:userId
 * @description returns the country of a user by id
 */
router.get('/country/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;
    try {
        const country = await getUserCountry(userId);
        if (country) {
            res.json(country);
        } else {
            res.status(404).json({ message: 'User not found (/:userId)' });
        }
    } catch (error) {
        logger.error(`Controller error; USERS GET /country/:userId: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET search for users
 * @route GET /search/users/:userId
 * @description returns an array of all users having a certain searchtext in their name
 */
router.get('/search/users/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    try {
        const searchTerm = req.query.term;
        const userId = req.params.userId;

        if (!searchTerm) {
            return res.status(400).json({ message: 'Search term is required' });
        }

        const results = await searchUsers(userId, searchTerm);
        res.json(results);
    } catch (error) {
        logger.error(`Controller error; USERS GET /search/users/:userId: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * POST a new user
 * @route POST /
 * @description Creates a new user in the MySQL database and associates it with a Firebase UID
 */
router.post('/', validateUserEmail, validateUserPassword, handleValidationErrors, async (req, res) => {
    const { email, displayName, password } = req.body;

    try {
        const { firebaseUid, token } = await postCreateUser(email, displayName, password);
        res.status(201).json({
            message: 'User created successfully',
            firebaseUid,
            token,
        });
    } catch (error) {
        logger.error(`Controller error; USERS POST /: ${error.message}`);

        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ message: 'Email is already in use in Firebase' });
        }

        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * PUT new userdata
 * @route PUT /:userId
 * @description Updated the data of a userprofile by id
 */
router.put('/:userId', authenticateFirebaseToken, validateFirebaseUID, validateUserUpdate, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;
    const { name, bio, dob, gender, country, username, instagram } = req.body;

    try {
        await updateUser(userId, { name, bio, dob, gender, country, username, instagram });
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        logger.error(`Controller error; USERS PUT /:userId: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * PUT a new profile picture
 * @route PUT /profilepic/:userId
 * @description Updated the string pointing to a users profile picture in firebase storage
 */
router.put('/profilepic/:userId', authenticateFirebaseToken, validateFirebaseUID, validateProfilePicUrl, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;
    const { profilepic } = req.body;

    try {
        await updateUserProfilePic(userId, profilepic);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        logger.error(`Controller error; USERS PUT /profilepic/:userId: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * DELETE a user
 * @route DELETE /:userId
 * @description deletes a user from the mysql database by id
 */
router.delete('/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        await deleteUser(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        logger.error(`Controller error; USERS DELETE /:userId: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


module.exports = router;
