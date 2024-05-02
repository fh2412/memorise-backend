const express = require('express');
const router = express.Router();
const db = require('../config/db');


//GET SINGLE LOCATION BY ID
router.get('/:locId', async (req, res) => {
  const locId = req.params.locId;

  try {
    const rows = await db.query(`
      SELECT *
      FROM location
      WHERE location_id = ?`,
      [locId]
    );
    if (rows.length > 0) {
      res.json(rows[0]); // Sending the first user found with that email
    } else {
      res.json({ message: 'No Location with this ID' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//CREATE NEW LOCATION
router.post('/createLocation', async (req, res) => {
  const { lng, lat } = req.body;
  try {
    // Insert the friendship request into the database
    const result = await db.query(
      'INSERT INTO location ( longitude, latitude) VALUES (?, ?)',
      [lng, lat]
    );

    const locationId = result;

    res.json({ message: 'Location created successfully', locationId: locationId });
  } catch (error) {
    console.error('Error creating Location:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//UPDATE LOCATION
router.put('/updateLocation/:id', async (req, res) => {
  const locationId = req.params.id; // Get the location ID from the URL parameter
  const { lng, lat } = req.body; // Get updated location details
  try {
    // Update the location in the database
    const updateResult = await db.query(
      'UPDATE location SET longitude = ?, latitude = ? WHERE location_id = ?',
      [lng, lat, locationId]
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

