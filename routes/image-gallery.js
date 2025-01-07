const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../middleware/authMiddleware');
const { validateGetImagesByFolderId } = require('../middleware/validation/validateImageGallery');
const handleValidationErrors = require('../middleware/validationMiddleware');


//GET all images with dimensions
router.get('/images/:folderId', authenticateFirebaseToken, validateGetImagesByFolderId, handleValidationErrors, async (req, res) => {
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

router.post('/classify-images', authenticateFirebaseToken, async (req, res) => {
  const { imageUrls } = req.body; // Expecting an array of image URLs

  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({ error: 'No image URLs provided' });
  }

  try {
    const landscapeImages = [];
    const portraitImages = [];

    // Loop through the image URLs and classify them
    for (const url of imageUrls) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const dimensions = sizeOf(response.data); // Get image dimensions

      if (dimensions.width > dimensions.height) {
        landscapeImages.push(url); // Landscape
      } else {
        portraitImages.push(url); // Portrait
      }
    }

    // Return the arrays
    res.json({ landscape: landscapeImages, portrait: portraitImages });
  } catch (error) {
    console.error('Error classifying images:', error);
    res.status(500).send('Error classifying images');
  }
});


module.exports = router;

