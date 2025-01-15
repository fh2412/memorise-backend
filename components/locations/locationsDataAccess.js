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

const insertLocation = async ({ lng, lat, l_country, l_city }) => {
    const query = `
      INSERT INTO location (longitude, latitude, country, locality)
      VALUES (?, ?, ?, ?)
    `;

    try {
        const [result] = await db.query(query, [lng, lat, l_country, l_city]);
        console.log("Data Access: ", result);
        return result.insertId;
    } catch (error) {
        logger.error(`Data Access error; Error inserting location (${query}): ${error.message}`);
        throw error;
    }
};

const updateLocation = async (locationId, { lng, lat, l_country, l_city }) => {
    const query = `
      UPDATE location
      SET longitude = ?, latitude = ?, country = ?, locality = ?
      WHERE location_id = ?
    `;

    try {
        const [result] = await db.query(query, [lng, lat, l_country, l_city, locationId]);
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