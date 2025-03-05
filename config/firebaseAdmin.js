require('dotenv').config(); // Keep this for local development
const logger = require('../middleware/logger');
const admin = require('firebase-admin');

let firebaseAdminInstance = null;

async function initializeFirebaseAdmin() {
    if (firebaseAdminInstance) {
        return firebaseAdminInstance;
    }

    try {
        let serviceAccountKey;
        if (process.env.NODE_ENV === "production") {
            // Check if in Cloud Run
            logger.info("Get the secret from Secret Manager (Cloud Run)");
            const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
            const client = new SecretManagerServiceClient();
            const name = `projects/${process.env.GCP_PROJECT_ID}/secrets/${process.env.FB_SERVICEACCOUNT_SECRET_NAME}/versions/latest`;
            const [version] = await client.accessSecretVersion({name});
            serviceAccountKey = JSON.parse(version.payload.data.toString());
        } else {
            logger.warn("Loading service account key locally (for local development)");
            serviceAccountKey = require(process.env.FB_SERVICEACCOUNT);
        }

        // Prevent re-initialization if already initialized
        if (!admin.apps.length) {
            firebaseAdminInstance = admin.initializeApp({
                credential: admin.credential.cert(serviceAccountKey),
                storageBucket: process.env.FB_BUCKET
            });
        } else {
            firebaseAdminInstance = admin.app();
        }

        console.log('Firebase Admin initialized successfully.');
        return firebaseAdminInstance;
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
        throw error;
    }
}

module.exports = {
    getFirebaseAdmin: () => {
        if (!firebaseAdminInstance) {
            throw new Error('Firebase Admin not initialized. Call initializeFirebaseAdmin() first.');
        }
        return firebaseAdminInstance;
    },
    initializeFirebaseAdmin
};