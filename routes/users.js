const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your database connection module
const authenticateFirebaseToken = require('../middleware/authMiddleware');
const { validateFirebaseUID, validateUserEmail, validateUserPassword, validateProfilePicUrl, validateUserUpdate } = require('../middleware/validation/validateUsers');
const admin = require('firebase-admin');
const handleValidationErrors = require('../middleware/validationMiddleware');


// GET all users
router.get('/', authenticateFirebaseToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

// GET a single user by ID
router.get('/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found (/:userId)' });
    }
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});


// GET a users Memories
router.get('/:userId/memories', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
  const userId = req.params.userId;

  if (userId !== req.user.uid) {
    return res.status(403).json({ message: 'Forbidden: Access denied' });
  }

  try {
    const [rows] = await db.query(`
    SELECT m.* 
    FROM memories m 
    INNER JOIN user_has_memory um ON m.memory_id = um.memory_id
    WHERE um.user_id = ?`,
      [userId]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'No memories found for this user' });
    }
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});


/**
 * POST a new user
 * @route POST /
 * @description Creates a new user in the MySQL database and associates it with a Firebase UID
 */
router.post('/', validateUserEmail, validateUserPassword, handleValidationErrors, async (req, res) => {
  const { email, displayName, password } = req.body;

  try {
    const firebaseUser = await admin.auth().createUser({
      email,
      displayName,
      password,
    });

    // Generate a custom token for the created Firebase user
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

    // Save the user in the MySQL database
    await db.query('INSERT INTO users (user_id, email) VALUES (?, ?)', [
      firebaseUser.uid,
      email,
    ]);

    res.status(201).json({
      message: 'User created successfully',
      firebaseUid: firebaseUser.uid,
      token: customToken,
    });
  } catch (error) {
    console.error('Error creating user:', error);

    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'Email is already in use in Firebase' });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// PUT (Update) a user by ID
router.put('/:userId', authenticateFirebaseToken, validateFirebaseUID, validateUserUpdate, handleValidationErrors, async (req, res) => {
  const userId = req.params.userId;
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
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

// UPDATE users Profile Picture
router.put('/profilepic/:userId', authenticateFirebaseToken, validateFirebaseUID, validateProfilePicUrl, handleValidationErrors, async (req, res) => {
  const userId = req.params.userId;
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
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});


// DELETE a user by ID
router.delete('/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
  const userId = req.params.userId;
  try {
    await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

//search for users
router.get('/search/users/:userId', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
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