const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get total number of Memories created
router.get('/created/:userId', async (req, res) => {
    const userd = req.params.userId;
  
    try {
      const rows = await db.query(`
      SELECT count(memory_id) as count
      FROM memories
      WHERE user_id = ?`, 
      [userd]
  );
      if (rows.length > 0) {
        res.json(rows[0]); // Sending the first user found with that email
      } else {
        res.json({ message: 'No Memories created yet' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Get number of Memories in this Year
router.get('/createdthisyear/:userId', async (req, res) => {
    const userd = req.params.userId;
  
    try {
      const currentYear = new Date().getFullYear();

      const rows = await db.query(`
      SELECT count(memory_id) as count
      FROM memories
      WHERE user_id = ? AND YEAR(memory_date) = ?`, 
      [userd, currentYear]
  );
      if (rows.length > 0) {
        res.json(rows[0]); // Sending the first user found with that email
      } else {
        res.json({ message: 'No Memories created yet' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
module.exports = router;

