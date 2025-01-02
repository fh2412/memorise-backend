const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateFirebaseToken = require('../middleware/authMiddleware');
const { validateActivityId, validateCreateActivity } = require('../middleware/validation/validateActivity');


  router.post('/add-activity', validateCreateActivity, async (req, res) => {
    const { title } = req.body;
    try {
      // Insert the friendship request into the database
      const result = await db.query(
        'INSERT INTO activity (title) VALUES (?)',
        [title]
      );
  
      const activityId = result;
  
      res.json({ message: 'Activity created successfully', activityId: activityId });
    } catch (error) {
      console.error('Error creating Activity:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/:activityId', authenticateFirebaseToken, validateActivityId, async (req, res) => {
    const activityId = req.params.activityId;
    try {
      const [rows] = await db.query('SELECT * FROM activity WHERE id = ?', [activityId]);
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ message: 'Activity not found'});
      }
    } catch (error) {
      console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
    }
  });

  router.get('/', authenticateFirebaseToken, async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM activity');
      res.json(rows);
    } catch (error) {
      console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
    }
  });

module.exports = router;