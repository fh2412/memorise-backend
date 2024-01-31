const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Retrieve users by memory ID
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

module.exports = router;

