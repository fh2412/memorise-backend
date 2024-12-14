const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../middleware/authMiddleware');

// Route to retrieve the first 5 images
/*router.get('/previewimages/:folderId', async (req, res) => {
  const folderId = req.params.folderId;
  try {
    console.log(storage, '/memories', folderId);
    const listRef = ref(storage, `memories/${folderId}`);
    
    // Check if the folder exists and has items
    const listResult = await listAll(listRef);
    console.log("Listresult:", listResult);

    const previewImages = listResult.items.slice(0, 5); // Get the first 5 items

    const imageUrls = await Promise.all(
      previewImages.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef); // Use itemRef directly
        return url;
      })
    );

    res.json(imageUrls); // Send array of image URLs as JSON response
  } catch (error) {
    console.error('Error fetching image URLs:', error); // Improved error logging
    res.status(500).send('Error fetching image URLs');
  }
});*/




//GET all images with dimensions
router.get('/images/:folderId', authenticateFirebaseToken, async (req, res) => {
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

