const archiver = require('archiver');
const db = require('../../config/db');
const logger = require('../../middleware/logger');
const { httpError } = require('../../utils/httpError');
const { getFirebaseAdmin } = require('../../config/firebaseAdmin');
const { canUserAccessMemoryDb, memoryExistsDb } = require('../memory-uploads/memoryUploadsDatalink');
const { getMemoryTitleDb, listPhotosForDownloadDb } = require('./memoryDownloadDatalink');
const { createTicket, verifyTicket, TICKET_TTL_SECONDS } = require('./memoryDownloadTicket');
const { buildEntryNames, zipFileName, contentDisposition } = require('./memoryDownloadNames');

const getBucket = () => {
  const name = process.env.FIREBASE_STORAGE_BUCKET;
  const admin = getFirebaseAdmin();
  return name ? admin.storage().bucket(name) : admin.storage().bucket();
};

/** Creator + members only (same rule as viewing photos). */
const loadDownload = async (memoryId, userId, photoIds) => {
  if (!(await canUserAccessMemoryDb(db, memoryId, userId))) {
    if (!(await memoryExistsDb(db, memoryId))) throw httpError(404, 'Memory not found', 'MEMORY_NOT_FOUND');
    throw httpError(403, 'No permission for this memory', 'FORBIDDEN');
  }

  const [title, photos] = await Promise.all([
    getMemoryTitleDb(db, memoryId),
    listPhotosForDownloadDb(db, memoryId, photoIds?.length ? photoIds : null),
  ]);
  if (photos.length === 0) throw httpError(404, 'No photos to download', 'NO_PHOTOS');
  return { title, photos };
};

/** Step 1 (app, with Bearer token): validates everything, returns a 2-minute ticket. */
const createDownloadTicket = async (memoryId, userId, photoIds) => {
  try {
    const { photos } = await loadDownload(memoryId, userId, photoIds);
    return {
      ticket: createTicket(memoryId, userId),
      fileCount: photos.length,
      totalBytes: photos.reduce((sum, p) => sum + p.sizeBytes, 0),
      expiresInSeconds: TICKET_TTL_SECONDS,
    };
  } catch (error) {
    if (!error.status) logger.error(`Service error; createDownloadTicket: ${error.message}`);
    throw error;
  }
};

/**
 * Step 2 (browser, with ticket): streams the ZIP.
 * - No compression (store): JPEG/HEIC don't get smaller, level 9 only burned CPU.
 * - One file at a time straight from Storage → constant memory, any memory size.
 * - Errors/aborts end the response instead of crashing the process.
 */
const streamDownload = async ({ memoryId, ticket, photoIds, res }) => {
  const verified = verifyTicket(ticket, memoryId);
  if (!verified) throw httpError(401, 'Download link expired. Please try again.', 'TICKET_INVALID');

  const { title, photos } = await loadDownload(memoryId, verified.userId, photoIds);
  const names = buildEntryNames(photos);

  // The response is a file download in a hidden iframe of the app → drop helmet's frame/CORP headers.
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Cross-Origin-Resource-Policy');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', contentDisposition(zipFileName(title)));
  res.setHeader('Cache-Control', 'no-store');

  const archive = archiver('zip', { store: true });
  let stopped = false;
  let resolveStopped;
  const stoppedPromise = new Promise(resolve => { resolveStopped = resolve; });

  const stop = (reason) => {
    if (stopped) return;
    stopped = true;
    if (reason) logger.warn(`Download of memory ${memoryId} stopped: ${reason}`);
    archive.abort();
    res.destroy();
    resolveStopped();
  };

  archive.on('warning', err => logger.warn(`ZIP warning (memory ${memoryId}): ${err.message}`));
  archive.on('error', err => stop(`archive error: ${err.message}`));
  res.on('close', () => { if (!res.writableFinished) stop('client disconnected'); });
  archive.pipe(res);

  const bucket = getBucket();
  for (let i = 0; i < photos.length && !stopped; i++) {
    const photo = photos[i];
    const entryDone = new Promise(resolve => archive.once('entry', resolve));

    const source = bucket.file(photo.storagePath).createReadStream();
    source.on('error', err => stop(`reading ${photo.storagePath}: ${err.message}`));
    archive.append(source, { name: names[i], date: photo.createdAt });

    await Promise.race([entryDone, stoppedPromise]);
  }

  if (!stopped) await archive.finalize();
};

module.exports = { createDownloadTicket, streamDownload };
