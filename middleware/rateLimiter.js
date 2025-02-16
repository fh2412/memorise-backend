const rateLimit = require('express-rate-limit');

// Create a rate limiter middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests, please try again later.' }, // Response when limit is exceeded
});

module.exports = apiLimiter;