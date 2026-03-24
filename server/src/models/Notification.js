const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'task_assigned',
      'task_commented',
      'task_mentioned',
      'task_due_soon',
      'task_overdue',
      'project_invitation',
      'automation_triggered',
    ],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String }, // Frontend URL to navigate to
  isRead:  { type: Boolean, default: false },
  data:    { type: mongoose.Schema.Types.Mixed }, // Additional context data
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
