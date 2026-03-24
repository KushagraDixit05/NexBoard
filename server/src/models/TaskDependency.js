const mongoose = require('mongoose');

const taskDependencySchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  dependsOn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  type: {
    type: String,
    enum: ['blocks', 'is_blocked_by', 'relates_to', 'duplicates'],
    default: 'blocks',
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

taskDependencySchema.index({ task: 1 });
taskDependencySchema.index({ dependsOn: 1 });

module.exports = mongoose.model('TaskDependency', taskDependencySchema);
