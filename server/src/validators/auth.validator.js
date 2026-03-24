const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    username:    z.string().min(3).max(30).trim(),
    email:       z.string().email(),
    password:    z.string().min(8).max(128),
    displayName: z.string().max(100).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email:    z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    displayName: z.string().max(100).optional(),
    avatar:      z.string().url().optional(),
    notificationPreferences: z.object({
      email:      z.boolean().optional(),
      inApp:      z.boolean().optional(),
      digest:     z.enum(['none', 'daily', 'weekly']).optional(),
      webhookUrl: z.string().url().optional(),
    }).optional(),
  }),
});

module.exports = { registerSchema, loginSchema, updateProfileSchema };
