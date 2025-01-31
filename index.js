const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080; // Define the port for the server
const functions = require('firebase-functions/v2');
const apiLimiter = require('./middleware/rateLimiter');
const helmetConfig = require('./middleware/helmetConfig');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandling/errorHandler');

// Middleware setup
//app.use(pinoHttp({ logger }));
app.use(cors());
app.use(bodyParser.json());
app.use(apiLimiter);
app.use(helmetConfig);

// Define components (separate files for better organization)
const usersRoutes = require('./components/users/usersController');
const memoriesRoutes = require('./components/memories/memoriesController');
const friendsRoutes = require('./components/friends/friendsController');
const memoryStatsRoutes = require('./components/memorystats/memoryStatsController');
const locationRoutes = require('./components/locations/locationsController');
//const firestoreRoutes = require('./components/firestore');
const pinnedMemoriesRoutes = require('./components/pinned-memories/pinnedMemoriesController');
const companyRoutes = require('./components/companies/companiesController');
const imageGalleryRoutes = require('./components/image-gallery/imageGalleryController');
const activityRoutes = require('./components/activities/activitiesController');

app.use('/api/users', usersRoutes); // Mount users components at /api/users
app.use('/api/memories', memoriesRoutes); // Mount memories components at /api/memories
app.use('/api/friends', friendsRoutes); // Mount memories components at /api/memories
app.use('/api/memorystats', memoryStatsRoutes);
app.use('/api/locations', locationRoutes);
//app.use('/api/firestore', firestoreRoutes);
app.use('/api/pinned', pinnedMemoriesRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/gallery', imageGalleryRoutes);
app.use('/api/activity', activityRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

//Central Error Handler after all Route Handlers
app.use(errorHandler);

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Graceful Shutdown Logic
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  // Optionally, close database connections or other services here
  server.close(() => {
      logger.info('Closed all connections.');
      process.exit(0);
  });

  // If still alive after 10 seconds, force shutdown
  setTimeout(() => {
      logger.error('Force shutdown due to timeout');
      process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

exports.api = functions.https.onRequest(app);

// In case of uncaught exceptions or unhandled rejections, log them and gracefully shutdown
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});
