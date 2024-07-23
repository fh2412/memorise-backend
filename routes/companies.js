const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your database connection module

//GET a users company
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const [rows] = await db.query(`
        SELECT companies.*
        FROM users
        JOIN companies ON users.company_id = companies.id
        WHERE users.user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Company not found for the given user ID' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching favorite memories' });
    }
});


//Leave Company
router.put('/leave/:id', async (req, res) => {
    const userId = req.params.id;
  
    try {
      const updateUserQuery = `
        UPDATE users 
        SET company_id = ?
        WHERE user_id = ?
      `;
      await db.query(updateUserQuery, [null, userId]);
  
      res.status(200).json({ message: 'User left company successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});


//Delete Company
router.delete('/delete/:id', async (req, res) => {
    const companyId = req.params.id;
  
    try {
      const deleteQuery = `
        DELETE FROM companies
        WHERE id = ?
      `;
      await db.query(deleteQuery, [companyId]);
  
      res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});


module.exports = router;