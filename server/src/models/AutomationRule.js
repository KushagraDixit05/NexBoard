const mongoose = require('mongoose');

/**
 * AutomationRule — defines an "If [trigger] + [conditions], then [action]" rule.
 * Example: If a task is moved to "Done" column, then close the task and notify assignee.
 */
const automationRuleSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name:        { type: String, required: true, trim: true },
  description: { type: String },
  isActive:    { type: Boolean, default: true },

  trigger: {
    event: {
      type: String,
      enum: ['task.create', 'task.move', 'task.update', 'task.close', 'task.assign', 'due_date_passed'],
      required: true,
    },
    conditions: [{
      field:    { type: String }, // 'column', 'assignee', 'priority', 'label'
      operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty'] },
      value:    { type: mongoose.Schema.Types.Mixed },
    }],
  },

  actions: [{
    type: {
      type: String,
      enum: [
        'move_task',
        'assign_user',
        'set_priority',
        'add_label',
        'close_task',
        'send_notification',
        'send_email',
        'trigger_webhook',
      ],
      required: true,
    },
    params: { type: mongoose.Schema.Types.Mixed }, // { targetColumn: ObjectId } etc.
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

automationRuleSchema.index({ project: 1, isActive: 1 });

module.exports = mongoose.model('AutomationRule', automationRuleSchema);
