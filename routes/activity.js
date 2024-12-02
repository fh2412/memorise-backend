const express = require('express');
const router = express.Router();
const db = require('../config/db');  

  router.post('/add-activity', async (req, res) => {
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


  router.get('/:id', async (req, res) => {
    const activityId = req.params.id;
    try {
      const [rows] = await db.query('SELECT * FROM activity WHERE id = ?', [activityId]);
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ message: 'Activity not found'});
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM activity');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;