const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());

// Define routes (separate files for better organization)
const usersRoutes = require('./routes/users');
const memoriesRoutes = require('./routes/memories');
const friendsRoutes = require('./routes/friends');
const memoryStatsRoutes = require('./routes/memorystats');
const locationRoutes = require('./routes/locations');
const firestoreRoutes = require('./routes/firestore');
const betaUserRoutes = require('./routes/betaUsers');

app.use('/api/users', usersRoutes);
app.use('/api/memories', memoriesRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/memorystats', memoryStatsRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/firestore', firestoreRoutes);
app.use('/api/betausers', betaUserRoutes);

// Wrap in exports for deployment
exports.api = functions.https.onRequest(app);
