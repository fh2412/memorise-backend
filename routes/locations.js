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


router.post('/createLocation', async (req, res) => {
    const { long, lat, l_country, l_city, l_street, l_postcode } = req.body;
    try {
      // Insert the friendship request into the database
      const result = await db.query(
        'INSERT INTO location ( longitude, latitude, country, city, street, postal_code) VALUES (?, ?, ?, ?, ?, ?)',
        [long, lat, l_country, l_city, l_street, l_postcode]
      );
  
      const locationId = result;
  
      res.json({ message: 'Location created successfully', locationId: locationId });
    } catch (error) {
      console.error('Error creating Location:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;

