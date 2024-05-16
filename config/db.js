require('dotenv').config();

const mysql = require('mysql2');

// Create a pool for handling MySQL connections
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Export the pool to be used for queries


module.exports = pool.promise();
