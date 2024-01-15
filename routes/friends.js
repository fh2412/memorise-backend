const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your database connection module


//GET Routes
//GET Friends of User by ID
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const query = `
    SELECT u.user_id, u.name, u.dob, u.gender, u.profilepic
    FROM friendships f
    JOIN users u ON (f.user_id1 = u.user_id OR f.user_id2 = u.user_id)
    WHERE (f.user_id1 = ? OR f.user_id2 = ?) 
      AND f.status = 'accepted'
      AND NOT u.user_id = ?;
    `;

    const results = await db.query(query, [userId, userId, userId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching user friends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/friend-suggestions/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const query = `
        SELECT u.user_id, u.name, COUNT(f1.user_id2) AS common_friends_count
        FROM friendships f1
        JOIN friendships f2 ON f1.user_id2 = f2.user_id2 AND f1.user_id1 != f2.user_id1
        JOIN users u ON u.user_id = f2.user_id1
        WHERE f1.user_id1 = ? AND f1.status = 'accepted' AND f2.status = 'accepted'
        GROUP BY u.user_id, u.name
        ORDER BY common_friends_count DESC
        LIMIT 4;
      `;

    const results = await db.query(query, [userId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;