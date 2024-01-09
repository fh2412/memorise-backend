const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Retrieve users by memory ID
router.get('/memories/:memoryId/users', async (req, res) => {
    const memoryId = req.params.memoryId;
  
    try {
      const [rows] = await db.query(`
      SELECT u.* 
      FROM users u 
      INNER JOIN user_has_memory um ON u.user_id = um.user_id
      WHERE um.memory_id = ?`, 
      [memoryId]
  );
      if (rows.length > 0) {
        res.json(rows[0]); // Sending the first user found with that email
      } else {
        res.status(404).json({ message: 'Memory not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Retrieve details of a specific memory by memory ID
router.get('/memories/:memoryId', async (req, res) => {
    const memoryId = req.params.memoryId;
  
    try {
      const [rows] = await db.query(`
        SELECT * 
        FROM memories 
        WHERE memory_id = ?`, 
      [memoryId]
  );
      if (rows.length > 0) {
        res.json(rows[0]); // Sending the first user found with that email
      } else {
        res.status(404).json({ message: 'Memory not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;
