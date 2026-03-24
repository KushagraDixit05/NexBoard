const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ error: 'User with this email or username already exists.' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password:    hashedPassword,
      displayName: displayName || username,
    });

    const accessToken  = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      user: {
        id:          user._id,
        username:    user.username,
        email:       user.email,
        role:        user.role,
        displayName: user.displayName,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const accessToken  = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: {
        id:          user._id,
        username:    user.username,
        email:       user.email,
        role:        user.role,
        displayName: user.displayName,
        avatar:      user.avatar,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ error: 'Refresh token required.' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const newAccessToken  = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, refreshToken, logout, getMe };
