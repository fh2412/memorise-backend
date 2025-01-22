const { listImageItems, getImageData, classifyImagesDataAccess } = require('./imageGalleryDataAccess');
const logger = require('../../middleware/logger');

const getImageGalleryService = async (folderId) => {
    try {
        const imageItems = await listImageItems(folderId);

        const portraitImages = [];
        const landscapeImages = [];

        await Promise.all(
            imageItems.map(async (itemRef) => {
                const imageData = await getImageData(itemRef.fullPath);
                if (imageData.metadata.width > imageData.metadata.height) {
                    landscapeImages.push(imageData.url);
                } else {
                    portraitImages.push(imageData.url);
                }
            })
        );

        return { portraitImages, landscapeImages };
    } catch (error) {
        logger.error(`Service error; Error getImageGalleryService: ${error.message}`);
        throw error;
    }
};

const classifyImagesService = async (imageUrls) => {
    try {
        const { landscapeImages, portraitImages } = await classifyImagesDataAccess(imageUrls);
        return { landscapeImages, portraitImages };
    } catch (error) {
        logger.error(`Service error; Error classifyImagesService: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getImageGalleryService,
    classifyImagesService,
}