const router = require('express').Router();
const { register, login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');
const passport = require('passport');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login',    authRateLimiter, validate(loginSchema), login);
router.post('/refresh',  authRateLimiter, refreshToken);
router.post('/logout',   authenticate, logout);
router.get('/me',        authenticate, getMe);

// --- OAuth Google ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/auth?error=OAuthFailed` }), async (req, res) => {
  const user = req.user;
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  
  res.redirect(`${FRONTEND_URL}/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});

// --- OAuth GitHub ---
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/auth?error=OAuthFailed` }), async (req, res) => {
  const user = req.user;
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  
  res.redirect(`${FRONTEND_URL}/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});

module.exports = router;
