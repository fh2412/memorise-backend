const express = require('express');
const router = express.Router();
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const logger = require('../../middleware/logger');
const { getCompanyByUserId, createCompanyForUser, generateUniqueCompanyCode, updateCompanyDetails, leaveCompany, setCompanyOwner, joinCompanyService, deleteCompanyService } = require('./companiesService');

/**
 * GET users company
 * @route GET /:userId
 * @description gets the company of a user by his id
 */
router.get('/:userId', authenticateFirebaseToken, async (req, res) => {
    const userId = req.params.userId;
    try {
        const company = await getCompanyByUserId(userId);
        if (!company) {
            return res.status(404).json({ error: 'Company not found for the given user ID' });
        }
        res.json(company);
    } catch (error) {
        logger.error('Controller error:', error.message);
        res.status(500).json({ message: 'Error fetching user\'s company' });
    }
});

/**
 * POST new company
 * @route POST /create/:userId
 * @description creates a new company
 */
router.post('/create/:userId', authenticateFirebaseToken, async (req, res) => {
    const userId = req.params.userId;
    const { name, phone, email, website } = req.body;

    try {
        await createCompanyForUser(userId, { name, phone, email, website });
        res.status(201).json({ message: 'Company created successfully' });
    } catch (error) {
        console.error('Controller error:', error.message);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * POST new company code
 * @route POST /generateCode/:companyId
 * @description creates a new company code and safes it to the database
 */
router.post('/generateCode/:companyId', authenticateFirebaseToken, async (req, res) => {
    const companyId = req.params.companyId;

    try {
        const code = await generateUniqueCompanyCode(companyId);
        res.status(201).json({ code });
    } catch (error) {
        console.error('Controller error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT updates company
 * @route PUT /update/:id
 * @description updates the data of an company
 */
router.put('/update/:id', authenticateFirebaseToken, async (req, res) => {
    const { id } = req.params;
    const { name, phone, email, website } = req.body;

    try {
        const updatedCompany = await updateCompanyDetails(id, { name, phone, email, website });
        if (!updatedCompany) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json(updatedCompany);
    } catch (error) {
        console.error('Controller error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT user leaves company
 * @route PUT /leave/:id
 * @description updates users company to zero when he leafes his current
 */
router.put('/leave/:id', authenticateFirebaseToken, async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await leaveCompany(userId);
        if (result) {
            res.status(200).json({ message: 'User left company successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Controller error:', error.message);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * PUT updates company owner
 * @route PUT /owner/:id
 * @description updates a companies owner
 */
router.put('/owner/:id', authenticateFirebaseToken, async (req, res) => {
    const userId = req.params.id;
    const { companyId } = req.body;

    try {
        const result = await setCompanyOwner(userId, companyId);
        if (result) {
            res.status(200).json({ message: 'User set as company owner successfully' });
        } else {
            res.status(404).json({ message: 'User or Company not found' });
        }
    } catch (error) {
        console.error('Controller error:', error.message);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
 * PUT user joins company
 * @route PUT /joinCompany/:userId
 * @description puts a companies id to the users table to let him join the company
 */
router.put('/joinCompany/:userId', authenticateFirebaseToken, async (req, res) => {
    const { code } = req.body;
    const userId = req.params.userId;

    try {
        const result = await joinCompanyService(userId, code);
        if (result.success) {
            res.status(200).json({ message: 'Joined company successfully' });
        } else {
            res.status(result.status).json({ error: result.error });
        }
    } catch (error) {
        console.error('Controller error:', error.message);
        res.status(500).json({ error: 'Error joining company' });
    }
});

/**
 * DELETE deletes a company
 * @route DELETE /delete/:id
 * @description deletes a company by id
 */
router.delete('/delete/:id', authenticateFirebaseToken, async (req, res) => {
    const companyId = req.params.id;

    try {
        const result = await deleteCompanyService(companyId);
        if (result.success) {
            res.status(200).json({ message: 'Company deleted successfully' });
        } else {
            res.status(result.status).json({ error: result.error });
        }
    } catch (error) {
        console.error('Controller error:', error.message);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

module.exports = router;