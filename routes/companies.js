const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your database connection module
const uuid = require('uuid');

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

// Create a new company
router.post('/create/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { name, phone, email, website } = req.body;
  try {
    const result = await db.query('INSERT INTO companies (name, phone, email, website, owner_id) VALUES (?, ?, ?, ?, ?)', [name, phone, email, website, userId]);
    await db.query('UPDATE users SET company_id = ? WHERE user_id = ?', [result[0].insertId, userId]);
    res.status(201).json({ message: 'Company created successfully'});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Update an existing company
router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, email, website } = req.body;
  const query = 'UPDATE companies SET name = ?, phone = ?, email = ?, website = ? WHERE id = ?';
  db.query(query, [name, phone, email, website, id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Database query error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.status(200).json({ id, name, phone, email, website });
  });
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

//SET emplyee TODO
router.put('/owner/:id', async (req, res) => {
  const userId = req.params.id;
  const companyId = req.body

  try {
    const updateUserQuery = `
      UPDATE users 
      SET company_id = ?
      WHERE user_id = ?
    `;
    await db.query(updateUserQuery, [companyId, userId]);

    res.status(200).json({ message: 'User set as company owner successfully' });
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

router.post('/generateCode/:companyId', async (req, res) => {
  const companyId = req.params.companyId;

  const generateCode = async () => {
    const code = uuid.v4();

    try {
      const [results] = await db.execute('INSERT INTO company_codes (code, company_id) VALUES (?, ?)', [code, companyId]);
      return res.status(201).json({ code });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return generateCode(); // Retry if duplicate code
      } else {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
  generateCode();

});

router.put('/joinCompany/:userId', async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.params.userId;

    // Find the code
    const companyCode = await CompanyCode.findOne({ code });
    if (!companyCode) {
      return res.status(404).json({ error: 'Invalid code' });
    }

    // Check if code is already used
    if (companyCode.isUsed) {
      return res.status(400).json({ error: 'Code already used' });
    }

    // Update code and user
    companyCode.isUsed = true;
    await companyCode.save();

    const user = await User.findByIdAndUpdate(userId, { companyId: companyCode.companyId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Joined company successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error joining company' });
  }
});

module.exports = router;