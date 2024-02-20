const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000; // Define the port for the server

// Middleware setup (if needed)
// app.use(...);

app.use(cors());
app.use(bodyParser.json());

// Define routes (separate files for better organization)
const usersRoutes = require('./routes/users');
const memoriesRoutes = require('./routes/memories');
const friendsRoutes = require('./routes/friends');
const memoryStatsRoutes = require('./routes/memorystats');
const locationRoutes = require('./routes/locations');


app.use('/api/users', usersRoutes); // Mount users routes at /api/users
app.use('/api/memories', memoriesRoutes); // Mount memories routes at /api/memories
app.use('/api/friends', friendsRoutes); // Mount memories routes at /api/memories
app.use('/api/memorystats', memoryStatsRoutes);
app.use('/api/locations', locationRoutes);



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
