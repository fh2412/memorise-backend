const express = require('express');
const router = express.Router();
const { validateShareToken } = require('./memories/memoriesService');
const logger = require('../middleware/logger');

/**
 * GET Open Graph preview for shared memory
 * @route GET /og/memory/:token
 * @description Serves HTML with Open Graph meta tags for memory preview
 */
router.get('/memory/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Validate token and get memory details
        const result = await validateShareToken(token);

        if (!result.valid || !result.memory) {
            // Return fallback OG tags for invalid links
            return res.send(generateFallbackOGHTML());
        }

        const memory = result.memory;
        
        // Generate HTML with OG meta tags
        const html = generateMemoryOGHTML(memory, token);
        res.send(html);

    } catch (error) {
        logger.error(`OG Preview error: ${error.message}`);
        res.send(generateFallbackOGHTML());
    }
});

/**
 * Generate HTML with Open Graph meta tags for a memory
 */
function generateMemoryOGHTML(memory, token) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const shareUrl = `${frontendUrl}/memory/join/${token}`;
    const ogImageUrl = memory.title_pic || `${frontendUrl}/assets/default-memory.jpg`;
    
    // Format dates nicely
    const memoryDate = memory.memory_date 
        ? new Date(memory.memory_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : '';

    const description = memory.text 
        ? memory.text.substring(0, 200) + (memory.text.length > 200 ? '...' : '')
        : `Join ${memory.username}'s memory from ${memoryDate}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${memory.title} - Memory Shared by ${memory.username}</title>
    <meta name="title" content="${escapeHtml(memory.title)}">
    <meta name="description" content="${escapeHtml(description)}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${shareUrl}">
    <meta property="og:title" content="${escapeHtml(memory.title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Memories">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${shareUrl}">
    <meta property="twitter:title" content="${escapeHtml(memory.title)}">
    <meta property="twitter:description" content="${escapeHtml(description)}">
    <meta property="twitter:image" content="${ogImageUrl}">

    <!-- Additional Meta -->
    <meta name="author" content="${escapeHtml(memory.username)}">
    ${memoryDate ? `<meta property="article:published_time" content="${memory.memory_date}">` : ''}
    
    <!-- Redirect to Angular app -->
    <meta http-equiv="refresh" content="0;url=${shareUrl}">
    <script>
        window.location.href = '${shareUrl}';
    </script>
</head>
<body>
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>${escapeHtml(memory.title)}</h1>
        <p>Redirecting you to the memory...</p>
        <p>If you're not redirected, <a href="${shareUrl}">click here</a>.</p>
    </div>
</body>
</html>`;
}

/**
 * Generate fallback HTML for invalid/expired tokens
 */
function generateFallbackOGHTML() {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>Memory Invitation</title>
    <meta name="title" content="You've been invited to join a memory!">
    <meta name="description" content="Share photos and memories with friends and family.">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${frontendUrl}">
    <meta property="og:title" content="You've been invited to join a memory!">
    <meta property="og:description" content="Share photos and memories with friends and family.">
    <meta property="og:image" content="${frontendUrl}/assets/default-memory.jpg">
    <meta property="og:site_name" content="Memories">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="You've been invited to join a memory!">
    <meta property="twitter:description" content="Share photos and memories with friends and family.">
    
    <meta http-equiv="refresh" content="0;url=${frontendUrl}">
</head>
<body>
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>Memory Invitation</h1>
        <p>Redirecting...</p>
    </div>
</body>
</html>`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = router;