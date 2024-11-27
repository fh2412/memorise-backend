const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/add-activity', (req, res) => {
    const { title } = req.body; // Extract title from request body
    console.log(req.body);
    // Check if title is provided
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required.' });
    }
    
    // Insert new activity into the database
    const query = 'INSERT INTO activity (title) VALUES (?)';
    db.query(query, [title], (err, result) => {
      if (err) {
        console.error('Error inserting activity: ', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      // Successfully inserted, return the new activity ID
      const activityId = result.insertId;
      res.status(201).json({ activityId: activityId });
    });
  });

module.exports = router;