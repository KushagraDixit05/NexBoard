const { z } = require('zod');

const createSchema = z.object({
  body: z.object({
    name:        z.string().min(1).max(100).trim(),
    description: z.string().max(1000).optional(),
    color:       z.string().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    name:        z.string().min(1).max(100).trim().optional(),
    description: z.string().max(1000).optional(),
    color:       z.string().optional(),
    isArchived:  z.boolean().optional(),
  }),
});

const addMemberSchema = z.object({
  body: z.object({
    userId: z.string().length(24, 'Invalid user id'),
    role:   z.enum(['manager', 'member']).optional(),
  }),
});

const changeMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(['manager', 'member']),
  }),
});

module.exports = { createSchema, updateSchema, addMemberSchema, changeMemberRoleSchema };
