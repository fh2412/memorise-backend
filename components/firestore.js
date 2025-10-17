const express = require('express');
const axios = require('axios');
const { getFirebaseAdmin, initializeFirebaseAdmin } = require('../config/firebaseAdmin');
const router = express.Router();
const logger = require('../middleware/logger');
const archiver = require('archiver');
const authenticateFirebaseToken = require('../middleware/authMiddleware');
require('dotenv').config();


async function startApp() {
  try {
    await initializeFirebaseAdmin();
  } catch (error) {
    logger.error('App initialization failed:', error);
  }
}

startApp();

function validateFolderPath(folderPath) {
  // Expected format: "memories/{userId}{timestamp}"
  const folderRegex = /^memories\/([a-zA-Z0-9]+)\d+$/;
  const match = folderPath.match(folderRegex);
  
  if (!match) {
    return false;
  }
  return folderRegex.test(folderPath);
}

// Validate filename to prevent path traversal
function validateFileName(fileName) {
  // Only allow alphanumeric, dots, dashes, underscores
  const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
  
  // Prevent path traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }
  
  return fileNameRegex.test(fileName);
}

// Validate token format (UUID)
function validateToken(token) {
  const tokenRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  return tokenRegex.test(token);
}


function reconstructFirebaseUrl(folderPath, fileName, token) {
  const encodedPath = encodeURIComponent(`${folderPath}/${fileName}`);
  return `https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/${encodedPath}?alt=media&token=${token}`;
}

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
    const { images } = req.body;
    
    // Validate input
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Invalid images array' });
    }
    
    if (images.length > 100) { // Add reasonable limit
      return res.status(400).json({ error: 'Too many images requested' });
    }
    
    // Validate all images before processing
    for (const image of images) {
      // Check required fields
      if (!image.folderPath || !image.fileName || !image.token) {
        return res.status(400).json({ error: 'Missing required image fields' });
      }
      
      // Validate folder path belongs to user
      if (!validateFolderPath(image.folderPath)) {
        return res.status(403).json({ 
          error: 'Invalid folder path',
          folderPath: image.folderPath 
        });
      }
      
      // Validate filename
      if (!validateFileName(image.fileName)) {
        return res.status(400).json({ 
          error: 'Invalid filename',
          fileName: image.fileName 
        });
      }
      
      // Validate token format
      if (!validateToken(image.token)) {
        return res.status(400).json({ error: 'Invalid token format' });
      }
    }

    res.contentType('application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=downloaded_images.zip');
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });
    
    archive.pipe(res);

    const downloadPromises = images.map(async (image, index) => {
      try {
        // Reconstruct URL on server side
        const url = reconstructFirebaseUrl(image.folderPath, image.fileName, image.token);
        const response = await axios({
          method: 'get',
          url: url,
          responseType: 'arraybuffer',
          timeout: 30000, // 30 second timeout
          maxRedirects: 0, // No redirects
          maxContentLength: 50 * 1024 * 1024, // 50MB max per image
        });
        
        // Validate content type
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          console.error(`Invalid content type for ${image.fileName}: ${contentType}`);
          return;
        }
        
        const fileExtension = getFileExtension(contentType);
        archive.append(response.data, {
          name: `image_${index + 1}${fileExtension}`
        });
      } catch (downloadError) {
        console.error('Error downloading image %s:', image.fileName, downloadError.message);
      }
    });

    await Promise.all(downloadPromises);
    await archive.finalize();
    
  } catch (error) {
    console.error('Error in image download route:', error);
    
    // Don't send JSON if headers already sent
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to download images',
        details: error.message
      });
    }
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
