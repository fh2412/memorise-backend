const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

var serviceAccount = require("A:/programming/memorise-910c3-firebase-adminsdk-c4phi-bb250db9f3.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const storage = admin.storage();  


// Route to retrieve the first 5 images
router.get('/previewimages/:folderId', async (req, res) => {
    const folderId = req.params.folderId;
  
    try {
      const listRef = ref(storage, `memories/${folderId}`);
      const { items } = await listAll(listRef);
  
      const previewImages = items.slice(0, 5); // Get the first 5 items
  
      const imageUrls = await Promise.all(
        previewImages.map(async (itemRef) => {
          const url = await getDownloadURL(ref(storage, itemRef.fullPath));
          return url;
        })
      );
  
      res.json(imageUrls); // Send array of image URLs as JSON response
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching image URLs'); // Handle errors
    }
  });


//GET all images with dimensions
router.get('/images/:folderId', async (req, res) => {
    const folderId = req.params.folderId;
  
    try {
      const listRef = ref(storage, `memories/${folderId}`);
      const { items } = await listAll(listRef);
  
      const portraitImages = [];
      const landscapeImages = [];
  
      await Promise.all(
        items.map(async (itemRef) => {
          const url = await getDownloadURL(ref(storage, itemRef.fullPath));
  
          // Use sharp to get image metadata
          const metadata = await sharp(url).metadata();
  
          if (metadata.width > metadata.height) {
            landscapeImages.push(url);
          } else {
            portraitImages.push(url);
          }
        })
      );
  
      res.json({ portraitImages, landscapeImages });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching and classifying images');
    }
  });



module.exports = router;

