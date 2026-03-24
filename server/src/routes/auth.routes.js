const router = require('express').Router();
const { register, login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login',    authRateLimiter, validate(loginSchema), login);
router.post('/refresh',  authRateLimiter, refreshToken);
router.post('/logout',   authenticate, logout);
router.get('/me',        authenticate, getMe);

module.exports = router;
