const logger = require('../../middleware/logger');
const { storage } = require('../firebase');
const { ref, listAll, getDownloadURL } = require('firebase/storage');
const sharp = require('sharp'); // Assuming sharp is set up to handle URLs or using another service for metadata extraction
const axios = require('axios');
const sizeOf = require('image-size');

const listImageItems = async (folderId) => {
    try {
        const listRef = ref(storage, `memories/${folderId}`);
        const { items } = await listAll(listRef);
        return items;
    } catch (error) {
        logger.error(`Data Access error while listing images: ${error.message}`);
        throw error;
    }
};

const getImageData = async (fullPath) => {
    try {
        const url = await getDownloadURL(ref(storage, fullPath));
        const metadata = await sharp(url).metadata(); // Use an appropriate method to fetch metadata if sharp doesn't support URLs directly
        return { url, metadata };
    } catch (error) {
        logger.error(`Data Access error while getting image data: ${error.message}`);
        throw error;
    }
};

const classifyImagesDataAccess = async (imageUrls) => {
    try {
        const landscapeImages = [];
        const portraitImages = [];

        for (const url of imageUrls) {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const dimensions = sizeOf(response.data); // Get image dimensions

            if (dimensions.width > dimensions.height) {
                landscapeImages.push(url); // Landscape
            } else {
                portraitImages.push(url); // Portrait
            }
        }
        return { landscapeImages, portraitImages };
    } catch (error) {
        logger.error(`Data Access error while classifying images: ${error.message}`);
        throw error;
    }
};

module.exports = {
    listImageItems,
    getImageData,
    classifyImagesDataAccess,
}