const express = require('express');
const admin = require('../config/firebaseAdmin');
const router = express.Router();
const archiver = require('archiver');
const authenticateFirebaseToken = require('../middleware/authMiddleware');



const bucket = admin.storage().bucket();

router.get('/download-zip/:folder', authenticateFirebaseToken, async (req, res) => {
  const folderName = req.params.folder;

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
    console.error(error);
    res.status(500).send({ error: 'Failed to generate zip.' });
  }
});

/*router.post('/delete-images', async (req, res) => {
  const imageUrls = req.body.urls;

  try {
    const deletionPromises = imageUrls.map(async (imageUrl) => {
      const bucketName = imageUrl.split('/b/')[1].split('/')[0];
      const filePath = imageUrl.split('?')[0].split('/o/')[1];
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(filePath);

      await file.delete()
      .then(() => {
           console.log('Image deleted successfully');
      })
      .catch((error) => {
          console.error('Error deleting image:', error);
      });
    });

    await Promise.all(deletionPromises); // Wait for all deletions to complete

    res.json({ message: 'Images deleted successfully' });
  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({ message: 'Error deleting images' });
  }
});*/

module.exports = router;