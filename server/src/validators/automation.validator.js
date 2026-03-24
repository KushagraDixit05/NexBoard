const { z } = require('zod');

const conditionSchema = z.object({
  field:    z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty']),
  value:    z.any().optional(),
});

const actionSchema = z.object({
  type: z.enum([
    'move_task', 'assign_user', 'set_priority', 'add_label',
    'close_task', 'send_notification', 'send_email', 'trigger_webhook',
  ]),
  params: z.record(z.any()).optional(),
});

const createSchema = z.object({
  body: z.object({
    name:        z.string().min(1).max(100).trim(),
    description: z.string().optional(),
    trigger: z.object({
      event: z.enum([
        'task.create', 'task.move', 'task.update',
        'task.close', 'task.assign', 'due_date_passed',
      ]),
      conditions: z.array(conditionSchema).optional(),
    }),
    actions: z.array(actionSchema).min(1),
  }),
});

const updateSchema = z.object({
  body: z.object({
    name:        z.string().min(1).max(100).trim().optional(),
    description: z.string().optional(),
    isActive:    z.boolean().optional(),
    trigger:     z.object({
      event: z.enum([
        'task.create', 'task.move', 'task.update',
        'task.close', 'task.assign', 'due_date_passed',
      ]),
      conditions: z.array(conditionSchema).optional(),
    }).optional(),
    actions: z.array(actionSchema).min(1).optional(),
  }),
});

module.exports = { createSchema, updateSchema };
