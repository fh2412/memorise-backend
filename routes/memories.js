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
      SELECT memories.*, users.name AS username, location.latitude, location.longitude
      FROM memories
      JOIN users ON memories.user_id = users.user_id
      JOIN location ON memories.location_id = location.location_id
      WHERE memories.user_id = ?;
    `, 
      [userId]
    );

    if (rows.length > 0) {
      res.json(rows); // Sending all memories with location data for the user
    } else {
      res.status(200).json({ message: 'You haven\'t created any memories yet!' }); // Informative message
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Friends created Memories by userId
router.get('/getAddedMemories/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(`
      SELECT memories.*, users.name AS username, location.latitude, location.longitude
      FROM memories
      JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id
      JOIN users ON memories.user_id = users.user_id
      JOIN location ON memories.location_id = location.location_id  -- Added join with location table
      WHERE user_has_memory.user_id = ?;
    `, 
      [userId]
    );

    if (rows.length > 0) {
      res.json(rows); // Sending all memories with location data for the user
    } else {
      res.json({ message: 'User has not added any Memories yet' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET all the memories a user is added to
router.get('/allMemories/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Combine queries using UNION ALL to get memories from both sources
    const [combinedRows] = await db.query(`
      SELECT memory_id, title
      FROM memories
      WHERE user_id = ?

      UNION ALL

      SELECT memories.memory_id, memories.title
      FROM memories
      INNER JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id
      WHERE user_has_memory.user_id = ?
    `, [userId, userId]); // Use userId for both queries

    if (combinedRows.length > 0) {
      // Send only the memoryId and title properties
      const formattedMemories = combinedRows.map(memory => ({
        memoryId: memory.memory_id,
        title: memory.title
      }));
      res.json(formattedMemories);
    } else {
      res.status(200).json({ message: 'No memories found for this user.' });
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

//GET MEMORY CREATORS NAME
/*router.get('/getMemoryCreator/:userId', async (req, res) => {
  const creatorId = req.params.userId;

  try {
    const [rows] = await db.query(`
      SELECT name 
      FROM users 
      WHERE user_id = ?`, 
    [creatorId]
);
    if (rows.length > 0) {
      res.json(rows[0]); // Sending the first user found with that email
    } else {
      res.status(404).json({ message: 'Memories creator not found!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/

router.get('/:memoryID/:userID/friends', async (req, res) => {
    const memoryID = req.params.memoryID; // Get memory ID from the request parameter
    const userID = req.params.userID;
    try {
      const [rows] = await db.query(`
        SELECT u.name, u.user_id, u.dob, u.profilepic, u.country
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
  const { creator_id, title, description, firestore_bucket_url, location_id, memory_date, memory_end_date, title_pic } = req.body;
  try {
    // Insert the friendship request into the database
    const result = await db.query(
      'INSERT INTO memories (user_id, title, text, image_url, location_id, memory_date, memory_end_date, title_pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [creator_id, title, description, firestore_bucket_url, location_id, memory_date, memory_end_date, title_pic]
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
      if (userResult[0][0]) {
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


//UPDATE a Memory
router.put('/:memoryId', async (req, res) => {
  const memoryId = req.params.memoryId;
  const { title, description, memory_date, memory_end_date } = req.body; // Assuming these are the fields to be updated
  try {
    // Execute the SQL UPDATE query
    const [result] = await db.execute(
      'UPDATE memories SET title = ?, text = ?, memory_date = ?, memory_end_date = ? WHERE memory_id = ?',
      [title, description, memory_date, memory_end_date, memoryId]
    );

    // Check if the memory was updated successfully
    if (result.affectedRows > 0) {
      res.json({ message: 'Memory updated successfully' });
    } else {
      res.status(404).json({ error: 'Memory not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//UPDATE PictureCount
router.put('/picturecount/:memoryId', async (req, res) => {
  const memoryId = req.params.memoryId;
  const picture_count = req.body.picture_count;
  try {
    // Execute the SQL UPDATE query
    const [result] = await db.execute(
      'UPDATE memories SET picture_count = ? WHERE memory_id = ?',
      [picture_count, memoryId]
    );

    // Check if the memory was updated successfully
    if (result.affectedRows > 0) {
      res.json({ message: 'Memory updated successfully' });
    } else {
      res.status(404).json({ error: 'Memory not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//UPDATE Location ID
router.put('/updateMemoryLocation/:memoryId', async (req, res) => {
  const memoryId = req.params.memoryId;
  const location_id = req.body.locationId;
  try {
    // Execute the SQL UPDATE query
    const [result] = await db.execute(
      'UPDATE memories SET location_id = ? WHERE memory_id = ?',
      [location_id, memoryId]
    );

    // Check if the memory was updated successfully
    if (result.affectedRows > 0) {
      res.json({ message: 'Memory updated successfully' });
    } else {
      res.status(404).json({ error: 'Memory not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//UPDATE Memories Title Picture
router.put('/updateTitlePic/:imageId', async (req, res) => {
  const memoryId = req.params.imageId;
  const imageUrl = req.body.imageUrl;
  try {
    // Execute the SQL UPDATE query
    const [result] = await db.execute(
      'UPDATE memories SET title_pic = ? WHERE image_url = ?',
      [imageUrl, memoryId]
    );

    // Check if the memory was updated successfully
    if (result.affectedRows > 0) {
      res.json({ message: 'Memory updated successfully' });
    } else {
      res.status(404).json({ error: 'Memory not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE request to delete a memory and its associated friends
router.delete('/:memoryId', async (req, res) => {
  const memoryId = req.params.memoryId;

  try {
    // Check if the memory exists
    const checkMemoryQuery = 'SELECT * FROM memories WHERE memory_id = ?';
    const existingMemory = await db.query(checkMemoryQuery, [memoryId]);

    if (existingMemory.length === 0) {
      // Memory not found
      return res.status(404).json({ error: 'Memory not found' });
    }

    // Delete friends associated with the memory
    const deleteFriendsQuery = 'DELETE FROM user_has_memory WHERE memory_id = ?';
    await db.query(deleteFriendsQuery, [memoryId]);

    // Delete the memory
    const deleteMemoryQuery = 'DELETE FROM memories WHERE memory_id = ?';
    await db.query(deleteMemoryQuery, [memoryId]);

    res.json({ message: 'Memory and associated friends deleted successfully' });
  } catch (error) {
    console.error('Error deleting memory and friends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE Friend from Memory
router.delete('/:memoryId/:userId', async (req, res) => {
  const memoryId = req.params.memoryId;
  const userId = req.params.userId;

  try {
    await db.query(
      'DELETE FROM user_has_memory WHERE user_id = ? AND memory_id = ?',
      [userId, memoryId]
    );

    res.json({ message: 'Friend removed successfully from Memory' });
  } catch (error) {
    console.error('Error removing friend from Memory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;

