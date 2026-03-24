const jwt = require('jsonwebtoken');
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

module.exports = { generateToken, generateRefreshToken, verifyRefreshToken };
