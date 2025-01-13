const admin = require('firebase-admin');
const logger = require('./logger');

/**
 * Middleware to authenticate Firebase token
 * @description Verifies the token and adds user data to the request object
 */
const authenticateFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.error('Attempted API connect without Firebase token');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to the request object
    next(); // Proceed to the next middleware/route
  } catch (error) {
    logger.error('Error verifying Firebase token:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authenticateFirebaseToken;
