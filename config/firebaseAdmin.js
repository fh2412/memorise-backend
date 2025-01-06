require('dotenv').config();

const admin = require('firebase-admin');

const serviceAccount = require(process.env.FB_SERVICEACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FB_BUCKET
});

module.exports = admin;