const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateMemoryId, validateCreateMemory, validateAddFriendsToMemory, validateUpdateMemory, validateUpdatePictureCount, validateUpdateMemoryLocation, validateUpdateTitlePic } = require('../../middleware/validation/validateMemory');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getUsersForMemory,
    getCreatedMemories,
    getAddedMemories,
    getAllMemories,
    getMemoryById,
    getMemoryFriends,
    getFriendsWithSharedCount,
    createMemory,
    addFriendsToMemory,
    updateMemory,
    updateMemoryPictureCount,
    updateMemoryLocation,
    updateTitlePic,
    deleteMemoryAndFriends,
    removeFriendFromMemory } = require('./memoriesService');

/**
 * GET users associated with a memory
 * @route GET /:memoryId/users
 * @description Get the users associated with a given memory
 */
/* UNUSED!
router.get('/:memoryId/users', authenticateFirebaseToken, validateMemoryId, handleValidationErrors, async (req, res) => {
    const memoryId = req.params.memoryId;

    try {
        const users = await getUsersForMemory(memoryId);
        if (users.length > 0) {
            res.json(users);
        } else {
            res.status(404).json({ message: 'Memory not found' });
        }
    } catch (error) {
        logger.error(`Controller error; USERS GET /:memoryId/users ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});
*/

/**
 * GET created memories for a user
 * @route GET /createdMemories/:userId
 * @description Get all memories created by a user with location data
 */
router.get('/createdMemories/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const memories = await getCreatedMemories(userId);
        if (memories.length > 0) {
            res.json(memories);
        } else {
            res.status(200).json({ message: 'You haven\'t created any memories yet!' });
        }
    } catch (error) {
        logger.error(`Controller error; CREATED MEMORIES GET /createdMemories/:userId ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET added memories for a user
 * @route GET /getAddedMemories/:userId
 * @description Get all memories that the user has added with location data
 */
router.get('/getAddedMemories/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const memories = await getAddedMemories(userId);
        if (memories.length > 0) {
            res.json(memories);
        } else {
            res.status(200).json({ message: 'User has not added any memories yet' });
        }
    } catch (error) {
        logger.error(`Controller error; ADDED MEMORIES GET /getAddedMemories/:userId ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET all memories for a user (both created and added)
 * @route GET /allMemories/:userId
 * @description Get all memories created and added by the user, with memoryId and title
 */
router.get('/allMemories/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;

    try {
        const memories = await getAllMemories(userId);
        if (memories.length > 0) {
            res.json(memories);
        } else {
            res.status(200).json({ message: 'No memories found for this user.' });
        }
    } catch (error) {
        logger.error(`Controller error; ALL MEMORIES GET /allMemories/:userId ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET details of a specific memory by memoryId
 * @route GET /:memoryId
 * @description Get details of a memory by its ID
 */
router.get('/:memoryId', authenticateFirebaseToken, validateMemoryId, handleValidationErrors, async (req, res) => {
    const memoryId = req.params.memoryId;

    try {
        const memory = await getMemoryById(memoryId);
        if (memory) {
            res.json(memory);
        } else {
            res.status(404).json({ message: 'Memory not found' });
        }
    } catch (error) {
        logger.error(`Controller error; MEMORY GET /:memoryId ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET friends who are part of a memory
 * @route GET /:memoryId/:userId/friends
 * @description Get all users (friends) added to a specific memory excluding the requesting user
 */
router.get('/:memoryId/:userId/friends', authenticateFirebaseToken, validateMemoryId, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const memoryId = req.params.memoryId;
    const userId = req.params.userId;

    try {
        const friends = await getMemoryFriends(memoryId, userId);
        if (friends.length > 0) {
            res.json(friends);
        } else {
            res.json({ message: 'No friends added to the Memory' });
        }
    } catch (error) {
        logger.error(`Controller error; MEMORY GET /:memoryId/:userId/friends ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * GET friends with shared memory count for a specific memory
 * @route GET /:memoryId/:userId/friends-with-shared-count
 * @description Get all friends with their shared memory count for a specific memory
 */
router.get('/:memoryId/:userId/friends-with-shared-count', authenticateFirebaseToken, validateMemoryId, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const { memoryId, userId } = req.params;

    try {
        const friendsWithSharedCount = await getFriendsWithSharedCount(memoryId, userId);
        res.json(friendsWithSharedCount);
    } catch (error) {
        console.error('Controller error; GET /:memoryId/:userId/friends-with-shared-count', error.message);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

/**
 * POST Create a new memory
 * @route POST /createMemory
 * @description Create a new memory and store it in the database
 */
router.post('/createMemory', authenticateFirebaseToken, validateCreateMemory, handleValidationErrors, async (req, res) => {
    const { creator_id, title, description, firestore_bucket_url, location_id, memory_date, memory_end_date, title_pic, activity_id } = req.body;

    try {
        const memoryId = await createMemory({
            creator_id, title, description, firestore_bucket_url, location_id, memory_date, memory_end_date, title_pic, activity_id
        });
        res.json({ message: 'Memory created successfully', memoryId });
    } catch (error) {
        logger.error(`Controller error; CREATE MEMORY POST /createMemory ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST Add friends to a memory
 * @route POST /addFriendsToMemory
 * @description Add friends to a memory by their emails
 */
router.post('/addFriendsToMemory', authenticateFirebaseToken, validateAddFriendsToMemory, handleValidationErrors, async (req, res) => {
    const { emails, memoryId } = req.body;

    try {
        await addFriendsToMemory(emails, memoryId);
        res.json({ success: true });
    } catch (error) {
        logger.error(`Controller error; ADD FRIENDS POST /addFriendsToMemory ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * PUT Update a memory
 * @route PUT /:memoryId
 * @description Update memory details for a specific memory
 */
router.put('/:memoryId', authenticateFirebaseToken, validateUpdateMemory, handleValidationErrors, async (req, res) => {
    const memoryId = req.params.memoryId;
    const { title, description, memory_date, memory_end_date } = req.body;

    try {
        const updateResult = await updateMemory(memoryId, { title, description, memory_date, memory_end_date });

        if (updateResult) {
            res.json({ message: 'Memory updated successfully' });
        } else {
            res.status(404).json({ error: 'Memory not found or no changes made' });
        }
    } catch (error) {
        logger.error(`Controller error; UPDATE PUT /:memoryId ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * PUT Update the picture count for a memory
 * @route PUT /picturecount/:memoryId
 * @description Update the picture count for a specific memory
 */
router.put('/picturecount/:memoryId', authenticateFirebaseToken, validateUpdatePictureCount, handleValidationErrors, async (req, res) => {
    const memoryId = req.params.memoryId;
    const pictureCount = req.body.picture_count;

    try {
        const updateResult = await updateMemoryPictureCount(memoryId, pictureCount);

        if (updateResult) {
            res.json({ message: 'Memory updated successfully' });
        } else {
            res.status(404).json({ error: 'Memory not found or no changes made' });
        }
    } catch (error) {
        logger.error(`Controller error; UPDATE PUT /picturecount/:memoryId ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Update the location of a memory
 * @route PUT /updateMemoryLocation/:memoryId
 * @description Update the location ID for a specific memory
 */
router.put('/updateMemoryLocation/:memoryId', authenticateFirebaseToken, validateUpdateMemoryLocation, handleValidationErrors, async (req, res) => {
    const memoryId = req.params.memoryId;
    const locationId = req.body.locationId;

    try {
        const updateResult = await updateMemoryLocation(memoryId, locationId);

        if (updateResult) {
            res.json({ message: 'Memory updated successfully' });
        } else {
            res.status(404).json({ error: 'Memory not found or no changes made' });
        }
    } catch (error) {
        logger.error(`Controller error; UPDATE PUT /updateMemoryLocation/:memoryId ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Update the title picture of a memory
 * @route PUT /updateTitlePic/:imageId
 * @description Update the title picture for a specific memory
 */
router.put('/updateTitlePic/:imageId', authenticateFirebaseToken, validateUpdateTitlePic, handleValidationErrors, async (req, res) => {
    const imageId = req.params.imageId;
    const imageUrl = req.body.imageUrl;

    try {
        const updateResult = await updateTitlePic(imageId, imageUrl);

        if (updateResult) {
            res.json({ message: 'Memory updated successfully' });
        } else {
            res.status(404).json({ error: 'Memory not found or no changes made' });
        }
    } catch (error) {
        logger.error(`Controller error; UPDATE PUT /updateTitlePic/:imageId ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Delete a memory and its associated friends
 * @route DELETE /:memoryId
 * @description Deletes a memory and all associated friends
 */
router.delete('/:memoryId', authenticateFirebaseToken, validateMemoryId, handleValidationErrors, async (req, res) => {
    const memoryId = req.params.memoryId;

    try {
        const deleteResult = await deleteMemoryAndFriends(memoryId);

        if (deleteResult) {
            res.json({ message: 'Memory and associated friends deleted successfully' });
        } else {
            res.status(404).json({ error: 'Memory not found' });
        }
    } catch (error) {
        logger.error(`Controller error; DELETE /:memoryId ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Remove a friend from a memory
 * @route DELETE /:memoryId/:userId
 * @description Deletes a friend from the specified memory
 */
router.delete('/:memoryId/:userId', authenticateFirebaseToken, validateMemoryId, validateFirebaseUID, handleValidationErrors, async (req, res) => {
    const { memoryId, userId } = req.params;

    try {
        await removeFriendFromMemory(userId, memoryId);
        res.json({ message: 'Friend removed successfully from Memory' });
    } catch (error) {
        logger.error(`Controller error; DELETE /:memoryId/:userId ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;