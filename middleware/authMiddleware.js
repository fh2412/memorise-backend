const admin = require('firebase-admin');
const logger = require('./logger');

/**
 * Middleware to authenticate Firebase token
 * @description Verifies the token and adds user data to the request object
 */
const authenticateFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const clientIp = req.ip || req.connection.remoteAddress;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Unauthorized: No token provided');
      error.status = 401; // Unauthorized
      error.unauthorized = true; // Optional: Mark as an unauthorized error
      logger.error({
          message: error.message,
          url: req.originalUrl,
          method: req.method,
          ip: clientIp,
      });
      return next(error); // Pass the error to next()
  }

  const token = authHeader.split(' ')[1];

  try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next(); // Success, continue to the next middleware/route
  } catch (error) {
      const authError = new Error('Unauthorized: Invalid token'); // Create a new error
      authError.status = 401;
      authError.unauthorized = true; // Optional: Mark as an unauthorized error
      logger.error(`Error verifying Firebase token: ${error}`);

      // Optionally, you can pass the original Firebase error for more details in your error handler:
      authError.firebaseError = error;

      next(authError); // Pass the error to next()
  }
};

module.exports = authenticateFirebaseToken;
