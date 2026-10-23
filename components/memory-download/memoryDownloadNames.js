// File names inside the ZIP and of the ZIP itself.

/** Removes characters that are invalid on Windows/macOS/Linux and path tricks. */
const sanitize = (name) => String(name ?? '')
  .normalize('NFC')
  .replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_')
  .replace(/^[.\s]+/, '')
  .trim()
  .slice(0, 150);

/** Real extension of the stored original (the upload keeps it, e.g. .png, .heic). */
const extensionOf = (storagePath) => (/\.([a-z0-9]{2,5})$/i.exec(storagePath)?.[1] ?? 'jpg').toLowerCase();

/**
 * Original file names (as on the user's device), unique and case-insensitive
 * ("IMG_0001.jpg", "IMG_0001 (2).jpg"). Fallback: photo_0001.jpg …
 */
const buildEntryNames = (photos) => {
  const used = new Set();
  return photos.map((photo, index) => {
    const ext = extensionOf(photo.storagePath);
    let base = photo.originalFileName ? sanitize(photo.originalFileName.replace(/\.[^.]*$/, '')) : '';
    if (!base) base = `photo_${String(index + 1).padStart(4, '0')}`;

    let name = `${base}.${ext}`;
    for (let n = 2; used.has(name.toLowerCase()); n++) name = `${base} (${n}).${ext}`;
    used.add(name.toLowerCase());
    return name;
  });
};

const zipFileName = (title) => `${sanitize(title) || 'memorise-photos'}.zip`;

/** RFC 6266: ASCII fallback + UTF-8 name (umlauts, emojis in memory titles). */
const contentDisposition = (fileName) => {
  const ascii = [...fileName].map(c => (/[\x20-\x7E]/.test(c) && c !== '"' && c !== '\\' ? c : '_')).join('');
  const utf8 = encodeURIComponent(fileName).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${utf8}`;
};

module.exports = { sanitize, extensionOf, buildEntryNames, zipFileName, contentDisposition };
