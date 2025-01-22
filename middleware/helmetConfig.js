const helmet = require('helmet');

const isProduction = process.env.NODE_ENV === 'production';
const domain = isProduction ? 'memorise.online' : 'localhost';

// Define content security policy
const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
        "'self'",
        'https://maps.googleapis.com', // Google Maps
        'https://www.gstatic.com', // Firebase
        'https://cdn.firebase.com', // Firebase
    ],
    styleSrc: [
        "'self'",
        "'unsafe-inline'", // For inline styles (if needed)
        'https://fonts.googleapis.com', // Google Fonts (if used)
    ],
    imgSrc: [
        "'self'",
        'data:', // For base64 encoded images
        'https://maps.googleapis.com', // Google Maps
        'https://firebasestorage.googleapis.com', // Firebase Storage
    ],
    connectSrc: [
        "'self'",
        `https://${domain}`, // Your API, depending on environment
        'https://maps.googleapis.com', // Google Maps API
        'https://firestore.googleapis.com', // Firebase
    ],
    fontSrc: [
        "'self'",
        'https://fonts.gstatic.com', // Google Fonts (if used)
    ],
    objectSrc: ["'none'"], // Prevents loading of any plugins (like Flash)
    frameSrc: ["'self'"], // Prevents clickjacking by allowing only your domain
};

module.exports = helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: cspDirectives,
    },
    frameguard: { action: 'sameorigin' }, // Protects against clickjacking
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Limits referrer data
    dnsPrefetchControl: { allow: false }, // Controls DNS prefetching
    xssFilter: true, // Adds small XSS protections
    hidePoweredBy: true, // Hides the X-Powered-By header
    noSniff: true, // Prevents MIME type sniffing
});
