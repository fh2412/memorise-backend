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

// Get created Memories by userId
router.get('/createdMemories/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const [rows] = await db.query(`
      SELECT * 
      FROM memories
      WHERE user_id = ?`, 
      [userId]
  );
      if (rows.length > 0) {
        res.json(rows); // Sending the first user found with that email
      } else {
        res.status(404).json({ message: 'User has not created any Memories yet' });
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
        res.json(rows);
      } else {
        res.json({ message: 'No friends added to the Memory' });
      }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});


router.post('/createMemory', async (req, res) => {
  const { creator_id, title, description, firestore_bucket_url, location_id, memory_date, title_pic } = req.body;
  try {
    // Insert the friendship request into the database
    const result = await db.query(
      'INSERT INTO memories (user_id, title, text, image_url, location_id, memory_date, title_pic) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [creator_id, title, description, firestore_bucket_url, 1, memory_date, title_pic]
    );

    const memoryId = result;

    res.json({ message: 'Memory created successfully', memoryId: memoryId });
  } catch (error) {
    console.error('Error creating Memory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/addFriendsToMemory', async (req, res) => {
  const { emails, memoryId } = req.body;

  try {
    for (const email of emails) {
      // Step 1: Get user_id from email
      const userResult = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
      if (userResult[0][0] != 0) {
        const userId = userResult[0][0].user_id;

        // Step 2: Post user_id in "user_has_memory" table
        await db.query('INSERT INTO user_has_memory (user_id, memory_id, status) VALUES (?, ?, ?)', [userId, memoryId, 'friend']);
      } else {
        console.error(`User not found for email: ${email}`);
        // Handle the case where a user is not found for the email
        // You might choose to continue with other emails or stop the loop based on your requirements
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;

