const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Your database connection module
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateFirebaseUID } = require('../../middleware/validation/validateUsers');
const { validateMemoryId } = require('../../middleware/validation/validateMemory');
const { validatePinnedMemoryId } = require('../../middleware/validation/validatePinnedMemory');
const handleValidationErrors = require('../../middleware/validationMiddleware');


//GET a users favourite memories
router.get('/:userId/favourite-memories', authenticateFirebaseToken, validateFirebaseUID, handleValidationErrors, async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(`
      SELECT m.*
      FROM favourite_memories fm
      INNER JOIN memories m ON fm.memory_id = m.memory_id
      WHERE fm.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error fetching favorite memories' });
  }
});

//UPDATE a users favourite memories
router.put('/:userId/favourite-memories/:memoryId', authenticateFirebaseToken, validateFirebaseUID, validateMemoryId, validatePinnedMemoryId, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;
    const memoryIdToUpdate = req.params.memoryId;
    const updatedMemoryId = req.body.memoryId;
  
    // Input validation (optional but recommended)
    if (!userId || !memoryIdToUpdate || !updatedMemoryId) {
      return res.status(400).json({ message: 'Missing required fields in request body or params' });
    }
  
    try {
      const updateResult = await db.query(`
        UPDATE favourite_memories
        SET memory_id = ?
        WHERE user_id = ? AND memory_id = ?`,
        [updatedMemoryId, userId, memoryIdToUpdate]
      );
  
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Favorite memory not found' });
      }
  
      res.json({ message: 'Favorite memory updated successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Error updating favorite memory' });
    }
  });
  

//SET a users favourite memories
router.post('/:userId/favourite-memories', authenticateFirebaseToken, validateFirebaseUID, validatePinnedMemoryId, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;
    const memoryId = req.body.memoryId; // Assuming 'memoryId' is the property name in the request body
  
    // Input validation (optional but recommended)
    if (!userId || !memoryId) {
      return res.status(400).json({ message: 'Missing required fields in request body' });
    }
  
    try {
      const insertResult = await db.query(`
        INSERT INTO favourite_memories (user_id, memory_id)
        VALUES (?, ?)`,
        [userId, memoryId]
      );
  
      res.status(201).json({ message: 'Favorite memory created successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Error creating favorite memory' });
    }
  });
  
//DELETE
router.delete('/:userId/favourite-memories/:memoryId', authenticateFirebaseToken, validateFirebaseUID, validateMemoryId, handleValidationErrors, async (req, res) => {
    const userId = req.params.userId;
    const memoryIdToDelete = req.params.memoryId;
  
    // Input validation (optional but recommended)
    if (!userId || !memoryIdToDelete) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
  
    try {
      const deleteResult = await db.query(`
        DELETE FROM favourite_memories
        WHERE user_id = ? AND memory_id = ?`,
        [userId, memoryIdToDelete]
      );
  
      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Favorite memory not found' });
      }
  
      res.json({ message: 'Favorite memory deleted successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Error deleting favorite memory' });
    }
  });
  
//Check if Memory is someones pinned Memory
router.get('/favourite-memorie/:memoryId', validateMemoryId, handleValidationErrors, async (req, res) => {
  const memoryId = req.params.memoryId;

  try {
    const [rows] = await db.query(`
      SELECT *
      FROM favourite_memories
      WHERE memory_id = ?`,
      [memoryId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error fetching favorite memories' });
  }
});

//DELETE Memory from all Pins
router.delete('/favourite-memorie/:memoryId', authenticateFirebaseToken, validateMemoryId, handleValidationErrors, async (req, res) => {
  const memoryId = req.params.memoryId;

  try {
    const [rows] = await db.query(`
      DELETE FROM favourite_memories
      WHERE memory_id = ?`,
      [memoryId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error fetching favorite memories' });
  }
});

module.exports = router;