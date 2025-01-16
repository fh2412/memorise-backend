/**
 * GET users associated with a memory
 * @route GET /:memoryId/users
 * @description Get the users associated with a given memory
 */
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

