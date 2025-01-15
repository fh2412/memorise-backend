const { fetchLocationById, insertLocation, updateLocation } = require('./locationsDataAccess');
const logger = require('../../middleware/logger');

const getLocationByIdService = async (locationId) => {
    try {
        const location = await fetchLocationById(locationId);
        return location;
    } catch (error) {
        logger.error(`Service error; Error getLocationByIdService: ${error.message}`);
        throw error;
    }
};

const createLocationService = async (locationData) => {
    try {
        return await insertLocation(locationData);
    } catch (error) {
        logger.error(`Service error; Error createLocationService: ${error.message}`);
        throw error;
    }
};

const updateLocationService = async (locationId, locationData) => {
    try {
        const updateResult = await updateLocation(locationId, locationData);
        return updateResult.affectedRows > 0;
    } catch (error) {
        logger.error(`Service error; Error updateLocationService: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getLocationByIdService,
    createLocationService,
    updateLocationService,
}
