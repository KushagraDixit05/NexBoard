const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            200,             // limit each IP to 200 requests per window
  message:        { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:  false,
});

/**
 * Stricter limiter for auth endpoints (login, register, refresh).
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { error: 'Too many authentication attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:  false,
});

module.exports = rateLimiter;
module.exports.authRateLimiter = authRateLimiter;
