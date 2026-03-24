require('dotenv').config();

module.exports = {
  PORT:                     process.env.PORT || 5000,
  MONGODB_URI:              process.env.MONGODB_URI || 'mongodb://localhost:27017/nexboard',
  JWT_SECRET:               process.env.JWT_SECRET || 'dev-secret-change-me',
  JWT_EXPIRES_IN:           process.env.JWT_EXPIRES_IN || '24h',
  REFRESH_TOKEN_SECRET:     process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-change-me',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  SMTP_HOST:                process.env.SMTP_HOST,
  SMTP_PORT:                parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER:                process.env.SMTP_USER,
  SMTP_PASS:                process.env.SMTP_PASS,
  UPLOAD_DIR:               process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE:            parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  CORS_ORIGIN:              process.env.CORS_ORIGIN || 'http://localhost:3000',
  NODE_ENV:                 process.env.NODE_ENV || 'development',
};
