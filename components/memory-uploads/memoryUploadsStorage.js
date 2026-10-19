// Firebase Storage access via firebase-admin (server-side verification + cleanup).
const { getFirebaseAdmin } = require('../../config/firebaseAdmin');
const logger = require('../../middleware/logger');

/**
 * ADJUST: if initializeApp() in config/firebaseAdmin has no `storageBucket`,
 * set FIREBASE_STORAGE_BUCKET (e.g. "memorise-xyz.firebasestorage.app").
 */
const getBucket = () => {
  const admin = getFirebaseAdmin();
  const name = process.env.FIREBASE_STORAGE_BUCKET;
  return name ? admin.storage().bucket(name) : admin.storage().bucket();
};

/**
 * Returns size + custom metadata of an object, or null if it doesn't exist.
 * The size comes from Storage itself → the client can't fake it.
 */
const statObject = async (path) => {
  try {
    const [meta] = await getBucket().file(path).getMetadata();
    return {
      size: Number(meta.size) || 0,
      contentType: meta.contentType || null,
      customMetadata: meta.metadata || {},
    };
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
};

/** Best-effort deletion of objects by prefix (e.g. canceled, never registered uploads). */
const deleteByPrefixes = async (prefixes) => {
  const bucket = getBucket();
  const results = await Promise.allSettled(prefixes.map(prefix => bucket.deleteFiles({ prefix, force: true })));
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      logger.warn(`Storage cleanup failed for prefix ${prefixes[i]}: ${result.reason?.message}`);
    }
  });
};

module.exports = { statObject, deleteByPrefixes };
