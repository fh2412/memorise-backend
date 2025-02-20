require('dotenv').config();
const mysql = require('mysql2');

const dbConfig = {
  connectionLimit: 10,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// Add Cloud SQL socket path if running in production
if (process.env.INSTANCE_CONNECTION_NAME) {
  dbConfig.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
} else {
  // Use TCP connection for local development
  dbConfig.host = process.env.DB_HOST || 'localhost';
  dbConfig.port = process.env.DB_PORT || 3306;
}

const pool = mysql.createPool(dbConfig);

module.exports = pool.promise();
/*

const dbConfig = {
  connectionLimit: 10,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
};

// Remove the socketPath logic unless needed elsewhere
const pool = mysql.createPool(dbConfig);
module.exports = pool.promise();*/