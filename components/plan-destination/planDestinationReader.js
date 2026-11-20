// Read side only (no service imports) → usable from anywhere without require cycles.
const dl = require('./planDestinationDatalink');

const toLocation = (r) => (r.latitude == null || r.longitude == null ? null : {
  lat: Number(r.latitude),               // DECIMAL arrives as string from mysql2
  lng: Number(r.longitude),
  city: r.locality ?? '',
  country: r.country ?? '',
  countryCode: r.alpha_2_codes ?? '',
});

/**
 * API shape: { label, location | null, has_coordinates, source_poll_id } or null.
 * Memories with coordinates but no plan_destination row (older plans, edit page)
 * still have a destination; the label falls back to city / country.
 */
const toApiDestination = (r) => {
  const location = toLocation(r);
  const label = r.label ?? (location ? (location.city || location.country || 'Pinned location') : null);
  if (!label) return null;
  return {
    label,
    location,
    has_coordinates: !!location,
    source_poll_id: r.source_poll_id ?? null,
  };
};

/** Map<memoryId, destination | null>. Works with a connection or the pool (both have .query). */
const loadDestinations = async (conn, memoryIds) => {
  const rows = await dl.findDestinationsDb(conn, memoryIds);
  return new Map(rows.map(r => [Number(r.memory_id), toApiDestination(r)]));
};

module.exports = { toLocation, toApiDestination, loadDestinations };
