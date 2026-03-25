const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local',
  },
  googleId: { type: String, sparse: true, unique: true },
  githubId: { type: String, sparse: true, unique: true },
  role: {
    type: String,
    enum: ['admin', 'manager', 'user'],
    default: 'user',
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  avatar: { type: String }, // URL or file path
  isActive: { type: Boolean, default: true },
  notificationPreferences: {
    email:      { type: Boolean, default: true },
    inApp:      { type: Boolean, default: true },
    digest:     { type: String, enum: ['none', 'daily', 'weekly'], default: 'none' },
    webhookUrl: { type: String }, // Slack/Discord webhook
  },
  refreshToken: { type: String },
}, { timestamps: true });
// Note: email and username already have unique indexes from the schema definition.

// Remove password when serializing to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
