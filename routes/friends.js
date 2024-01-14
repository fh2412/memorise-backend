const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your database connection module


//GET Routes
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const query = `
        SELECT u.name, u.dob, u.gender, u.profilepic
        FROM friendships f
        JOIN users u ON (f.user_id2 = u.user_id)
        WHERE f.user_id1 = ? AND f.status = 'accepted';
      `;
  
      const [rows] = await db.query(query, [userId]);
  
      if (rows.length > 0) {
        res.json(rows);
      } else {
        res.status(404).json({ message: 'User has no friends' });
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

module.exports = router;