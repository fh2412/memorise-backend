const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your database connection module

router.post('/register', async (req, res) => {
    const email = req.body.email;
    console.log(email);
    // Email validation (basic check)
    if (!email || !email.match(/^[\w-\.]+@[\w-\.]+\.[a-zA-Z]{2,}$/)) {
      return res.status(400).send({ message: 'Invalid email format' });
    }

    try {
        const rows = await db.query(`SELECT * FROM betaUserRequests WHERE email = ?`, 
        [email]
    );
        if (rows[0].length > 0) {
            return res.json({ message: 'Email already exists'});
        } else {
          res.json({ message: 'Email not in use yet!' });


          try {
            // Insert the friendship request into the database
            const result = await db.query(
              'INSERT INTO betaUserRequests (email) VALUES (?)',
              [email]
            );        
            res.json({ message: 'Email added successfully', email: result });
          } catch (error) {
            console.error('Error adding Email:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
  });

module.exports = router;