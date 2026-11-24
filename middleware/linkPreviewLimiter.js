// Per-user limit for link previews (the endpoint makes outbound requests).
// Must run AFTER authenticateFirebaseToken so req.user is set.
const rateLimit = require('express-rate-limit');

const linkPreviewLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `lp:${req.user?.uid || req.ip}`,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many link previews, please try again in a few minutes.',
      code: 'LINK_PREVIEW_RATE_LIMIT',
    });
  },
});

module.exports = linkPreviewLimiter;
