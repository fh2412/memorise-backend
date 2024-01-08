const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Retrieve memories by user ID
router.get('/users/:userId/memories', async (req, res) => {
  const userId = req.params.userId;

  // Query to fetch memories associated with the user
  const query = `
    SELECT m.* 
    FROM memories m 
    INNER JOIN user_has_memory um ON m.memory_id = um.memory_id
    WHERE um.user_id = ?
  `;

  try {
    // Execute the query using your MySQL library (e.g., mysql2, Sequelize)
    // Replace 'executeQuery' with your database query execution function
    const memories = await executeQuery(query, [userId]);
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve users by memory ID
router.get('/memories/:memoryId/users', async (req, res) => {
  const memoryId = req.params.memoryId;

  // Query to fetch users associated with the memory
  const query = `
    SELECT u.* 
    FROM users u 
    INNER JOIN user_has_memory um ON u.user_id = um.user_id
    WHERE um.memory_id = ?
  `;

  try {
    // Execute the query using your MySQL library (e.g., mysql2, Sequelize)
    // Replace 'executeQuery' with your database query execution function
    const users = await executeQuery(query, [memoryId]);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Express route

// Retrieve details of a specific memory by memory ID
router.get('/memories/:memoryId', async (req, res) => {
  const memoryId = req.params.memoryId;

  // Query to fetch details of the memory by its ID
  const query = `
    SELECT * 
    FROM memories 
    WHERE memory_id = ?,
	[memoryId]
  `;

  try {
    // Execute the query using your MySQL library (e.g., mysql2, Sequelize)
    // Replace 'executeQuery' with your database query execution function
    const memory = await executeQuery(query, [memoryId]);

    if (memory.length === 0) {
      res.status(404).json({ error: 'Memory not found' });
    } else {
      res.json(memory[0]); // Assuming memory_id is unique; returning the first (and only) result
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;