const AutomationRule = require('../models/AutomationRule');
const Task = require('../models/Task');
const notificationService = require('./notification.service');
const emailService = require('./email.service');
const webhookService = require('./webhook.service');
const eventEmitter = require('./eventEmitter.service');

/**
 * Evaluate a single condition against a task.
 */
const evaluateCondition = (condition, task) => {
  const { field, operator, value } = condition;
  const taskValue = task[field];

  switch (operator) {
    case 'equals':     return String(taskValue) === String(value);
    case 'not_equals': return String(taskValue) !== String(value);
    case 'contains':   return Array.isArray(taskValue) ? taskValue.includes(value) : String(taskValue).includes(String(value));
    case 'is_empty':   return !taskValue || (Array.isArray(taskValue) && taskValue.length === 0);
    case 'is_not_empty': return !!taskValue && (!Array.isArray(taskValue) || taskValue.length > 0);
    default: return false;
  }
};

/**
 * Execute a single automation action on a task.
 */
const executeAction = async (action, task, triggerUser) => {
  const { type, params } = action;

  switch (type) {
    case 'move_task':
      if (params?.targetColumn) {
        await Task.findByIdAndUpdate(task._id, { column: params.targetColumn });
      }
      break;

    case 'assign_user':
      if (params?.userId) {
        await Task.findByIdAndUpdate(task._id, { assignee: params.userId });
        eventEmitter.emit('task.assign', { task, user: triggerUser, assignee: params.userId });
      }
      break;

    case 'set_priority':
      if (params?.priority) {
        await Task.findByIdAndUpdate(task._id, { priority: params.priority });
      }
      break;

    case 'add_label':
      if (params?.label) {
        await Task.findByIdAndUpdate(task._id, { $addToSet: { labels: params.label } });
      }
      break;

    case 'close_task':
      await Task.findByIdAndUpdate(task._id, { status: 'completed', completedAt: new Date() });
      break;

    case 'send_notification':
      if (params?.userId) {
        await notificationService.create({
          userId:  params.userId,
          type:    'automation_triggered',
          title:   params.title || 'Automation triggered',
          message: params.message || `An automation rule ran on task "${task.title}"`,
          data:    { taskId: task._id },
        });
      }
      break;

    case 'trigger_webhook':
      if (params?.url) {
        await webhookService.fire(params.url, webhookService.buildPayload('automation.triggered', { task }));
      }
      break;

    default:
      console.warn(`[AutomationService] Unknown action type: ${type}`);
  }
};

/**
 * Run automation rules for a given event + task.
 */
const runRules = async (event, { task, user }) => {
  try {
    const rules = await AutomationRule.find({
      project:           task.project,
      isActive:          true,
      'trigger.event':   event,
    });

    for (const rule of rules) {
      const conditions = rule.trigger.conditions || [];
      const allMet = conditions.every(c => evaluateCondition(c, task));

      if (allMet) {
        console.log(`[AutomationService] Running rule "${rule.name}" for event "${event}"`);
        for (const action of rule.actions) {
          await executeAction(action, task, user);
        }
      }
    }
  } catch (error) {
    console.error('[AutomationService] Rule execution error:', error.message);
  }
};

// --- Register listeners for all task events ---
const AUTOMATION_EVENTS = [
  'task.create',
  'task.update',
  'task.move',
  'task.close',
  'task.assign',
];

AUTOMATION_EVENTS.forEach(event => {
  eventEmitter.on(event, (data) => runRules(event, data));
});

module.exports = { runRules };
