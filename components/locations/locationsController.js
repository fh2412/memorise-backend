const express = require('express');
const router = express.Router();
const logger = require('../../middleware/logger');
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const { validateLocationId, validateCreateLocation } = require('../../middleware/validation/validateLocation');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { getLocationByIdService, createLocationService, updateLocationService } = require('./locationsService');

/**
 * GET location by id
 * @route GET /:locationId
 * @description get a location by its id
 */
router.get('/:locationId', authenticateFirebaseToken, validateLocationId, handleValidationErrors, async (req, res, next) => {
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
        next(error);
    }
});

/**
* POST create new location
* @route POST /createLocation
* @description creates a new location in the database
*/
router.post('/createLocation', authenticateFirebaseToken, validateCreateLocation, handleValidationErrors, async (req, res, next) => {
    const { country, countryCode, city, latitude, longitude } = req.body;

    try {
        const locationId = await createLocationService({ country, countryCode, city, latitude, longitude });
        res.json({ message: 'Location created successfully', locationId: locationId });
    } catch (error) {
        logger.error(`Controller error; LOCATION POST /createLocation: ${error.message}`);
        next(error);
    }
});

/**
* PUT create new location
* @route PUT /updateLocation/:locationId
* @description creates a new location in the database
*/
router.put('/updateLocation/:locationId', authenticateFirebaseToken, validateLocationId, validateCreateLocation, handleValidationErrors, async (req, res, next) => {
    const locationId = req.params.locationId;
    const { country, countryCode, city, latitude, longitude } = req.body;

    try {
        const updateResult = await updateLocationService(locationId, { country, countryCode, city, latitude, longitude });

        if (!updateResult) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.json({ message: 'Location updated successfully' });
    } catch (error) {
        logger.error(`Controller error; LOCATION PUT /updateLocation/:locationId: ${error.message}`);
        next(error);
    }
});

module.exports = router;
