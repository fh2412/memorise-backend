const admin = require('firebase-admin');

const serviceAccount = require('A:/programming/memorise-910c3-firebase-adminsdk-c4phi-bb250db9f3.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://memorise-910c3.appspot.com'
});

module.exports = admin;