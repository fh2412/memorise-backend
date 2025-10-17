const express = require('express');
const router = express.Router();
const { validateShareToken } = require('./memories/memoriesService');
const logger = require('../middleware/logger');

// Install html-entities if you don't have it
// npm install html-entities

const { encode } = require('html-entities');

// Helper function to sanitize text for HTML
function sanitizeForHTML(text) {
  if (!text) return '';
  // Encode HTML entities to prevent XSS
  return encode(String(text), { mode: 'nonAsciiPrintable', level: 'html5' });
}

// Helper function to sanitize URLs
function sanitizeUrl(url) {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return '';
    }
    return encode(url, { mode: 'nonAsciiPrintable', level: 'html5' });
  } catch (e) {
    return e;
  }
}

function generateMemoryOGHTML(memory, token) {
  // Sanitize all user-provided data
  const title = sanitizeForHTML(memory.title || 'Shared Memory');
  const description = sanitizeForHTML(memory.description || 'View this shared memory');
  const imageUrl = sanitizeUrl(memory.imageUrl || memory.coverImage);
  const shareUrl = sanitizeForHTML(`${process.env.FRONTEND_URL}/shared/${token}`);
  
  // Build HTML with sanitized data
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${shareUrl}" />
    <meta property="og:type" content="website" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <!-- Redirect to frontend -->
    <meta http-equiv="refresh" content="0;url=${shareUrl}" />
</head>
<body>
    <p>Redirecting to memory...</p>
    <a href="${shareUrl}">Click here if you are not redirected</a>
</body>
</html>`;
}

function generateFallbackOGHTML() {
  const title = sanitizeForHTML('Memory Not Found');
  const description = sanitizeForHTML('This shared memory link is invalid or has expired');
  const imageUrl = sanitizeUrl(`${process.env.FRONTEND_URL}/default-og-image.jpg`);
  const url = sanitizeForHTML(process.env.FRONTEND_URL);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    
    <!-- Redirect to frontend -->
    <meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body>
    <p>Memory not found. Redirecting...</p>
    <a href="${url}">Click here to go home</a>
</body>
</html>`;
}

router.get('/memory/:token', async (req, res) => {
    const { token } = req.params;
    
    // Validate token format (should be alphanumeric/UUID/etc.)
    if (!isValidTokenFormat(token)) {
        return res.status(400).send(generateFallbackOGHTML());
    }
    
    try {
        // Validate token and get memory details
        const result = await validateShareToken(token);
        if (!result.valid || !result.memory) {
            return res.send(generateFallbackOGHTML());
        }
        const memory = result.memory;
       
        // Generate HTML with OG meta tags (all data sanitized inside)
        const html = generateMemoryOGHTML(memory, token);
        
        // Set security headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline';");
        
        res.send(html);
    } catch (error) {
        logger.error(`OG Preview error: ${error.message}`);
        res.send(generateFallbackOGHTML());
    }
});

// Helper to validate token format
function isValidTokenFormat(token) {
  // Adjust regex based on your token format
  // Example for UUID: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
  // Example for alphanumeric: /^[a-zA-Z0-9_-]{20,100}$/
  const tokenRegex = /^[a-zA-Z0-9_-]{10,128}$/;
  return tokenRegex.test(token);
}

module.exports = router;