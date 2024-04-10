const mysql = require('mysql2');

// Create a pool for handling MySQL connections
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'memorise-414417:europe-west3:memorise',
  user: 'memorise_dev_user',
  password: 'Wiispielen402',
  database: 'memorise_gc_db'
});

// Export the pool to be used for queries
module.exports = pool.promise();
