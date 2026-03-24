const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Subtask title is required'],
    trim: true,
    maxlength: [250, 'Subtask title cannot exceed 250 characters'],
  },
  status:    { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  assignee:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  position:  { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // in minutes
}, { timestamps: true });

subtaskSchema.index({ task: 1, position: 1 });

module.exports = mongoose.model('Subtask', subtaskSchema);
