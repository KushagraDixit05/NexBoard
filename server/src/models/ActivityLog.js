const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  task:     { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:   { type: String, required: true }, // 'task.create', 'task.move', 'comment.create', etc.
  details:  { type: mongoose.Schema.Types.Mixed }, // { from: 'To Do', to: 'In Progress' }
  entityType: {
    type: String,
    enum: ['task', 'board', 'column', 'project', 'comment', 'subtask', 'attachment'],
  },
  entityId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ task: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
