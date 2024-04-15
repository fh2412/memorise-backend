const mysql = require('mysql2');

// Create a pool for handling MySQL connections
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'memorise_dev_user',
  password: 'Wiispielen402',
  database: 'memorise_gc_db'
  /*user: 'memorise_dev_user', // e.g. 'my-db-user'
  password: 'Wiispielen402', // e.g. 'my-db-password'
  database: 'memorise_gc_db', // e.g. 'my-database'
  socketPath: '/cloudsql/memorise-414417:europe-west3:memorise'*/
});

// Export the pool to be used for queries


module.exports = pool.promise();
