/* eslint-disable linebreak-style */

import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.email().toLowerCase().max(255).trim(),
  password: z.string().min(6).max(100),
  role: z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
  email: z.string().max(255).trim(),
  password: z.string().min(1),
});
