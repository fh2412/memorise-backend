const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateLocationId, validateCreateLocation } = require('../../middleware/validation/validateLocation');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getLocationByIdService, createLocationService, updateLocationService } = require('./locationsService');

/**
 * GET location by id
 * @route GET /:locationId
 * @description get a location by its id
 */
router.get('/:locationId', authenticateFirebaseToken, validateLocationId, handleValidationErrors, async (req, res) => {
    const locId = req.params.locationId;

    try {
        const location = await getLocationByIdService(locId);
        if (location) {
            res.json(location);
        } else {
            res.json({ message: 'No Location with this ID' });
        }
    } catch (error) {
        logger.error(`Controller error; LOCATION GET /:locationId: ${error.message}`);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

/**
* POST create new location
* @route POST /createLocation
* @description creates a new location in the database
*/
router.post('/createLocation', authenticateFirebaseToken, validateCreateLocation, handleValidationErrors, async (req, res) => {
    const { lng, lat, l_country, l_city } = req.body;

    try {
        const locationId = await createLocationService({ lng, lat, l_country, l_city });
        console.log("Controller: ", locationId);
        res.json({ message: 'Location created successfully', locationId: locationId });
    } catch (error) {
        logger.error(`Controller error; LOCATION POST /createLocation: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
* PUT create new location
* @route PUT /updateLocation/:locationId
* @description creates a new location in the database
*/
router.put('/updateLocation/:locationId', authenticateFirebaseToken, validateLocationId, validateCreateLocation, handleValidationErrors, async (req, res) => {
    const locationId = req.params.locationId;
    const { lng, lat, l_country, l_city } = req.body;

    try {
        const updateResult = await updateLocationService(locationId, { lng, lat, l_country, l_city });

        if (!updateResult) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.json({ message: 'Location updated successfully' });
    } catch (error) {
        logger.error(`Controller error; LOCATION PUT /updateLocation/:locationId: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
