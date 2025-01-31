require('dotenv').config(); // Keep this for local development
const logger = require('../middleware/logger');
const admin = require('firebase-admin');


async function initializeFirebaseAdmin() {
  try {
    let serviceAccountKey;


    if (process.env.NODE_ENV === 'production') { // Check if in Cloud Run
      logger.info("Get the secret from Secret Manager (Cloud Run)");

      const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
      const client = new SecretManagerServiceClient();

      const name = `projects/${process.env.GCP_PROJECT_ID}/secrets/${process.env.FB_SERVICEACCOUNT_SECRET_NAME}/versions/latest`; // Use environment variables
      const [version] = await client.accessSecretVersion({name});
      serviceAccountKey = JSON.parse(version.payload.data.toString());
    } else {
      logger.warn("Loading service account key locally (for local development)");
      serviceAccountKey = require(process.env.FB_SERVICEACCOUNT); // From file path
    }

    // Initialize Firebase Admin with the credentials
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
      storageBucket: process.env.FB_BUCKET // Keep storage bucket config here
    });

    console.log('Firebase Admin initialized successfully.');
    return admin; // Return the initialized admin instance

  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error; // Re-throw the error to prevent the app from starting
  }
}

let firebaseAdminInstance; // Store the instance
initializeFirebaseAdmin().then(adminInstance => {
    firebaseAdminInstance = adminInstance;
}).catch(err => {
    console.error("Firebase initialization failed", err);
});

module.exports = {
    getFirebaseAdmin: () => firebaseAdminInstance // Function to access the initialized instance
};
