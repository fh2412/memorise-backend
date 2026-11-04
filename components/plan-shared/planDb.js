const logger = require('../../middleware/logger');

const run = async (conn, query, params = []) => {
  try {
    const [rows] = await conn.query(query, params);
    return rows;
  } catch (error) {
    logger.error(`Data Access error; (${query.trim().split('\n')[0]}): ${error.message}`);
    throw error;
  }
};

const inList = (values) => values.map(() => '?').join(',');
const toBool = (v) => Number(v) === 1;

const groupBy = (rows, key) => {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r[key])) map.set(r[key], []);
    map.get(r[key]).push(r);
  }
  return map;
};

module.exports = { run, inList, toBool, groupBy };