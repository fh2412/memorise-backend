const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateMemoryId, validateCreateMemory, validateAddFriendsToMemory, validateUpdateMemory, validateUpdatePictureCount, validateUpdateMemoryLocation, validateIncrementPictureCount, validateUpdateTitlePic } = require('../../middleware/validation/validateMemory');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getCreatedMemories,
    getUserAllMemories,
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
    removeFriendFromMemory, 
    generateShareLink,
    validateShareToken,
    joinMemoryViaToken,
    checkMembership, incrementMemoryPictureCount } = require('./memoriesService');

/**
 * GET created memories for a user with pagination
 * @route GET /createdMemories/:userId
 * @query page - page number (0-indexed)
 * @query pageSize - number of items per page
 * @query ascending - sort order
 */
router.get('/createdMemories/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
    const userId = req.params.userId;
    const ascending = req.query.ascending === 'true';
    const page = parseInt(req.query.page) || 0;
    const pageSize = parseInt(req.query.pageSize) || 9;
    
    try {
        const result = await getCreatedMemories(userId, ascending, page, pageSize);
        res.json(result);
    } catch (error) {
        logger.error(`Controller error; CREATED MEMORIES GET /createdMemories/:userId ${error.message}`);
        next(error);
    }
});


/**
 * GET all memories a user has with pagination
 * @route GET /all/:userId
 * @query page - page number (0-indexed)
 * @query pageSize - number of items per page
 * @query ascending - sort order
 */
router.get('/all/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
    const userId = req.params.userId;
    const ascending = req.query.ascending === 'true';
    const page = parseInt(req.query.page) || 0;
    const pageSize = parseInt(req.query.pageSize) || 9;
    
    try {
        const result = await getUserAllMemories(userId, ascending, page, pageSize);
        res.json(result);
    } catch (error) {
        logger.error(`Controller error; ALL MEMORIES GET /all/:userId ${error.message}`);
        next(error);
    }
});

/**
 * GET all memories for a user (both created and added)
 * @route GET /allMemories/:userId
 * @description Get all memories created and added by the user, with memoryId and title
 */
router.get('/allMemories/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * GET Check if user is a member of a memory
 * @route GET /memories/:memoryId/member/:userId
 * @description Check if a specific user is a member of a memory
 */
router.get('/:memoryId/member/:userId', 
    authenticateFirebaseToken, 
    validateMemoryId, 
    validateFirebaseUID, 
    handleValidationErrors, 
    async (req, res, next) => {
        const { memoryId, userId } = req.params;

        try {
            const result = await checkMembership(memoryId, userId);
            res.json(result);
        } catch (error) {
            logger.error(`Controller error; GET /:memoryId/member/:userId ${error.message}`);
            next(error);
        }
    }
);

/**
 * GET Validate share token and return memory details
 * @route GET /memories/share/validate/:token
 * @description Validate a share token and return memory information
 */
router.get('/share/validate/:token', 
    authenticateFirebaseToken, 
    async (req, res, next) => {
        const { token } = req.params;
        const userId = req.user?.uid; // Optional - user might be checking before joining

        try {
            const result = await validateShareToken(token, userId);
            
            if (!result.valid) {
                return res.status(404).json({ 
                    valid: false, 
                    message: 'Invalid or expired share link' 
                });
            }
            
            res.json(result);
        } catch (error) {
            logger.error(`Controller error; GET /share/validate/:token ${error.message}`);
            next(error);
        }
    }
);

/**
 * GET details of a specific memory by memoryId
 * @route GET /:memoryId
 * @description Get details of a memory by its ID
 */
router.get('/:memoryId', authenticateFirebaseToken, validateMemoryId, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * GET friends who are part of a memory
 * @route GET /:memoryId/:userId/friends
 * @description Get all users (friends) added to a specific memory excluding the requesting user
 */
router.get('/:memoryId/:userId/friends', authenticateFirebaseToken, validateMemoryId, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * GET friends with shared memory count for a specific memory
 * @route GET /:memoryId/:userId/friends-with-shared-count
 * @description Get all friends with their shared memory count for a specific memory
 */
router.get('/:memoryId/:userId/friends-with-shared-count', authenticateFirebaseToken, validateMemoryId, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
    const { memoryId, userId } = req.params;

    try {
        const friendsWithSharedCount = await getFriendsWithSharedCount(memoryId, userId);
        res.json(friendsWithSharedCount);
    } catch (error) {
        console.error('Controller error; GET /:memoryId/:userId/friends-with-shared-count', error.message);
        next(error);
    }
});

/**
 * POST Create a new memory
 * @route POST /createMemory
 * @description Create a new memory and store it in the database
 */
router.post('/createMemory', authenticateFirebaseToken, validateCreateMemory, handleValidationErrors, async (req, res, next) => {
    const { creator_id, title, description, firestore_bucket_url, location_id, memory_date, memory_end_date, title_pic, activity_id } = req.body;

    try {
        const memory_id = await createMemory({
            creator_id, title, description, firestore_bucket_url, location_id, memory_date, memory_end_date, title_pic, activity_id
        });
        res.json({ message: 'Memory created successfully', memory_id });
    } catch (error) {
        logger.error(`Controller error; CREATE MEMORY POST /createMemory ${error.message}`);
        next(error);
    }
});

/**
 * POST Add friends to a memory
 * @route POST /addFriendsToMemory
 * @description Add friends to a memory by their emails
 */
router.post('/addFriendsToMemory', authenticateFirebaseToken, validateAddFriendsToMemory, handleValidationErrors, async (req, res, next) => {
    const { emails, memoryId } = req.body;

    try {
        await addFriendsToMemory(emails, memoryId);
        res.json({ success: true });
    } catch (error) {
        logger.error(`Controller error; ADD FRIENDS POST /addFriendsToMemory ${error.message}`);
        next(error);
    }
});

/**
 * POST Generate or get share link for a memory
 * @route POST /memories/:memoryId/share
 * @description Generate a shareable link for a memory
 */
router.post('/:memoryId/share', 
    authenticateFirebaseToken, 
    validateMemoryId, 
    handleValidationErrors, 
    async (req, res, next) => {
        const { memoryId } = req.params;
        const userId = req.user.uid;

        try {
            const result = await generateShareLink(memoryId, userId);
            
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
            
            // Return both direct link and OG preview link
            res.json({
                shareLink: `${frontendUrl}/og/memory/${result.shareToken}`,
                directLink: `${frontendUrl}/memory/join/${result.shareToken}`,
                shareToken: result.shareToken
            });
        } catch (error) {
            if (error.message === 'Memory not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'User does not have permission to share this memory') {
                return res.status(403).json({ message: error.message });
            }
            
            logger.error(`Controller error; POST /:memoryId/share ${error.message}`);
            next(error);
        }
    }
);

/**
 * POST Join a memory via share token
 * @route POST /memories/share/join
 * @description Add the authenticated user to a memory using a share token
 */
router.post('/share/join', 
    authenticateFirebaseToken, 
    async (req, res, next) => {
        const { token } = req.body;
        const userId = req.user.uid;

        if (!token) {
            return res.status(400).json({ message: 'Share token is required' });
        }

        try {
            const result = await joinMemoryViaToken(token, userId);
            res.json(result);
        } catch (error) {
            if (error.message === 'Invalid or expired share link') {
                return res.status(404).json({ message: error.message });
            }
            
            logger.error(`Controller error; POST /share/join ${error.message}`);
            next(error);
        }
    }
);

/**
 * POST Increment the picture count
 * @route POST /picturecount/:memoryId/increment
 * @description Addes a specific number to a memories picture count
 */
router.post('/picturecount/:memoryId/increment', 
    authenticateFirebaseToken, 
    validateIncrementPictureCount, 
    handleValidationErrors, 
    async (req, res, next) => {
        const memoryId = req.params.memoryId;
        const increment = req.body.increment; // Number of pictures to add
        
        try {
            const newCount = await incrementMemoryPictureCount(memoryId, increment);
            
            if (newCount !== null) {
                res.json({ 
                    message: 'Picture count incremented successfully',
                    newCount: newCount
                });
            } else {
                res.status(404).json({ error: 'Memory not found' });
            }
        } catch (error) {
            logger.error(`Controller error; POST /picturecount/:memoryId/increment ${error.message}`);
            next(error);
        }
    }
);

/**
 * PUT Update a memory
 * @route PUT /:memoryId
 * @description Update memory details for a specific memory
 */
router.put('/:memoryId', authenticateFirebaseToken, validateUpdateMemory, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * PUT Update the picture count for a memory
 * @route PUT /picturecount/:memoryId
 * @description Update the picture count for a specific memory
 */
router.put('/picturecount/:memoryId', authenticateFirebaseToken, validateUpdatePictureCount, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * Update the location of a memory
 * @route PUT /updateMemoryLocation/:memoryId
 * @description Update the location ID for a specific memory
 */
router.put('/updateMemoryLocation/:memoryId', authenticateFirebaseToken, validateUpdateMemoryLocation, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * Update the title picture of a memory
 * @route PUT /updateTitlePic/:imageId
 * @description Update the title picture for a specific memory
 */
router.put('/updateTitlePic/:imageId', authenticateFirebaseToken, validateUpdateTitlePic, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * Delete a memory and its associated friends
 * @route DELETE /:memoryId
 * @description Deletes a memory and all associated friends
 */
router.delete('/:memoryId', authenticateFirebaseToken, validateMemoryId, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
 * Remove a friend from a memory
 * @route DELETE /:memoryId/:userId
 * @description Deletes a friend from the specified memory
 */
router.delete('/:memoryId/:userId', authenticateFirebaseToken, validateMemoryId, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
    const { memoryId, userId } = req.params;

    try {
        await removeFriendFromMemory(userId, memoryId);
        res.json({ message: 'Friend removed successfully from Memory' });
    } catch (error) {
        logger.error(`Controller error; DELETE /:memoryId/:userId ${error.message}`);
        next(error);
    }
});

module.exports = router;