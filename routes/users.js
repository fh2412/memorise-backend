const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your database connection module
const authenticateFirebaseToken = require('../middleware/authMiddleware');


// GET all users
router.get('/', authenticateFirebaseToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single user by ID
router.get('/:id', authenticateFirebaseToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found (/:id)' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/email/:email', async (req, res) => {
  const userEmail = req.params.email;

  try {
    const [rows] = await db.query(`
    SELECT 
        user_id, 
        email,
		    bio,
        name, 
        gender, 
        location_id, 
        DATE_FORMAT(dob, '%d/%m/%Y') AS formatted_dob,
        profilepic,
        country,
        username,
        instagram 
    FROM 
        users 
    WHERE 
        email = ?`,
      [userEmail]
    );
    if (rows.length > 0) {
      res.json(rows[0]); // Sending the first user found with that email
    } else {
      res.status(404).json({ message: 'User not found (/email/:email)' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a users Memories
router.get('/:userId/memories', authenticateFirebaseToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(`
    SELECT m.* 
    FROM memories m 
    INNER JOIN user_has_memory um ON m.memory_id = um.memory_id
    WHERE um.user_id = ?`,
      [userId]
    );
    if (rows.length > 0) {
      res.json(rows[0]); // Sending the first user found with that email
    } else {
      res.status(404).json({ message: 'User not found (/:userId/memories)' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST a new user
router.post('/', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if a user with the same email already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      // If the email is already taken, return an error response
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // If no user exists with that email, proceed to insert the new user
    await db.query('INSERT INTO users (email) VALUES (?)', [email]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
});


// PUT (Update) a user by ID
router.put('/:id', authenticateFirebaseToken, async (req, res) => {
  const userId = req.params.id;
  const { name, bio, dob, gender, country, username, instagram } = req.body;

  // Extracting DAY, MONTH, YEAR from the provided DOB string (format: DD/MM/YYYY)

  try {
    // Update user's name, dob, gender, and location in the database
    const updateUserQuery = `
      UPDATE users 
      SET name = ?, bio = ?, dob = ?, gender = ?, country = ?, username = ?, instagram = ?
      WHERE user_id = ?
    `;

    await db.query(updateUserQuery, [name, bio, dob, gender, country, username, instagram, userId]);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE users Profile Picture
router.put('/profilepic/:id', authenticateFirebaseToken, async (req, res) => {
  const userId = req.params.id;
  const { profilepic } = req.body;

  try {
    const updateUserPicQuery = `
      UPDATE users 
      SET profilepic = ?
      WHERE user_id = ?
    `;
    await db.query(updateUserPicQuery, [profilepic, userId]);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE a user by ID
router.delete('/:id', authenticateFirebaseToken, async (req, res) => {
  const userId = req.params.id;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//search for users
router.get('/search/users/:userId', authenticateFirebaseToken, async (req, res) => {
  try {
    const searchTerm = req.query.term;
    const userId = req.params.userId;

    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    // Escape the search term to prevent SQL injection attacks
    const escapedTerm = `%${searchTerm.replace(/[\\%_\&,\/;'\*!()+=\${}:'<@\]^~|#?]/g, '\\$&')}%`;

    const query = `
    SELECT u.email, u.username, u.name, u.user_id, u.dob
    FROM users u
    WHERE u.user_id <> ?
    AND u.user_id NOT IN (
      SELECT user_id1 FROM friendships WHERE user_id2 = ?
      UNION ALL
      SELECT user_id2 FROM friendships WHERE user_id1 = ?
    )
    AND (
      u.email LIKE ? OR u.username LIKE ? OR u.name LIKE ?
    )
    LIMIT 5;
    `;

    const [results] = await db.query(query, [userId, userId, userId, escapedTerm, escapedTerm, escapedTerm]);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;