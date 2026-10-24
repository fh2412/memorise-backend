const logger = require('../../middleware/logger');
const { listMapMemoriesDb } = require('./memoryMapDatalink');

const toNumber = (value) => (value === null || value === undefined || value === '' ? NaN : Number(value));

/** DB row → API shape. Rows with unusable coordinates are dropped. */
const toMapMemory = (row) => {
  const lat = toNumber(row.latitude);
  const lng = toNumber(row.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return {
    memoryId: Number(row.memory_id),
    title: row.title ?? '',
    startDate: row.start_date,
    endDate: row.end_date,
    coverUrl: row.title_pic || null,
    coverThumbUrl: row.title_pic_thumb || null,
    pictureCount: Number(row.picture_count) || 0,
    lat,
    lng,
    city: row.locality || null,
    country: row.country || null,
    isOwner: Boolean(Number(row.is_owner)),
    isPinned: Boolean(Number(row.is_pinned)),
  };
};

const getMapMemories = async (userId) => {
  try {
    const rows = await listMapMemoriesDb(userId);
    return rows.map(toMapMemory).filter(Boolean);
  } catch (error) {
    logger.error(`Service error; getMapMemories: ${error.message}`);
    throw error;
  }
};

module.exports = { getMapMemories, toMapMemory };
