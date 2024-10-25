const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your database connection module


//GET Friends of User by ID
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const query = `
    SELECT u.user_id, u.name, u.email, u.dob, u.gender, u.profilepic
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

//GET STATUS OF A FRIENDSHIP
router.get('/status/:userId1/:userId2', async (req, res) => {
  const userId1 = req.params.userId1;
  const userId2 = req.params.userId2;

  try {
    const query = `
      SELECT status, user_id1, user_id2
      FROM friendships
      WHERE (user_id1 = ? AND user_id2 = ?)
         OR (user_id1 = ? AND user_id2 = ?)
    `;

    const [results] = await db.query(query, [userId1, userId2, userId2, userId1]);
    let result = 'empty';

    if (results.length > 0) {
      for (const row of results) {
        if (row.status === 'accepted') {
          result = 'accepted';
          break;
        } else if (row.status === 'pending') {
          if (row.user_id1 == userId1) {
            result = 'pending';
          } else if (row.user_id1 == userId2) {
            result = 'waiting';
          }
        }
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching user friends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//GET Friends of User by ID who are not part of a Memory yet
router.get('/missingMemory/:memoryId/:userId', async (req, res) => {
  const userId = req.params.userId;
  const memoryId = req.params.memoryId;

  try {
    const query = `
    SELECT u.user_id, u.name, u.email, u.dob, u.gender, u.profilepic
    FROM friendships f
    JOIN users u ON (f.user_id1 = u.user_id OR f.user_id2 = u.user_id)
    WHERE (f.user_id1 = ? OR f.user_id2 = ?) 
    AND f.status = 'accepted'
    AND NOT u.user_id = ?
    AND NOT EXISTS (
      SELECT 1 
      FROM user_has_memory 
      WHERE user_id = u.user_id 
      AND memory_id = ?
    );
    `;

    const [results] = await db.query(query, [userId, userId, userId, memoryId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching user friends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//GET PENDING REQUESTS
router.get('/pending/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const query = `
    SELECT u.user_id, u.name, u.dob, u.gender, u.profilepic
    FROM friendships f
    JOIN users u ON (f.user_id1 = u.user_id OR f.user_id2 = u.user_id)
    WHERE (f.user_id1 = ?) 
      AND f.status = 'pending'
      AND NOT u.user_id = ?;
    `;

    const [results] = await db.query(query, [userId, userId, userId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching user friends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//GET INGOING REQUESTS
router.get('/ingoing/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const query = `
    SELECT u.user_id, u.name, u.dob, u.gender, u.profilepic
    FROM friendships f
    JOIN users u ON (f.user_id1 = u.user_id OR f.user_id2 = u.user_id)
    WHERE (f.user_id2 = ?) 
      AND f.status = 'pending'
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
    await db.query(
      'DELETE FROM friendships WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)',
      [userId1, userId2, userId2, userId1]
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
    // Insert the friendship request into the database
    await db.query(
      'INSERT INTO friendships (user_id1, user_id2, status) VALUES (?, ?, ?)',
      [senderId, receiverId, 'pending']
    );

    res.json({ message: 'Friendship request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/add_friend', async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    await db.query(
      'INSERT INTO friendships (user_id1, user_id2, status) VALUES (?, ?, ?)',
      [senderId, receiverId, 'accepted']
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
    // Update the status of the friendship to "accepted"
    await db.query(
      'UPDATE friendships SET status = ? WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)',
      ['accepted', userId1, userId2, userId2, userId1]
    );

    res.json({ message: 'Friendship request accepted successfully' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;