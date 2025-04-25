const express = require('express');
const axios = require('axios');
const { getFirebaseAdmin, initializeFirebaseAdmin } = require('../config/firebaseAdmin');
const router = express.Router();
const logger = require('../middleware/logger');
const archiver = require('archiver');
const authenticateFirebaseToken = require('../middleware/authMiddleware');


async function startApp() {
  try {
    await initializeFirebaseAdmin();
  } catch (error) {
    logger.error('App initialization failed:', error);
  }
}

startApp();

router.get('/download-zip/:folder', authenticateFirebaseToken, async (req, res) => {
  const folderName = req.params.folder;
  const admin = getFirebaseAdmin();
  const bucket = admin.storage().bucket();
  try {
    // Get all files in the specified folder
    const [files] = await bucket.getFiles({ prefix: 'memories/' + folderName + '/' });
    if (files.length === 0) {
      return res.status(404).send({ error: 'No files found in the folder.' });
    }

    // Create a zip archive
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Stream the archive to the client
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${folderName}.zip`);
    archive.pipe(res);

    // Add files to the archive
    for (const file of files) {
      const fileStream = file.createReadStream();
      archive.append(fileStream, { name: file.name.replace(folderName + '/', '') });
    }

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: 'Failed to generate zip.' });
  }
});

router.post('/download-selected-zip', authenticateFirebaseToken, async (req, res) => {
  try {
    // Expect an array of image download URLs in the request body
    const { imageUrls } = req.body;

    // Set the content type and header for zip download
    res.contentType('application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=downloaded_images.zip');

    // Create an archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });

    // Pipe archive to the response
    archive.pipe(res);

    // Download and add images to the archive
    const downloadPromises = imageUrls.map(async (url, index) => {
      try {
        // Download the image
        const response = await axios({
          method: 'get',
          url: url.url,
          responseType: 'arraybuffer'
        });

        // Determine file extension
        const contentType = response.headers['content-type'];
        const fileExtension = getFileExtension(contentType);

        // Append the image to the archive
        archive.append(response.data, { 
          name: `image_${index + 1}${fileExtension}`
        });
      } catch (downloadError) {
        console.error(`Error downloading image from ${url.url}:`, downloadError);
      }
    });

    // Wait for all download promises to resolve
    await Promise.all(downloadPromises);

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error('Error in image download route:', error);
    res.status(500).json({ 
      error: 'Failed to download images', 
      details: error.message 
    });
  }
});

// Helper function to get file extension from content type
function getFileExtension(contentType) {
  switch (contentType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/webp':
      return '.webp';
    case 'image/svg+xml':
      return '.svg';
    default:
      return '.jpg'; // Default to .jpg if unknown
  }
}

module.exports = router;
