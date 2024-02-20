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

module.exports = router;

