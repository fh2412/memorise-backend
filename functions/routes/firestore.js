const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

var serviceAccount = require("A:/programming/memorise-910c3-firebase-adminsdk-c4phi-bb250db9f3.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const storage = admin.storage();  


router.post('/delete-images', async (req, res) => {
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
});

module.exports = router;

