const mysql = require('mysql2');

// Create a pool for handling MySQL connections
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'memorise_dev_user',
  password: 'dev_password',
  database: 'memorise_db'
});

// Export the pool to be used for queries
module.exports = pool.promise();
