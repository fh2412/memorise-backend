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

    const [results] = await db.query(query, [userId, userId, userId]);
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
        SELECT u.user_id, u.name, u.gender, u.dob, COUNT(f1.user_id2) AS common_friends_count
        FROM friendships f1
        JOIN friendships f2 ON f1.user_id2 = f2.user_id2 AND f1.user_id1 != f2.user_id1
        JOIN users u ON u.user_id = f2.user_id1
        WHERE f1.user_id1 = ? AND f1.status = 'accepted' AND f2.status = 'accepted'
        GROUP BY u.user_id, u.name
        ORDER BY common_friends_count DESC
        LIMIT 4;
      `;

    const [results] = await db.query(query, [userId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//DELETE
router.delete('/remove_friend/:userId1/:userId2', async (req, res) => {
  const userId1 = req.params.userId1;
  const userId2 = req.params.userId2;

  try {
    // Delete the friendship based on the two user IDs
    await pool.query(
      'DELETE FROM friendships WHERE (user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1)',
      [userId1, userId2]
    );

    res.json({ message: 'Friendship removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//POST
router.post('/send_request', async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Check if the friendship request already exists
    const existingRequest = await pool.query(
      'SELECT * FROM friendship_requests WHERE sender_id = ? AND receiver_id = ?',
      [senderId, receiverId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'Friendship request already sent' });
    }

    // Insert the friendship request into the database
    await pool.query(
      'INSERT INTO friendships (user_id1, user_id2, status) VALUES ($1, $2, $3)',
      [senderId, receiverId, 'pending']
    );

    res.json({ message: 'Friendship request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//PUT
router.put('/accept_request/:userId1/:userId2', async (req, res) => {
  const userId1 = req.params.userId1;
  const userId2 = req.params.userId2;

  try {
    // Check if the friendship request exists
    const friendship = await pool.query(
      'SELECT * FROM friendships WHERE (user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1)',
      [userId1, userId2]
    );

    if (friendship.rows.length === 0) {
      return res.status(404).json({ error: 'Friendship request not found' });
    }

    // Update the status of the friendship to "accepted"
    await pool.query(
      'UPDATE friendships SET status = $1 WHERE (user_id1 = $2 AND user_id2 = $3) OR (user_id1 = $3 AND user_id2 = $2)',
      ['accepted', userId1, userId2]
    );

    res.json({ message: 'Friendship request accepted successfully' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;