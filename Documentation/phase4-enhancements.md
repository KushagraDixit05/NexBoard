# Phase 4: Enhancements Implementation

**Timeline:** Week 9–11  
**Focus:** Implement 4 enhancements — Task Automation, Analytics Dashboard, Enhanced Workflow, Notification System  
**Effort Split:** 70% Implementation, 20% Integration, 10% Testing

---

## 1. Objectives

- Implement Task Automation Rules with a trigger-action rule engine
- Build an Analytics & Reporting Dashboard with charts and data exports
- Add Enhanced Workflow features: task dependencies, recurring tasks, custom fields, bulk operations
- Implement a Notification System: in-app notifications, webhooks (Slack/Discord), email digests, @mentions
- Integrate all enhancements with the event emitter system built in Phase 2
- Ensure enhancements don't break existing core functionality

---

## 2. Implementation Timeline

| Week | Enhancement | Complexity |
|------|-----------|-----------|
| **Week 9** | Task Automation Rules + Notification System (backend) | Medium + Medium |
| **Week 10** | Analytics & Reporting Dashboard (backend + frontend) | Medium |
| **Week 11** | Enhanced Workflow (backend + frontend) + All enhancement UIs + Integration | Complex |

---

## Enhancement 1: Task Automation Rules

### 1.1 Overview

An automation engine that lets users define rules: **"When [trigger], if [conditions], then [actions]"**. Rules can fire in real-time (via event listeners) or on a schedule (via cron).

### 1.2 MongoDB Schemas

#### AutomationRule Schema

```javascript
// server/src/models/AutomationRule.js
const mongoose = require('mongoose');

const automationRuleSchema = new mongoose.Schema({
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Trigger configuration
  trigger: {
    type: {
      type: String,
      enum: [
        'task.create',          // When a task is created
        'task.move',            // When a task moves to a column
        'task.close',           // When a task is completed
        'task.assign',          // When a task is assigned
        'task.due_approaching', // When due date is within N days (cron-based)
        'task.overdue',         // When due date has passed (cron-based)
        'subtask.complete_all', // When all subtasks are done
        'schedule',             // Run on a cron schedule
      ],
      required: true,
    },
    config: {
      // Depends on trigger type:
      columnId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Column' },  // For task.move
      daysBeforeDue:  { type: Number },    // For task.due_approaching
      cronExpression: { type: String },     // For schedule trigger (e.g., '0 9 * * 1')
    },
  },

  // Conditions (optional filters)
  conditions: [{
    field:    { type: String },     // e.g., 'priority', 'assignee', 'labels', 'column'
    operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'gt', 'lt', 'in'] },
    value:    { type: mongoose.Schema.Types.Mixed },
  }],

  // Actions to execute
  actions: [{
    type: {
      type: String,
      enum: [
        'move_task',        // Move to a specific column
        'assign_user',      // Assign to a user
        'set_priority',     // Change priority
        'set_color',        // Change task color
        'add_label',        // Add a label
        'set_due_date',     // Set/adjust due date
        'send_notification',// Trigger notification
        'send_webhook',     // Send webhook
        'close_task',       // Mark as completed
        'create_subtask',   // Create subtask
      ],
      required: true,
    },
    config: {
      targetColumnId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Column' },
      targetUserId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      priority:        { type: String },
      color:           { type: String },
      label:           { type: String },
      daysOffset:      { type: Number },      // For due date adjustment
      webhookUrl:      { type: String },
      notificationMsg: { type: String },
      subtaskTitle:    { type: String },
    },
  }],

  // Stats
  executionCount: { type: Number, default: 0 },
  lastExecutedAt: { type: Date },
}, { timestamps: true });

automationRuleSchema.index({ project: 1, isActive: 1 });
automationRuleSchema.index({ 'trigger.type': 1 });

module.exports = mongoose.model('AutomationRule', automationRuleSchema);
```

#### RuleExecution Schema (Audit Log)

```javascript
// server/src/models/RuleExecution.js
const mongoose = require('mongoose');

const ruleExecutionSchema = new mongoose.Schema({
  rule:       { type: mongoose.Schema.Types.ObjectId, ref: 'AutomationRule', required: true },
  task:       { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  project:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status:     { type: String, enum: ['success', 'failed', 'skipped'], required: true },
  trigger:    { type: String },         // Which trigger fired
  actionsExecuted: [{
    type:     { type: String },
    success:  { type: Boolean },
    error:    { type: String },
  }],
  error:      { type: String },         // If failed
  duration:   { type: Number },         // Execution time in ms
}, { timestamps: true });

ruleExecutionSchema.index({ rule: 1, createdAt: -1 });
ruleExecutionSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('RuleExecution', ruleExecutionSchema);
```

### 1.3 Automation Service (Rule Engine)

```javascript
// server/src/services/automation.service.js
const AutomationRule = require('../models/AutomationRule');
const RuleExecution = require('../models/RuleExecution');
const Task = require('../models/Task');
const eventEmitter = require('./eventEmitter.service');
const notificationService = require('./notification.service');
const webhookService = require('./webhook.service');

class AutomationService {
  constructor() {
    this.registerEventListeners();
  }

  // Register listeners for all real-time triggers
  registerEventListeners() {
    const eventTriggerMap = {
      'task.create': 'task.create',
      'task.move':   'task.move',
      'task.close':  'task.close',
      'task.assign': 'task.assign',
    };

    Object.entries(eventTriggerMap).forEach(([event, triggerType]) => {
      eventEmitter.on(event, async (data) => {
        await this.evaluateRules(triggerType, data);
      });
    });

    // Listen for subtask updates to check "all subtasks complete"
    eventEmitter.on('subtask.update', async (data) => {
      await this.checkAllSubtasksComplete(data);
    });
  }

  // Core: evaluate all matching rules for a trigger
  async evaluateRules(triggerType, eventData) {
    try {
      const { task } = eventData;
      if (!task) return;

      // Find active rules for this project and trigger type
      const rules = await AutomationRule.find({
        project: task.project,
        isActive: true,
        'trigger.type': triggerType,
      });

      for (const rule of rules) {
        await this.executeRule(rule, task, eventData);
      }
    } catch (error) {
      console.error('Automation evaluation error:', error);
    }
  }

  // Execute a single rule against a task
  async executeRule(rule, task, eventData) {
    const startTime = Date.now();
    const execution = {
      rule: rule._id,
      task: task._id,
      project: rule.project,
      trigger: rule.trigger.type,
      actionsExecuted: [],
    };

    try {
      // Check trigger-specific conditions
      if (!this.matchesTriggerConfig(rule, eventData)) {
        execution.status = 'skipped';
        await RuleExecution.create(execution);
        return;
      }

      // Check general conditions
      if (!this.evaluateConditions(rule.conditions, task)) {
        execution.status = 'skipped';
        await RuleExecution.create(execution);
        return;
      }

      // Execute all actions
      for (const action of rule.actions) {
        try {
          await this.executeAction(action, task, rule);
          execution.actionsExecuted.push({ type: action.type, success: true });
        } catch (err) {
          execution.actionsExecuted.push({ type: action.type, success: false, error: err.message });
        }
      }

      // Update rule stats
      rule.executionCount += 1;
      rule.lastExecutedAt = new Date();
      await rule.save();

      execution.status = 'success';
      execution.duration = Date.now() - startTime;
      await RuleExecution.create(execution);

    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.duration = Date.now() - startTime;
      await RuleExecution.create(execution);
    }
  }

  // Check if trigger config matches (e.g., task moved to specific column)
  matchesTriggerConfig(rule, eventData) {
    const config = rule.trigger.config;
    
    switch (rule.trigger.type) {
      case 'task.move':
        // Only trigger if moved to the specified column
        if (config.columnId) {
          return eventData.to?.column?.toString() === config.columnId.toString();
        }
        return true;
      default:
        return true;
    }
  }

  // Evaluate condition filters
  evaluateConditions(conditions, task) {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const taskValue = task[condition.field];
      
      switch (condition.operator) {
        case 'equals':     return taskValue?.toString() === condition.value?.toString();
        case 'not_equals': return taskValue?.toString() !== condition.value?.toString();
        case 'contains':   return taskValue?.includes?.(condition.value);
        case 'gt':         return taskValue > condition.value;
        case 'lt':         return taskValue < condition.value;
        case 'in':         return Array.isArray(condition.value) && condition.value.includes(taskValue);
        default:           return true;
      }
    });
  }

  // Execute a single action
  async executeAction(action, task, rule) {
    switch (action.type) {
      case 'move_task':
        await Task.findByIdAndUpdate(task._id, { column: action.config.targetColumnId });
        break;

      case 'assign_user':
        await Task.findByIdAndUpdate(task._id, { assignee: action.config.targetUserId });
        break;

      case 'set_priority':
        await Task.findByIdAndUpdate(task._id, { priority: action.config.priority });
        break;

      case 'set_color':
        await Task.findByIdAndUpdate(task._id, { color: action.config.color });
        break;

      case 'add_label':
        await Task.findByIdAndUpdate(task._id, { $addToSet: { labels: action.config.label } });
        break;

      case 'close_task':
        await Task.findByIdAndUpdate(task._id, { status: 'completed', completedAt: new Date() });
        break;

      case 'send_notification':
        await notificationService.sendToProjectMembers(rule.project, {
          type: 'automation',
          message: action.config.notificationMsg || `Automation "${rule.name}" triggered`,
          link: `/tasks/${task._id}`,
        });
        break;

      case 'send_webhook':
        await webhookService.send(action.config.webhookUrl, {
          event: 'automation.executed',
          rule: rule.name,
          task: { id: task._id, title: task.title },
        });
        break;

      case 'create_subtask':
        const Subtask = require('../models/Subtask');
        await Subtask.create({
          task: task._id,
          title: action.config.subtaskTitle,
          status: 'todo',
        });
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Check if all subtasks of a task are complete
  async checkAllSubtasksComplete(data) {
    const Subtask = require('../models/Subtask');
    const subtasks = await Subtask.find({ task: data.task._id });
    
    if (subtasks.length > 0 && subtasks.every(s => s.status === 'done')) {
      await this.evaluateRules('subtask.complete_all', data);
    }
  }
}

module.exports = new AutomationService();
```

### 1.4 Scheduled Rule Runner (Cron)

```javascript
// server/src/services/scheduler.service.js
const cron = require('node-cron');
const AutomationRule = require('../models/AutomationRule');
const Task = require('../models/Task');

const initScheduler = () => {
  // Run every hour — check for due date approaching / overdue rules
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Checking due date rules...');
    await checkDueDateRules();
  });

  // Run every day at midnight — handle recurring tasks
  cron.schedule('0 0 * * *', async () => {
    console.log('[Scheduler] Processing recurring tasks...');
    await processRecurringTasks();
  });

  // Run every day at 8 AM — send digest emails
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Sending daily digests...');
    await sendDailyDigests();
  });

  // Run every Monday at 8 AM — send weekly digests
  cron.schedule('0 8 * * 1', async () => {
    console.log('[Scheduler] Sending weekly digests...');
    await sendWeeklyDigests();
  });

  console.log('[Scheduler] Cron jobs initialized');
};

async function checkDueDateRules() {
  // Find "due_approaching" rules
  const dueSoonRules = await AutomationRule.find({
    'trigger.type': 'task.due_approaching',
    isActive: true,
  });

  for (const rule of dueSoonRules) {
    const daysBeforeDue = rule.trigger.config.daysBeforeDue || 1;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBeforeDue);

    const tasks = await Task.find({
      project: rule.project,
      status: { $nin: ['completed', 'archived'] },
      dueDate: {
        $gte: new Date(),
        $lte: targetDate,
      },
    });

    const automationService = require('./automation.service');
    for (const task of tasks) {
      await automationService.executeRule(rule, task, { task });
    }
  }

  // Find "overdue" rules
  const overdueRules = await AutomationRule.find({
    'trigger.type': 'task.overdue',
    isActive: true,
  });

  for (const rule of overdueRules) {
    const tasks = await Task.find({
      project: rule.project,
      status: { $nin: ['completed', 'archived'] },
      dueDate: { $lt: new Date() },
    });

    const automationService = require('./automation.service');
    for (const task of tasks) {
      await automationService.executeRule(rule, task, { task });
    }
  }
}

async function processRecurringTasks() {
  const tasks = await Task.find({
    isRecurring: true,
    'recurringConfig.nextDue': { $lte: new Date() },
    status: { $nin: ['archived'] },
  });

  for (const task of tasks) {
    // Create new task instance from recurring template
    const newTask = await Task.create({
      title: task.title,
      description: task.description,
      column: task.column,
      board: task.board,
      project: task.project,
      assignee: task.assignee,
      creator: task.creator,
      priority: task.priority,
      color: task.color,
      labels: task.labels,
      timeEstimated: task.timeEstimated,
      status: 'open',
    });

    // Calculate next due date
    const config = task.recurringConfig;
    const nextDue = new Date(config.nextDue);
    
    switch (config.frequency) {
      case 'daily':   nextDue.setDate(nextDue.getDate() + (config.interval || 1)); break;
      case 'weekly':  nextDue.setDate(nextDue.getDate() + 7 * (config.interval || 1)); break;
      case 'monthly': nextDue.setMonth(nextDue.getMonth() + (config.interval || 1)); break;
    }

    task.recurringConfig.nextDue = nextDue;
    task.dueDate = nextDue;
    await task.save();
  }
}

async function sendDailyDigests() {
  const emailService = require('./email.service');
  const User = require('../models/User');
  
  const users = await User.find({
    'notificationPreferences.digest': 'daily',
    isActive: true,
  });

  for (const user of users) {
    const Notification = require('../models/Notification');
    const unread = await Notification.find({
      recipient: user._id,
      isRead: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (unread.length > 0) {
      await emailService.sendDigest(user, unread, 'daily');
    }
  }
}

async function sendWeeklyDigests() {
  const emailService = require('./email.service');
  const User = require('../models/User');
  
  const users = await User.find({
    'notificationPreferences.digest': 'weekly',
    isActive: true,
  });

  for (const user of users) {
    const Notification = require('../models/Notification');
    const unread = await Notification.find({
      recipient: user._id,
      isRead: false,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    if (unread.length > 0) {
      await emailService.sendDigest(user, unread, 'weekly');
    }
  }
}

module.exports = { initScheduler };
```

### 1.5 Automation API Routes

```javascript
// server/src/routes/automation.routes.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { projectMember } = require('../middleware/role.middleware');
const ctrl = require('../controllers/automation.controller');

router.use(authenticate);

router.post('/',                      ctrl.createRule);           // Create automation rule
router.get('/project/:projectId',     projectMember, ctrl.getRules);  // List rules for project
router.get('/:ruleId',               ctrl.getRule);              // Get single rule
router.put('/:ruleId',               ctrl.updateRule);           // Update rule
router.patch('/:ruleId/toggle',      ctrl.toggleRule);           // Enable/disable rule
router.delete('/:ruleId',            ctrl.deleteRule);           // Delete rule
router.get('/:ruleId/executions',    ctrl.getExecutions);        // Get execution history
router.post('/:ruleId/test',         ctrl.testRule);             // Dry-run test a rule

module.exports = router;
```

### 1.6 Automation Rule Builder UI

```typescript
// client/components/automation/RuleBuilder.tsx
'use client';

import { useState } from 'react';
import { Zap, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface RuleBuilderProps {
  projectId: string;
  columns: { _id: string; title: string }[];
  members: { _id: string; displayName: string }[];
  onSave: () => void;
  existingRule?: any;
}

const TRIGGERS = [
  { value: 'task.create',          label: 'When a task is created' },
  { value: 'task.move',            label: 'When a task is moved to a column' },
  { value: 'task.close',           label: 'When a task is completed' },
  { value: 'task.assign',          label: 'When a task is assigned' },
  { value: 'task.due_approaching', label: 'When due date is approaching' },
  { value: 'task.overdue',         label: 'When a task is overdue' },
  { value: 'subtask.complete_all', label: 'When all subtasks are done' },
];

const ACTIONS = [
  { value: 'move_task',         label: 'Move task to column' },
  { value: 'assign_user',      label: 'Assign to user' },
  { value: 'set_priority',     label: 'Set priority' },
  { value: 'set_color',        label: 'Set color' },
  { value: 'add_label',        label: 'Add label' },
  { value: 'close_task',       label: 'Mark as completed' },
  { value: 'send_notification', label: 'Send notification' },
  { value: 'send_webhook',     label: 'Send webhook' },
];

export default function RuleBuilder({ projectId, columns, members, onSave, existingRule }: RuleBuilderProps) {
  const [name, setName] = useState(existingRule?.name || '');
  const [triggerType, setTriggerType] = useState(existingRule?.trigger?.type || '');
  const [triggerConfig, setTriggerConfig] = useState(existingRule?.trigger?.config || {});
  const [actions, setActions] = useState(existingRule?.actions || []);
  const [saving, setSaving] = useState(false);

  const addAction = () => {
    setActions([...actions, { type: '', config: {} }]);
  };

  const updateAction = (index: number, field: string, value: any) => {
    const updated = [...actions];
    if (field === 'type') {
      updated[index] = { type: value, config: {} };
    } else {
      updated[index].config = { ...updated[index].config, [field]: value };
    }
    setActions(updated);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_: any, i: number) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        project: projectId,
        name,
        trigger: { type: triggerType, config: triggerConfig },
        actions,
      };

      if (existingRule) {
        await api.put(`/automation/${existingRule._id}`, payload);
      } else {
        await api.post('/automation', payload);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rule name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
               className="input-field" placeholder="e.g., Auto-close completed tasks" />
      </div>

      {/* Trigger */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-500" />
          <h3 className="font-medium text-sm">When this happens...</h3>
        </div>
        <select value={triggerType} onChange={e => setTriggerType(e.target.value)}
                className="input-field">
          <option value="">Select a trigger</option>
          {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        {/* Trigger-specific config */}
        {triggerType === 'task.move' && (
          <select className="input-field mt-2"
                  value={triggerConfig.columnId || ''}
                  onChange={e => setTriggerConfig({ ...triggerConfig, columnId: e.target.value })}>
            <option value="">Any column</option>
            {columns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        )}
        {triggerType === 'task.due_approaching' && (
          <input type="number" className="input-field mt-2" placeholder="Days before due"
                 value={triggerConfig.daysBeforeDue || ''}
                 onChange={e => setTriggerConfig({ ...triggerConfig, daysBeforeDue: parseInt(e.target.value) })} />
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Then do these actions...</h3>
        
        {actions.map((action: any, index: number) => (
          <div key={index} className="card p-4 flex gap-3 items-start">
            <div className="flex-1 space-y-2">
              <select value={action.type} onChange={e => updateAction(index, 'type', e.target.value)}
                      className="input-field">
                <option value="">Select action</option>
                {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>

              {/* Action-specific config */}
              {action.type === 'move_task' && (
                <select className="input-field"
                        value={action.config.targetColumnId || ''}
                        onChange={e => updateAction(index, 'targetColumnId', e.target.value)}>
                  <option value="">Select column</option>
                  {columns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              )}
              {action.type === 'assign_user' && (
                <select className="input-field"
                        value={action.config.targetUserId || ''}
                        onChange={e => updateAction(index, 'targetUserId', e.target.value)}>
                  <option value="">Select user</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.displayName}</option>)}
                </select>
              )}
              {action.type === 'set_priority' && (
                <select className="input-field"
                        value={action.config.priority || ''}
                        onChange={e => updateAction(index, 'priority', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              )}
              {action.type === 'send_webhook' && (
                <input type="url" className="input-field" placeholder="Webhook URL"
                       value={action.config.webhookUrl || ''}
                       onChange={e => updateAction(index, 'webhookUrl', e.target.value)} />
              )}
              {action.type === 'send_notification' && (
                <input type="text" className="input-field" placeholder="Notification message"
                       value={action.config.notificationMsg || ''}
                       onChange={e => updateAction(index, 'notificationMsg', e.target.value)} />
              )}
            </div>
            <button onClick={() => removeAction(index)} className="p-2 text-gray-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button onClick={addAction} className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Action
        </button>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving || !name || !triggerType || actions.length === 0}
              className="btn-primary w-full disabled:opacity-50">
        {saving ? 'Saving...' : existingRule ? 'Update Rule' : 'Create Rule'}
      </button>
    </div>
  );
}
```

---

## Enhancement 2: Analytics & Reporting Dashboard

### 2.1 Overview

A dashboard that visualizes project metrics: cycle time, throughput, task distribution, burndown charts, and team workload — with date range filtering and PDF/CSV export.

### 2.2 Analytics Service (MongoDB Aggregation Pipelines)

```javascript
// server/src/services/analytics.service.js
const Task = require('../models/Task');
const mongoose = require('mongoose');

const analyticsService = {
  // Cycle time: average time from task creation to completion
  async getCycleTime(projectId, startDate, endDate) {
    const pipeline = [
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          status: 'completed',
          completedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $project: {
          cycleTime: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60,  // Convert ms to hours
            ],
          },
          completedAt: 1,
          title: 1,
        },
      },
      {
        $group: {
          _id: null,
          avgCycleTime: { $avg: '$cycleTime' },
          minCycleTime: { $min: '$cycleTime' },
          maxCycleTime: { $max: '$cycleTime' },
          totalCompleted: { $sum: 1 },
          tasks: { $push: { title: '$title', cycleTime: '$cycleTime', completedAt: '$completedAt' } },
        },
      },
    ];

    const result = await Task.aggregate(pipeline);
    return result[0] || { avgCycleTime: 0, minCycleTime: 0, maxCycleTime: 0, totalCompleted: 0, tasks: [] };
  },

  // Throughput: tasks completed per day/week
  async getThroughput(projectId, startDate, endDate, groupBy = 'day') {
    const dateFormat = groupBy === 'week' ? '%Y-%U' : '%Y-%m-%d';

    const pipeline = [
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          status: 'completed',
          completedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    return Task.aggregate(pipeline);
  },

  // Task distribution by column
  async getDistributionByColumn(projectId) {
    const pipeline = [
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          status: { $ne: 'archived' },
        },
      },
      {
        $lookup: {
          from: 'columns',
          localField: 'column',
          foreignField: '_id',
          as: 'columnData',
        },
      },
      { $unwind: '$columnData' },
      {
        $group: {
          _id: '$column',
          columnName: { $first: '$columnData.title' },
          count: { $sum: 1 },
        },
      },
      { $sort: { 'columnData.position': 1 } },
    ];

    return Task.aggregate(pipeline);
  },

  // Task distribution by assignee
  async getDistributionByAssignee(projectId) {
    const pipeline = [
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          status: { $ne: 'archived' },
          assignee: { $ne: null },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignee',
          foreignField: '_id',
          as: 'assigneeData',
        },
      },
      { $unwind: '$assigneeData' },
      {
        $group: {
          _id: '$assignee',
          name: { $first: '$assigneeData.displayName' },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        },
      },
    ];

    return Task.aggregate(pipeline);
  },

  // Burndown data: remaining tasks over time
  async getBurndownData(projectId, startDate, endDate) {
    // Get total tasks at start date
    const totalAtStart = await Task.countDocuments({
      project: projectId,
      createdAt: { $lte: new Date(startDate) },
      status: { $ne: 'archived' },
    });

    // Get cumulative completions by day
    const completions = await Task.aggregate([
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          status: 'completed',
          completedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          completed: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get new tasks created by day
    const created = await Task.aggregate([
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          created: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return { totalAtStart, completions, created };
  },

  // Priority distribution
  async getPriorityDistribution(projectId) {
    return Task.aggregate([
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          status: { $ne: 'archived' },
        },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);
  },

  // Overdue tasks
  async getOverdueTasks(projectId) {
    return Task.find({
      project: projectId,
      status: { $nin: ['completed', 'archived'] },
      dueDate: { $lt: new Date() },
    })
      .populate('assignee', 'displayName username')
      .populate('column', 'title')
      .sort({ dueDate: 1 });
  },
};

module.exports = analyticsService;
```

### 2.3 Analytics API Routes

```javascript
// server/src/routes/analytics.routes.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const analyticsService = require('../services/analytics.service');

router.use(authenticate);

router.get('/project/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate, groupBy } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const [cycleTime, throughput, columnDist, assigneeDist, burndown, priorityDist, overdue] =
      await Promise.all([
        analyticsService.getCycleTime(projectId, start, end),
        analyticsService.getThroughput(projectId, start, end, groupBy),
        analyticsService.getDistributionByColumn(projectId),
        analyticsService.getDistributionByAssignee(projectId),
        analyticsService.getBurndownData(projectId, start, end),
        analyticsService.getPriorityDistribution(projectId),
        analyticsService.getOverdueTasks(projectId),
      ]);

    res.json({
      cycleTime,
      throughput,
      columnDistribution: columnDist,
      assigneeDistribution: assigneeDist,
      burndown,
      priorityDistribution: priorityDist,
      overdueTasks: overdue,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### 2.4 Analytics Dashboard UI

```typescript
// client/app/dashboard/projects/[projectId]/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { Download, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
  const { projectId } = useParams();
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: analytics } = await api.get(`/analytics/project/${projectId}`, {
        params: { startDate: dateRange.start, endDate: dateRange.end },
      });
      setData(analytics);
    };
    fetchAnalytics();
  }, [projectId, dateRange]);

  const exportCSV = () => {
    if (!data) return;
    const rows = data.throughput.map((d: any) => `${d._id},${d.count}`);
    const csv = 'Date,Tasks Completed\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${projectId}.csv`;
    a.click();
  };

  if (!data) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={dateRange.start}
                   onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                   className="input-field w-auto text-sm" />
            <span className="text-gray-400">to</span>
            <input type="date" value={dateRange.end}
                   onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                   className="input-field w-auto text-sm" />
          </div>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Avg Cycle Time</p>
          <p className="text-2xl font-bold">{data.cycleTime.avgCycleTime?.toFixed(1) || 0}h</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Tasks Completed</p>
          <p className="text-2xl font-bold">{data.cycleTime.totalCompleted || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Overdue Tasks</p>
          <p className="text-2xl font-bold text-red-600">{data.overdueTasks?.length || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Avg Throughput</p>
          <p className="text-2xl font-bold">
            {data.throughput.length > 0
              ? (data.throughput.reduce((a: number, b: any) => a + b.count, 0) / data.throughput.length).toFixed(1)
              : 0}/day
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput Chart */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Tasks Completed Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.throughput}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#dbeafe" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Column Distribution */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Tasks by Column</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.columnDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="columnName" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution Pie */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.priorityDistribution} dataKey="count" nameKey="_id"
                   cx="50%" cy="50%" outerRadius={90} label>
                {data.priorityDistribution.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Workload by Assignee */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Workload by Team Member</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.assigneeDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="open" stackId="a" fill="#3b82f6" name="Open" />
              <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
              <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

---

## Enhancement 3: Enhanced Workflow Management

### 3.1 Task Dependencies

#### Schema

```javascript
// server/src/models/TaskDependency.js
const mongoose = require('mongoose');

const taskDependencySchema = new mongoose.Schema({
  task:         { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },    // The dependent task
  dependsOn:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },    // The blocking task
  type:         { type: String, enum: ['blocks', 'blocked_by'], default: 'blocks' },
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

taskDependencySchema.index({ task: 1 });
taskDependencySchema.index({ dependsOn: 1 });

// Prevent self-dependency
taskDependencySchema.pre('save', function(next) {
  if (this.task.toString() === this.dependsOn.toString()) {
    return next(new Error('A task cannot depend on itself.'));
  }
  next();
});

module.exports = mongoose.model('TaskDependency', taskDependencySchema);
```

#### Circular Dependency Detection

```javascript
// server/src/services/dependency.service.js
const TaskDependency = require('../models/TaskDependency');

const dependencyService = {
  // Check for circular dependencies using DFS
  async hasCircularDependency(taskId, dependsOnId) {
    const visited = new Set();
    const stack = [dependsOnId.toString()];

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === taskId.toString()) return true;  // Circular!
      
      if (visited.has(current)) continue;
      visited.add(current);

      // Get all tasks that `current` depends on
      const deps = await TaskDependency.find({ task: current });
      for (const dep of deps) {
        stack.push(dep.dependsOn.toString());
      }
    }

    return false;
  },

  // Create dependency with circular check
  async createDependency(taskId, dependsOnId, projectId) {
    const isCircular = await this.hasCircularDependency(taskId, dependsOnId);
    if (isCircular) {
      throw new Error('Cannot create dependency: would create a circular dependency chain.');
    }

    return TaskDependency.create({ task: taskId, dependsOn: dependsOnId, project: projectId });
  },

  // Get all dependencies for a task
  async getDependencies(taskId) {
    const [blocking, blockedBy] = await Promise.all([
      TaskDependency.find({ dependsOn: taskId }).populate('task', 'title status'),
      TaskDependency.find({ task: taskId }).populate('dependsOn', 'title status'),
    ]);

    return { blocking, blockedBy };
  },

  // Check if a task can be completed (all dependencies must be done)
  async canComplete(taskId) {
    const deps = await TaskDependency.find({ task: taskId }).populate('dependsOn', 'status');
    const blockers = deps.filter(d => d.dependsOn.status !== 'completed');
    return { canComplete: blockers.length === 0, blockers };
  },
};

module.exports = dependencyService;
```

### 3.2 Custom Fields

#### Schema

```javascript
// server/src/models/CustomField.js
const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name:         { type: String, required: true, trim: true },
  type:         { type: String, enum: ['text', 'number', 'date', 'select', 'checkbox', 'url'], required: true },
  options:      [{ type: String }],    // For 'select' type
  isRequired:   { type: Boolean, default: false },
  position:     { type: Number, default: 0 },
}, { timestamps: true });

customFieldSchema.index({ project: 1 });

module.exports = mongoose.model('CustomField', customFieldSchema);
```

### 3.3 Bulk Operations API

```javascript
// In server/src/controllers/task.controller.js — add these methods

// POST /api/tasks/bulk — Bulk update tasks
const bulkUpdateTasks = async (req, res, next) => {
  try {
    const { taskIds, updates } = req.body;
    // updates can be: { status, priority, assignee, color, labels, column }

    if (!taskIds || taskIds.length === 0) {
      return res.status(400).json({ error: 'No tasks specified.' });
    }

    const allowedFields = ['status', 'priority', 'assignee', 'color', 'labels', 'column'];
    const safeUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) safeUpdates[field] = updates[field];
    }

    // Handle status change to completed
    if (safeUpdates.status === 'completed') {
      safeUpdates.completedAt = new Date();
    }

    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: safeUpdates }
    );

    res.json({ 
      message: `${result.modifiedCount} tasks updated.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/bulk-delete — Bulk delete tasks
const bulkDeleteTasks = async (req, res, next) => {
  try {
    const { taskIds } = req.body;
    
    // Also delete related data
    await Promise.all([
      Task.deleteMany({ _id: { $in: taskIds } }),
      Subtask.deleteMany({ task: { $in: taskIds } }),
      Comment.deleteMany({ task: { $in: taskIds } }),
      Attachment.deleteMany({ task: { $in: taskIds } }),
      TaskDependency.deleteMany({ $or: [{ task: { $in: taskIds } }, { dependsOn: { $in: taskIds } }] }),
    ]);

    res.json({ message: `${taskIds.length} tasks deleted.` });
  } catch (error) {
    next(error);
  }
};
```

### 3.4 Dependency Visualization UI

```typescript
// client/components/task/TaskDependencies.tsx
'use client';

import { useState, useEffect } from 'react';
import { Link2, AlertTriangle, Plus, X } from 'lucide-react';
import api from '@/lib/api';

interface TaskDependenciesProps {
  taskId: string;
  projectId: string;
}

interface Dependency {
  _id: string;
  task?: { _id: string; title: string; status: string };
  dependsOn?: { _id: string; title: string; status: string };
}

export default function TaskDependencies({ taskId, projectId }: TaskDependenciesProps) {
  const [blocking, setBlocking] = useState<Dependency[]>([]);
  const [blockedBy, setBlockedBy] = useState<Dependency[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchDependencies();
  }, [taskId]);

  const fetchDependencies = async () => {
    const { data } = await api.get(`/tasks/${taskId}/dependencies`);
    setBlocking(data.blocking);
    setBlockedBy(data.blockedBy);
  };

  const searchTasks = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    const { data } = await api.get('/tasks/search', {
      params: { q: query, project: projectId },
    });
    setSearchResults(data.filter((t: any) => t._id !== taskId));
  };

  const addDependency = async (dependsOnId: string) => {
    try {
      await api.post(`/tasks/${taskId}/dependencies`, { dependsOn: dependsOnId });
      fetchDependencies();
      setShowAdd(false);
      setSearchQuery('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add dependency');
    }
  };

  const removeDependency = async (depId: string) => {
    await api.delete(`/tasks/dependencies/${depId}`);
    fetchDependencies();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Link2 className="w-4 h-4" /> Dependencies
        </label>
        <button onClick={() => setShowAdd(!showAdd)} className="text-xs text-primary-600 hover:underline">
          + Add
        </button>
      </div>

      {/* Blocked by (this task depends on) */}
      {blockedBy.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Blocked by:</p>
          {blockedBy.map(dep => (
            <div key={dep._id} className="flex items-center gap-2 py-1 text-sm">
              {dep.dependsOn?.status !== 'completed' && (
                <AlertTriangle className="w-3 h-3 text-orange-500" />
              )}
              <span className={dep.dependsOn?.status === 'completed' ? 'line-through text-gray-400' : ''}>
                {dep.dependsOn?.title}
              </span>
              <button onClick={() => removeDependency(dep._id)} className="ml-auto text-gray-400 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Blocking (other tasks depend on this) */}
      {blocking.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Blocking:</p>
          {blocking.map(dep => (
            <div key={dep._id} className="flex items-center gap-2 py-1 text-sm text-gray-600">
              <span>{dep.task?.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add dependency search */}
      {showAdd && (
        <div className="space-y-2">
          <input type="text" value={searchQuery} onChange={e => searchTasks(e.target.value)}
                 className="input-field text-sm" placeholder="Search for a task..." />
          {searchResults.map(task => (
            <button key={task._id} onClick={() => addDependency(task._id)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm 
                               hover:bg-gray-50 rounded-lg">
              <Plus className="w-3 h-3 text-gray-400" />
              {task.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3.5 Advanced Filter Panel

```typescript
// client/components/board/FilterPanel.tsx
'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import type { User } from '@/types';

interface FilterPanelProps {
  members: User[];
  onFilterChange: (filters: Filters) => void;
}

interface Filters {
  assignee?: string;
  priority?: string;
  status?: string;
  color?: string;
  dueBefore?: string;
  search?: string;
}

export default function FilterPanel({ members, onFilterChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const updateFilter = (key: keyof Filters, value: string) => {
    const updated = { ...filters, [key]: value || undefined };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearAll = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}
              className={`btn-secondary flex items-center gap-2 ${activeCount > 0 ? 'ring-2 ring-primary-300' : ''}`}>
        <Filter className="w-4 h-4" />
        Filter
        {activeCount > 0 && (
          <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border 
                        border-gray-200 p-4 z-20 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Filters</h4>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-primary-600 hover:underline">
                Clear all
              </button>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500">Assignee</label>
            <select value={filters.assignee || ''} onChange={e => updateFilter('assignee', e.target.value)}
                    className="input-field mt-1 text-sm">
              <option value="">All</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.displayName}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Priority</label>
            <select value={filters.priority || ''} onChange={e => updateFilter('priority', e.target.value)}
                    className="input-field mt-1 text-sm">
              <option value="">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Due Before</label>
            <input type="date" value={filters.dueBefore || ''}
                   onChange={e => updateFilter('dueBefore', e.target.value)}
                   className="input-field mt-1 text-sm" />
          </div>

          <div>
            <label className="text-xs text-gray-500">Search</label>
            <input type="text" value={filters.search || ''} placeholder="Task title..."
                   onChange={e => updateFilter('search', e.target.value)}
                   className="input-field mt-1 text-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Enhancement 4: Notification System

### 4.1 Notification Schema

```javascript
// server/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'task_assigned',      // You were assigned to a task
      'task_completed',     // A task you follow was completed
      'task_commented',     // Someone commented on your task
      'task_mentioned',     // You were @mentioned in a comment
      'task_due_soon',      // Task due date approaching
      'task_overdue',       // Task is overdue
      'task_moved',         // Task was moved
      'project_invited',    // You were added to a project
      'automation',         // Automation rule triggered
      'system',             // System notification
    ],
    required: true,
  },
  title:        { type: String, required: true },
  message:      { type: String },
  link:         { type: String },       // e.g., /projects/123/board/456?task=789
  isRead:       { type: Boolean, default: false },
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  task:         { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  actor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Who triggered this
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

### 4.2 Notification Service

```javascript
// server/src/services/notification.service.js
const Notification = require('../models/Notification');
const User = require('../models/User');
const eventEmitter = require('./eventEmitter.service');
const webhookService = require('./webhook.service');
const emailService = require('./email.service');

class NotificationService {
  constructor() {
    this.registerListeners();
  }

  registerListeners() {
    // Task assigned
    eventEmitter.on('task.assign', async ({ task, user, assignee }) => {
      if (assignee && assignee.toString() !== user._id.toString()) {
        await this.create({
          recipient: assignee,
          type: 'task_assigned',
          title: 'Task assigned to you',
          message: `${user.displayName} assigned you to "${task.title}"`,
          link: `/projects/${task.project}/board/${task.board}?task=${task._id}`,
          project: task.project,
          task: task._id,
          actor: user._id,
        });
      }
    });

    // Task completed
    eventEmitter.on('task.close', async ({ task, user }) => {
      // Notify assignee and creator if different from closer
      const notifyUsers = [task.assignee, task.creator].filter(
        u => u && u.toString() !== user._id.toString()
      );
      
      for (const userId of notifyUsers) {
        await this.create({
          recipient: userId,
          type: 'task_completed',
          title: 'Task completed',
          message: `${user.displayName} completed "${task.title}"`,
          link: `/projects/${task.project}/board/${task.board}?task=${task._id}`,
          project: task.project,
          task: task._id,
          actor: user._id,
        });
      }
    });

    // Comment with @mentions
    eventEmitter.on('comment.create', async ({ comment, task, user, mentions }) => {
      // Notify mentioned users
      for (const mentionedId of mentions || []) {
        if (mentionedId.toString() !== user._id.toString()) {
          await this.create({
            recipient: mentionedId,
            type: 'task_mentioned',
            title: 'You were mentioned',
            message: `${user.displayName} mentioned you in "${task.title}"`,
            link: `/projects/${task.project}/board/${task.board}?task=${task._id}`,
            project: task.project,
            task: task._id,
            actor: user._id,
          });
        }
      }

      // Notify task assignee of new comment
      if (task.assignee && task.assignee.toString() !== user._id.toString()) {
        await this.create({
          recipient: task.assignee,
          type: 'task_commented',
          title: 'New comment on your task',
          message: `${user.displayName} commented on "${task.title}"`,
          link: `/projects/${task.project}/board/${task.board}?task=${task._id}`,
          project: task.project,
          task: task._id,
          actor: user._id,
        });
      }
    });

    // Task moved
    eventEmitter.on('task.move', async ({ task, user, from, to }) => {
      if (task.assignee && task.assignee.toString() !== user._id.toString()) {
        await this.create({
          recipient: task.assignee,
          type: 'task_moved',
          title: 'Task moved',
          message: `${user.displayName} moved "${task.title}" to a new column`,
          link: `/projects/${task.project}/board/${task.board}?task=${task._id}`,
          project: task.project,
          task: task._id,
          actor: user._id,
        });
      }
    });
  }

  // Create notification + send via preferred channels
  async create(data) {
    const notification = await Notification.create(data);

    // Check user's notification preferences
    const recipient = await User.findById(data.recipient);
    if (!recipient) return;

    // Send email notification if enabled
    if (recipient.notificationPreferences.email) {
      await emailService.sendNotification(recipient, data);
    }

    // Send webhook if configured
    if (recipient.notificationPreferences.webhookUrl) {
      await webhookService.send(recipient.notificationPreferences.webhookUrl, {
        event: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      });
    }

    return notification;
  }

  // Send notification to all project members
  async sendToProjectMembers(projectId, data) {
    const Project = require('../models/Project');
    const project = await Project.findById(projectId);
    if (!project) return;

    const memberIds = [project.owner, ...project.members.map(m => m.user)];

    for (const userId of memberIds) {
      await this.create({ ...data, recipient: userId, project: projectId });
    }
  }
}

module.exports = new NotificationService();
```

### 4.3 Webhook Service

```javascript
// server/src/services/webhook.service.js
const axios = require('axios');

const webhookService = {
  async send(url, payload) {
    try {
      // Format for Slack/Discord
      const isSlack = url.includes('hooks.slack.com');
      const isDiscord = url.includes('discord.com/api/webhooks');

      let body;
      if (isSlack) {
        body = {
          text: `*${payload.title}*\n${payload.message}`,
          blocks: [{
            type: 'section',
            text: { type: 'mrkdwn', text: `*${payload.title}*\n${payload.message}` },
          }],
        };
      } else if (isDiscord) {
        body = {
          embeds: [{
            title: payload.title,
            description: payload.message,
            color: 3447003,  // Blue
            timestamp: new Date().toISOString(),
          }],
        };
      } else {
        body = payload;  // Generic webhook
      }

      await axios.post(url, body, { timeout: 5000 });
      console.log(`[Webhook] Sent to ${url}`);
    } catch (error) {
      console.error(`[Webhook] Failed to send to ${url}:`, error.message);
      // Non-blocking — don't throw
    }
  },
};

module.exports = webhookService;
```

### 4.4 Email Service

```javascript
// server/src/services/email.service.js
const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const emailService = {
  async sendNotification(user, data) {
    try {
      await transporter.sendMail({
        from: '"Kanboard" <notifications@kanboard.local>',
        to: user.email,
        subject: data.title,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #1d4ed8;">${data.title}</h2>
            <p style="color: #374151;">${data.message}</p>
            ${data.link ? `<a href="http://localhost:3000${data.link}" 
              style="display: inline-block; padding: 10px 20px; background: #2563eb; 
                     color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              View Task
            </a>` : ''}
          </div>
        `,
      });
    } catch (error) {
      console.error('[Email] Send failed:', error.message);
    }
  },

  async sendDigest(user, notifications, type) {
    const items = notifications.map(n => `<li>${n.title}: ${n.message}</li>`).join('');
    
    await transporter.sendMail({
      from: '"Kanboard" <notifications@kanboard.local>',
      to: user.email,
      subject: `Kanboard ${type === 'daily' ? 'Daily' : 'Weekly'} Digest`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Your ${type} digest</h2>
          <p>You have ${notifications.length} unread notifications:</p>
          <ul>${items}</ul>
          <a href="http://localhost:3000/notifications" 
             style="display: inline-block; padding: 10px 20px; background: #2563eb; 
                    color: white; text-decoration: none; border-radius: 6px;">
            View All
          </a>
        </div>
      `,
    });
  },
};

module.exports = emailService;
```

### 4.5 Notification Center UI

```typescript
// client/app/dashboard/notifications/page.tsx
'use client';

import { useEffect } from 'react';
import { useNotificationStore, AppNotification } from '@/store/notificationStore';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const typeIcons: Record<string, string> = {
  task_assigned:   '👤',
  task_completed:  '✅',
  task_commented:  '💬',
  task_mentioned:  '📢',
  task_due_soon:   '⏰',
  task_overdue:    '🔴',
  task_moved:      '➡️',
  project_invited: '📁',
  automation:      '⚡',
  system:          'ℹ️',
};

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAsRead, markAllRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications
          {unreadCount > 0 && (
            <span className="text-sm font-normal text-gray-500">({unreadCount} unread)</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification: AppNotification) => (
            <div key={notification._id}
                 className={`card p-4 flex items-start gap-3 transition-colors
                   ${notification.isRead ? 'opacity-60' : 'bg-primary-50/30 border-primary-100'}`}>
              <span className="text-lg flex-shrink-0">
                {typeIcons[notification.type] || 'ℹ️'}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {notification.link && (
                  <Link href={notification.link} className="text-xs text-primary-600 hover:underline">
                    View
                  </Link>
                )}
                {!notification.isRead && (
                  <button onClick={() => markAsRead(notification._id)}
                          className="p-1 text-gray-400 hover:text-green-500">
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4.6 @Mention Parsing

```javascript
// server/src/utils/mentions.js
const User = require('../models/User');

// Parse @mentions from comment content
// Format: @username
async function parseMentions(content, projectId) {
  const mentionRegex = /@(\w+)/g;
  const matches = [...content.matchAll(mentionRegex)];
  
  if (matches.length === 0) return [];

  const usernames = matches.map(m => m[1]);
  
  // Find users by username who are also members of the project
  const Project = require('../models/Project');
  const project = await Project.findById(projectId);
  const memberIds = [project.owner, ...project.members.map(m => m.user)];

  const users = await User.find({
    username: { $in: usernames },
    _id: { $in: memberIds },
  });

  return users.map(u => u._id);
}

module.exports = { parseMentions };
```

---

## 5. Notification API Routes

```javascript
// server/src/routes/notification.routes.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const Notification = require('../models/Notification');

router.use(authenticate);

// GET /api/notifications — Get user's notifications
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'displayName username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments({ recipient: req.user._id });
    
    res.json({ notifications, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

---

## 6. Integration Points

All 4 enhancements integrate through the **Event Emitter Service** built in Phase 2:

```
┌──────────────┐
│  Core Action  │  (Task create, move, complete, comment, etc.)
└──────┬───────┘
       │ eventEmitter.emit('task.create', data)
       ▼
┌──────────────────────────────────────────────┐
│              Event Bus (EventEmitter)          │
├─────────────┬──────────────┬─────────────────┤
│  Automation  │ Notification │   Analytics     │
│   Service    │   Service    │   (logs data)   │
│             │              │                 │
│ Evaluate    │ Create       │ Activity log    │
│ rules       │ notifications│ entry created   │
│ Execute     │ Send email   │ (used by        │
│ actions     │ Send webhook │  aggregation    │
│             │ Store in-app │  pipelines)     │
└─────────────┴──────────────┴─────────────────┘
```

---

## 7. Deliverables Checklist

| # | Deliverable | Status |
|---|------------|--------|
| 1 | AutomationRule + RuleExecution schemas | ☐ |
| 2 | Automation rule engine service | ☐ |
| 3 | Cron scheduler (due dates, recurring, digests) | ☐ |
| 4 | Automation CRUD API + test endpoint | ☐ |
| 5 | Rule builder UI component | ☐ |
| 6 | Automation page (list rules, create, edit, toggle, execution history) | ☐ |
| 7 | Analytics aggregation service (6 pipeline functions) | ☐ |
| 8 | Analytics API endpoint | ☐ |
| 9 | Analytics dashboard page (4 charts, KPI cards, date filter, CSV export) | ☐ |
| 10 | TaskDependency schema + circular detection | ☐ |
| 11 | CustomField schema + API | ☐ |
| 12 | Bulk operations API (update, delete) | ☐ |
| 13 | Dependency visualization UI | ☐ |
| 14 | Filter panel component | ☐ |
| 15 | Notification schema + service | ☐ |
| 16 | Webhook service (Slack/Discord formatting) | ☐ |
| 17 | Email service (notifications + digests) | ☐ |
| 18 | @mention parsing utility | ☐ |
| 19 | Notification API routes | ☐ |
| 20 | Notification center page | ☐ |
| 21 | All enhancements integrated via event system | ☐ |

---

## 8. Week-by-Week Schedule

| Week | Focus | Key Output |
|------|-------|-----------|
| **Week 9** | Automation: schemas, rule engine, cron scheduler, API routes. Notifications: schema, service, webhook/email services, API routes, @mention parsing | Working automation backend + notification backend |
| **Week 10** | Analytics: aggregation pipelines, API, dashboard page with Recharts. Automation: rule builder UI, automation page | Analytics dashboard live, automation rules manageable via UI |
| **Week 11** | Workflow: dependencies (schema, circular detection, API, UI), custom fields, bulk operations, filter panel. Integration testing across all enhancements. Polish all enhancement UIs | All 4 enhancements working end-to-end, integrated via event system |

---

## 9. Risks and Mitigation

| Risk | Mitigation |
|------|-----------|
| Automation rules causing infinite loops | Add max execution count per trigger; prevent rules that trigger themselves |
| MongoDB aggregation performance on large datasets | Add indexes on `completedAt`, `project`, `status`; cache analytics results |
| Circular dependency detection performance | Limit dependency chain depth to 50; cache dependency graph |
| Webhook failures blocking request flow | All webhook calls are async (fire-and-forget) with timeouts |
| Email delivery issues | Use queue-based approach; log failures; provide in-app fallback |
| Enhancement scope overrun | Implement core features first; defer advanced options (custom cron expressions, report builder) |
