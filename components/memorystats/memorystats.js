const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');
const { validateStatsUID } = require('../../middleware/validation/validateMemorystats');
const handleValidationErrors = require('../../middleware/validationMiddleware');


// Get total number of Memories created
router.get('/created/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
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
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

// Get number of Memories in this Year
router.get('/createdthisyear/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
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
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

//GET amount of Friends
router.get('/friendcount/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
  const userd = req.params.userId;

  try {
    const rows = await db.query(`
      SELECT count(user_id1) as count
      FROM friendships
      WHERE (user_id1 = ? OR user_id2 = ?) AND status = ?`,
      [userd, userd, 'accepted']
    );
    if (rows.length > 0) {
      res.json(rows[0]); // Sending the first user found with that email
    } else {
      res.json({ message: 'No Memories created yet' });
    }
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

//GET shared Memories with Friend
router.get('/shared-memories/:user1Id/:user2Id', authenticateFirebaseToken, validateStatsUID, handleValidationErrors, async (req, res) => {
  const { user1Id, user2Id } = req.params;

  try {
    const query = `
      SELECT COUNT(DISTINCT m.memory_id) AS sharedMemoriesCount
      FROM memories AS m
      LEFT JOIN user_has_memory AS uh1 ON m.memory_id = uh1.memory_id AND uh1.user_id = ?
      LEFT JOIN user_has_memory AS uh2 ON m.memory_id = uh2.memory_id AND uh2.user_id = ?
      WHERE 
        -- Case 1: Both users are in user_has_memory for the same memory
        (uh1.user_id IS NOT NULL AND uh2.user_id IS NOT NULL)
        
        OR
        
        -- Case 2: User1 is the creator in memories and User2 is in user_has_memory
        (m.user_id = ? AND uh2.user_id IS NOT NULL)
        
        OR
        
        -- Case 3: User2 is the creator in memories and User1 is in user_has_memory
        (m.user_id = ? AND uh1.user_id IS NOT NULL)
    `;

    const [rows] = await db.execute(query, [user1Id, user2Id, user1Id, user2Id]);
    const sharedMemoriesCount = rows[0]?.sharedMemoriesCount || 0;

    res.json({ sharedMemoriesCount });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

module.exports = router;


