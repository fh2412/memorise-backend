require('dotenv').config();
const logger = require('../middleware/logger');
const { initializeApp, getApps, getApp, cert } = require('firebase-admin/app');

let firebaseApp = null;

async function loadServiceAccountKey() {
    if (process.env.NODE_ENV === 'production') {
        logger.info('Get the secret from Secret Manager (Cloud Run)');
        const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
        const client = new SecretManagerServiceClient();
        const name = `projects/${process.env.GCP_PROJECT_ID}/secrets/${process.env.FB_SERVICEACCOUNT_SECRET_NAME}/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        return JSON.parse(version.payload.data.toString());
    }

    logger.warn('Loading service account key locally (for local development)');
    return require(process.env.FB_SERVICEACCOUNT);
}

async function initializeFirebaseAdmin() {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Prevent re-initialization if already initialized
        if (getApps().length) {
            firebaseApp = getApp();
        } else {
            const serviceAccountKey = await loadServiceAccountKey();
            firebaseApp = initializeApp({
                credential: cert(serviceAccountKey),
                storageBucket: process.env.FB_BUCKET
            });
        }

        logger.info('Firebase Admin initialized successfully.');
        return firebaseApp;
    } catch (error) {
        logger.error({ err: error }, 'Error initializing Firebase Admin');
        throw error;
    }
}

function getFirebaseAdmin() {
    if (!firebaseApp) {
        throw new Error('Firebase Admin not initialized. Call initializeFirebaseAdmin() first.');
    }
    return firebaseApp;
}

// Service helpers (replacement for the removed admin.auth() / admin.firestore() / admin.storage())
// Remove the ones you don't use.
function getFirebaseAuth() {
    const { getAuth } = require('firebase-admin/auth');
    return getAuth(getFirebaseAdmin());
}

function getFirebaseFirestore() {
    const { getFirestore } = require('firebase-admin/firestore');
    return getFirestore(getFirebaseAdmin());
}

function getFirebaseStorage() {
    const { getStorage } = require('firebase-admin/storage');
    return getStorage(getFirebaseAdmin());
}

module.exports = {
    initializeFirebaseAdmin,
    getFirebaseAdmin,
    getFirebaseAuth,
    getFirebaseFirestore,
    getFirebaseStorage
};