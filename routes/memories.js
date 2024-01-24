const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Retrieve users by memory ID
router.get('/:memoryId/users', async (req, res) => {
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
router.get('/:memoryId', async (req, res) => {
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


router.get('/:memoryID/:userID/friends', async (req, res) => {
    const memoryID = req.params.memoryID; // Get memory ID from the request parameter
    const userID = req.params.userID;
    try {
      const [rows] = await db.query(`
        SELECT u.name, u.user_id
        FROM users u
        INNER JOIN user_has_memory um ON u.user_id = um.user_id
        WHERE um.memory_id = ? AND u.user_id != ?`, 
      [memoryID, userID]);

      if (rows.length > 0) {
        res.json(rows); // Sending the first user found with that email
      } else {
        res.status(404).json({ message: 'Memory not found' });
      }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});


router.post('/createMemory', async (req, res) => {
  const { creator_id, title, description, firestore_bucket_url, location_id, memory_date } = req.body;
  console.log(creator_id, title, description, firestore_bucket_url, location_id, memory_date);
  try {
    // Insert the friendship request into the database
    await db.query(
      'INSERT INTO memories (user_id, title, text, image_url, location_id, memory_date) VALUES (?, ?, ?, ?, ?, ?)',
      [creator_id, title, description, firestore_bucket_url, 1, memory_date]
    );

    res.json({ message: 'Memory created successfully' });
  } catch (error) {
    console.error('Error creating Memory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

