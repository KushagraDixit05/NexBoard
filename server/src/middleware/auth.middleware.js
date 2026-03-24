const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = { authenticate };
