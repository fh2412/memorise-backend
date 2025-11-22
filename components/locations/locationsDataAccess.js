const db = require('../../config/db');
const logger = require('../../middleware/logger');

const fetchLocationById = async (locationId) => {
    const query = `
      SELECT *
      FROM location
      WHERE location_id = ?
    `;

    try {
        const [rows] = await db.query(query, [locationId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error selecting location(${query}): ${error.message}`);
        throw error;
    }
};

const insertLocation = async ({ longitude, latitude, country, city, countryCode }) => {
    const query = `
      INSERT INTO location (longitude, latitude, country, locality, alpha_2_codes)
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.query(query, [longitude, latitude, country, city, countryCode]);
        return result.insertId;
    } catch (error) {
        logger.error(`Data Access error; Error inserting location (${query}): ${error.message}`);
        throw error;
    }
};

const updateLocation = async (locationId, { longitude, latitude, country, city, countryCode }) => {
    const query = `
      UPDATE location
      SET longitude = ?, latitude = ?, country = ?, locality = ?, alpha_2_codes = ?
      WHERE location_id = ?
    `;
    try {
        const [result] = await db.query(query, [longitude, latitude, country, city, countryCode, locationId]);
        return result;
    } catch (error) {
        logger.error(`Data Access error; Error updating location (${query}): ${error.message}`);
        throw error;
    }
};

module.exports = {
    fetchLocationById,
    insertLocation,
    updateLocation,
}