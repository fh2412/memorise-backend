const express = require('express');
const router = express.Router();
/*const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateGetImagesByFolderId } = require('../../middleware/validation/validateImageGallery');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getImageGalleryService, classifyImagesService } = require('./imageGalleryService');
*/

/**
 * GET images from folder
 * @route GET /images/:folderId
 * @description returns all the image urls inside a firebase fodler
 */

/*
router.get('/images/:folderId', authenticateFirebaseToken, validateGetImagesByFolderId, handleValidationErrors, async (req, res) => {
    const folderId = req.params.folderId;

    try {
        const { portraitImages, landscapeImages } = await getImageGalleryService(folderId);
        res.json({ portraitImages, landscapeImages });
    } catch (error) {
        logger.error(`Controller error; IMAGEGALLERY GET /images/:folderId: ${error.message}`);
        res.status(500).send('Error fetching and classifying images');
    }
});
*/

/**
 * POST safes a images dimensions
 * @route POST /classify-images
 * @description calculates the images dimensions and safes them as metadata to the firebase picture
 */
/*
router.post('/classify-images', authenticateFirebaseToken, async (req, res) => {
    const { imageUrls } = req.body;

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
        return res.status(400).json({ error: 'No image URLs provided' });
    }

    try {
        const { landscapeImages, portraitImages } = await classifyImagesService(imageUrls);
        res.json({ landscape: landscapeImages, portrait: portraitImages });
    } catch (error) {
        logger.error(`Controller error; IMAGEGALLERY POST /classify-images ${error.message}`);
        res.status(500).send('Error classifying images');
    }
});
*/


module.exports = router;
