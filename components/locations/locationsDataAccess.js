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

/**
 * Executes autocomplete queries using the Places API (New)
 * Endpoint: POST https://places.googleapis.com/v1/places:autocomplete
 */
const fetchAutocompleteFromGoogle = async (input) => {
    const apiKey = process.env.GOOGLE_PLACES_KEY;
    const url = 'https://places.googleapis.com/v1/places:autocomplete';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                // Requesting only the fields we need to optimize pricing
                'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat'
            },
            body: JSON.stringify({ input })
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`Google API responded with status ${response.status}: ${errorBody.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (!data.suggestions || data.suggestions.length === 0) {
            return [];
        }

        // --- TRANSFORMATION LAYER ---
        // Map the new payload structure to match your legacy Flutter models exactly
        return data.suggestions
            .filter(s => s.placePrediction) // Ensure it is a place prediction, not a query suggestion
            .map(s => {
                const pred = s.placePrediction;
                return {
                    description: pred.text?.text || '',
                    place_id: pred.placeId || '',
                    structured_formatting: {
                        main_text: pred.structuredFormat?.mainText?.text || ''
                    }
                };
            });

    } catch (error) {
        logger.error(`Data Access error; Error fetchAutocompleteFromGoogle: ${error.message}`);
        throw error;
    }
};

const fetchPlaceDetailsFromGoogle = async (placeId) => {
    const apiKey = process.env.GOOGLE_PLACES_KEY;
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'id,location,formattedAddress,addressComponents'
            }
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`Google API responded with status ${response.status}: ${errorBody.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (!data || !data.location) return null;

        // Parse Google-specific components here
        let country = '';
        let countryCode = '';
        let city = null;

        if (data.addressComponents) {
            for (const component of data.addressComponents) {
                if (component.types.includes('country')) {
                    country = component.longText;
                    countryCode = component.shortText;
                }
                if (component.types.includes('locality') || component.types.includes('postal_town')) {
                    city = component.longText;
                }
            }
        }

        return {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            address: data.formattedAddress || '',
            country: country,
            alpha_2_codes: countryCode,
            locality: city,
            location_id: 1
        };
    } catch (error) {
        logger.error(`Data Access error; Error fetchPlaceDetailsFromGoogle: ${error.message}`);
        throw error;
    }
};



module.exports = {
    fetchLocationById,
    insertLocation,
    updateLocation,
    fetchAutocompleteFromGoogle,
    fetchPlaceDetailsFromGoogle
}