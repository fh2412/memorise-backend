const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your database connection module

// SQL Queries
const GET_ALL_USERS_QUERY = 'SELECT * FROM users';
const GET_USER_BY_ID_QUERY = 'SELECT * FROM users WHERE user_id = ?';
const GET_USER_BY_EMAIL_QUERY = `SELECT user_id, email,bio,name, gender, location_id, DATE_FORMAT(dob, '%d/%m/%Y') AS formatted_dob,profilepic,country,username,instagram FROM users WHERE email = ?`;
const GET_USER_MEMORIES_QUERY = `SELECT m.* FROM memories m INNER JOIN user_has_memory um ON m.memory_id = um.memory_id WHERE um.user_id = ?`;
const CHECK_USER_EMAIL_EXISTS_QUERY = 'SELECT * FROM users WHERE email = ?';
const INSERT_NEW_USER_QUERY = 'INSERT INTO users (email) VALUES (?)';
const UPDATE_USER_QUERY = `UPDATE users SET name = ?, bio = ?, dob = ?, gender = ?, country = ?, username = ?, instagram = ? WHERE user_id = ?`;
const UPDATE_USER_PROFILE_PIC_QUERY = `UPDATE users SET profilepic = ?WHERE user_id = ?`;
const DELETE_USER_BY_ID_QUERY = 'DELETE FROM users WHERE id = ?';
const SEARCH_USERS_QUERY = `SELECT u.email, u.username, u.name, u.user_idFROM users uWHERE u.user_id <> ? AND u.user_id NOT IN (SELECT user_id1 FROM friendships WHERE user_id2 = ? UNION ALL SELECT user_id2 FROM friendships WHERE user_id1 = ?) AND ( u.email LIKE ? OR u.username LIKE ? OR u.name LIKE ? ) LIMIT 5;`;

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(GET_ALL_USERS_QUERY);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single user by ID
router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.query(GET_USER_BY_ID_QUERY, [userId]);
    if (rows.length > 0) {
      res.json(rows);
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
    const [rows] = await db.query(GET_USER_BY_EMAIL_QUERY, [userEmail]);
    if (rows.length > 0) {
      res.json(rows); // Sending the first user found with that email
    } else {
      res.status(404).json({ message: 'User not found (/email/:email)' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a user's Memories
router.get('/:userId/memories', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(GET_USER_MEMORIES_QUERY, [userId]);
    if (rows.length > 0) {
      res.json(rows); // Sending the first user found with that email
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
    const [existingUser] = await db.query(CHECK_USER_EMAIL_EXISTS_QUERY, [email]);

    if (existingUser.length > 0) {
      // If the email is already taken, return an error response
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // If no user exists with that email, proceed to insert the new user
    await db.query(INSERT_NEW_USER_QUERY, [email]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
});

// PUT (Update) a user by ID
router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, bio, dob, gender, country, username, instagram } = req.body;

  // Extracting DAY, MONTH, YEAR from the provided DOB string (format: DD/MM/YYYY)

  try {
    // Update user's name, dob, gender, and location in the database
    await db.query(UPDATE_USER_QUERY, [name, bio, `${year}-${month}-${day}`, gender, country, username, instagram, userId]);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE user's Profile Picture
router.put('/profilepic/:id', async (req, res) => {
  const userId = req.params.id;
  const { profilepic } = req.body;

  try {
    await db.query(UPDATE_USER_PROFILE_PIC_QUERY, [profilepic, userId]);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a user by ID
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    await db.query(DELETE_USER_BY_ID_QUERY, [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search for users
router.get('/search/users/:userId', async (req, res) => {
  try {
    const searchTerm = req.query.term;
    const userId = req.params.userId;

    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    // Escape the search term to prevent SQL injection attacks
    const escapedTerm = `%${searchTerm.replace(/[\\%_\&,\/;'\*!()+=\${}:'<@\]^~|#?]/g, '\\$&')}%`;


    const [results] = await db.query(SEARCH_USERS_QUERY, [userId, userId, userId, escapedTerm, escapedTerm, escapedTerm]);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
