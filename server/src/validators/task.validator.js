const { z } = require('zod');

const createSchema = z.object({
  body: z.object({
    title:         z.string().min(1).max(250).trim(),
    description:   z.string().optional(),
    column:        z.string().length(24, 'Invalid column id'),
    board:         z.string().length(24, 'Invalid board id'),
    project:       z.string().length(24, 'Invalid project id'),
    swimlane:      z.string().length(24).optional(),
    assignee:      z.string().length(24).optional(),
    color:         z.string().optional(),
    priority:      z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate:       z.string().datetime().optional(),
    startDate:     z.string().datetime().optional(),
    timeEstimated: z.number().nonnegative().optional(),
    labels:        z.array(z.string()).optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    title:         z.string().min(1).max(250).trim().optional(),
    description:   z.string().optional(),
    color:         z.string().optional(),
    priority:      z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate:       z.string().datetime().optional().nullable(),
    startDate:     z.string().datetime().optional().nullable(),
    assignee:      z.string().length(24).optional().nullable(),
    timeEstimated: z.number().nonnegative().optional(),
    labels:        z.array(z.string()).optional(),
    status:        z.enum(['open', 'in_progress', 'completed', 'archived']).optional(),
  }),
});

const moveSchema = z.object({
  body: z.object({
    targetColumn:   z.string().length(24, 'Invalid column id'),
    targetPosition: z.number().nonnegative(),
    targetSwimlane: z.string().length(24).optional(),
  }),
});

module.exports = { createSchema, updateSchema, moveSchema };
