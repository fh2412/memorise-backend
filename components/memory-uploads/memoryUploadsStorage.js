const { getStorage } = require('firebase-admin/storage');
const { initializeApp, getApps, getApp } = require('firebase-admin/app');
const logger = require('../../middleware/logger');

const getBucket = () => {
  const name = process.env.FIREBASE_STORAGE_BUCKET;
  const app = getApps().length ? getApp() : initializeApp();
  const storage = getStorage(app);
  return name ? storage.bucket(name) : storage.bucket();
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

const deleteObjects = async (paths) => {
  const bucket = getBucket();
  const results = await Promise.allSettled(paths.map(path => bucket.file(path).delete({ ignoreNotFound: true })));
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      logger.warn(`Storage delete failed for ${paths[i]}: ${result.reason?.message}`);
    }
  });
};

module.exports = { statObject, deleteByPrefixes, deleteObjects };
