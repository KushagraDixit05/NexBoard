const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [250, 'Task title cannot exceed 250 characters'],
  },
  description: { type: String }, // Markdown content
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Column',
    required: true,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  swimlane:  { type: mongoose.Schema.Types.ObjectId, ref: 'Swimlane' },
  assignee:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creator:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position:  { type: Number, default: 0 },
  color:     { type: String, default: '#ffffff' },
  priority:  { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate:   { type: Date },
  startDate: { type: Date },
  completedAt: { type: Date },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'archived'],
    default: 'open',
  },
  timeEstimated: { type: Number, default: 0 }, // in minutes
  timeSpent:     { type: Number, default: 0 },  // in minutes
  labels:        [{ type: String }],
  isRecurring:   { type: Boolean, default: false },
  recurringConfig: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval:  { type: Number },
    nextDue:   { type: Date },
  },
  customFields: [{
    fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomField' },
    value:   { type: mongoose.Schema.Types.Mixed },
  }],
}, { timestamps: true });

taskSchema.index({ column: 1, position: 1 });
taskSchema.index({ board: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' }); // Full-text search

module.exports = mongoose.model('Task', taskSchema);
