const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateFirebaseToken = require('../middleware/authMiddleware');


//GET SINGLE LOCATION BY ID
router.get('/:locId', authenticateFirebaseToken, async (req, res) => {
  const locId = req.params.locId;

  try {
    const rows = await db.query(`
      SELECT *
      FROM location
      WHERE location_id = ?`,
      [locId]
    );
    if (rows.length > 0) {
      res.json(rows[0][0]);
    } else {
      res.json({ message: 'No Location with this ID' });
    }
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

//CREATE NEW LOCATION
router.post('/createLocation', authenticateFirebaseToken, async (req, res) => {
  const { lng, lat, l_country, l_city } = req.body;
  try {
    // Insert the friendship request into the database
    const result = await db.query(
      'INSERT INTO location ( longitude, latitude, country, locality) VALUES (?, ?, ?, ?)',
      [lng, lat, l_country, l_city]
    );

    const locationId = result;

    res.json({ message: 'Location created successfully', locationId: locationId });
  } catch (error) {
    console.error('Error creating Location:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//UPDATE LOCATION
router.put('/updateLocation/:id', authenticateFirebaseToken, async (req, res) => {
  const locationId = req.params.id; // Get the location ID from the URL parameter
  const { lng, lat, l_country, l_city } = req.body;
  try {
    // Update the location in the database
    const updateResult = await db.query(
      'UPDATE location SET longitude = ?, latitude = ?, country = ?, locality = ? WHERE location_id = ?',
      [lng, lat, l_country, l_city, locationId]
    );

    if (updateResult.affectedRows === 0) {
      // Location not found
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating Location:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

