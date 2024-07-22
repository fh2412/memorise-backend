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
        res.json(rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching favorite memories' });
    }
});

module.exports = router;