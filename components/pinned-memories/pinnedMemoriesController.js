const { getFavouriteMemories, getFavouriteMemory, updateFavouriteMemory, createFavouriteMemory, deleteFavouriteMemory, deleteFavouriteMemoryAll } = require('./pinnedMemoriesService');
const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');
const { validateMemoryId } = require('../../middleware/validation/validateMemory');
const { validatePinnedMemoryId } = require('../../middleware/validation/validatePinnedMemory');
const handleValidationErrors = require('../../middleware/validationMiddleware');

/**
 * GET users fav memories
 * @route GET /:userId/favourite-memories
 * @description get max 4 favurite memories of a user
 */
router.get('/:userId/favourite-memories', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res, next) => {
    const userId = req.params.userId;

    try {
        const favouriteMemories = await getFavouriteMemories(userId);
        res.json(favouriteMemories);
    } catch (error) {
        logger.error(`Controller error; FAV MEMORIES GET /:userId/favourite-memories ${error.message}`);
        next(error);
    }
});

/**
 * GET fav memories by memory id
 * @route GET /favourite-memorie/:memoryId
 * @description get alle the entrys for a memory if it is delcared at least once as favourite memory
 */
router.get('/favourite-memorie/:memoryId', validateMemoryId, handleValidationErrors, async (req, res, next) => {
    const memoryId = req.params.memoryId;

    try {
        const favoriteMemory = await getFavouriteMemory(memoryId);
        res.json(favoriteMemory);
    } catch (error) {
        logger.error(`Controller error; FAV MEMORIES GET /favourite-memorie/:memoryId ${error.message}`);
        next(error);
    }
});

/**
 * PUT updates users favourite memories
 * @route PUT /:userId/favourite-memories/:memoryId
 * @description updates the favourite memories of a user
 */
router.put('/:userId/favourite-memories/:memoryId', authenticateFirebaseToken, validateFirebaseUID, validateMemoryId, validatePinnedMemoryId, handleValidationErrors, async (req, res, next) => {
    const userId = req.params.userId;
    const memoryIdToUpdate = req.params.memoryId;
    const updatedMemoryId = req.body.memoryId;

    if (!userId || !memoryIdToUpdate || !updatedMemoryId) {
        const error = new Error('Missing required fields in request body or params');
        error.status = 400; // Bad Request
        error.missingFieldsError = true; // Optional: Mark as a missing fields error
        return next(error); // Pass the error to next()
    }

    try {
        const updatedMemory = await updateFavouriteMemory(userId, memoryIdToUpdate, updatedMemoryId);
        res.json(updatedMemory);
    } catch (error) {
        logger.error(`Controller error; FAV MEMORIES PUT /:userId/favourite-memories/:memoryId ${error.message}`);
        next(error);
    }
});

/**
 * POST sets a new fav memory for user
 * @route POST /:userId/favourite-memories
 * @description creates a new db entry for a users favourite memory
 */
router.post('/:userId/favourite-memories', authenticateFirebaseToken, validateFirebaseUID, validatePinnedMemoryId, handleValidationErrors, async (req, res, next) => {
    const userId = req.params.userId;
    const memoryId = req.body.memoryId;

    if (!userId || !memoryId) {
        const error = new Error('Missing required fields in request body');
        error.status = 400; // Bad Request
        error.missingFieldsError = true; // Optional: Mark as a missing fields error

        return next(error); // Pass the error to next()
    }

    try {
        const insertResult = await createFavouriteMemory(userId, memoryId);
        logger.info(insertResult);
        res.status(201).json(insertResult);
    } catch (error) {
        logger.error(`Controller error; FAV MEMORIES POST /:userId/favourite-memories ${error.message}`);
        next(error);
    }
});

/**
 * DELETE deletes a users fav memory
 * @route DELETE /:userId/favourite-memories/:memoryId
 * @description deletes a favourite memory for a user
 */
router.delete('/:userId/favourite-memories/:memoryId', authenticateFirebaseToken, validateFirebaseUID, validateMemoryId, handleValidationErrors, async (req, res, next) => {
    const userId = req.params.userId;
    const memoryIdToDelete = req.params.memoryId;

    if (!userId || !memoryIdToDelete) {
        const error = new Error('Missing required fields in request body or params');
        error.status = 400; // Bad Request
        error.missingFieldsError = true; // Optional: Mark as a missing fields error
        return next(error); // Pass the error to next()
    }

    try {
        const deleteResult = await deleteFavouriteMemory(userId, memoryIdToDelete);
        logger.info(deleteResult);
        res.json(deleteResult);
    } catch (error) {
        logger.error(`Controller error; FAV MEMORIES DELETE /:userId/favourite-memories/:memoryId ${error.message}`);
        next(error);
    }
});

/**
 * DELETE a memory from all favourite users memories
 * @route DELETE /favourite-memorie/:memoryId
 * @description when a memory gets deleted, thsi makes sure it does not remain as a favourite anywhere
 */
router.delete('/favourite-memorie/:memoryId', authenticateFirebaseToken, validateMemoryId, handleValidationErrors, async (req, res, next) => {
    const memoryId = req.params.memoryId;

    try {
        const result = await deleteFavouriteMemoryAll(memoryId);
        res.json(result);
    } catch (error) {
        logger.error(`Controller error; FAV MEMORIES DELETE /favourite-memorie/:memoryId ${error.message}`);
        next(error);
    }
});


module.exports = router;