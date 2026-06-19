import { z } from 'zod';

const password = z.string().min(8).max(72);
const email = z.string().email().max(255);
const name = z.string().min(2).max(120);
const role = z.enum(['ADMIN', 'USER']);

export const registerSchema = z.object({ name, email, password });

export const loginSchema = z.object({ email, password });

export const createUserSchema = z.object({
  name,
  email,
  password,
  role: role.optional(),
});

export const updateUserSchema = z
  .object({
    name: name.optional(),
    email: email.optional(),
    password: password.optional(),
    role: role.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const idParamSchema = z.object({ id: z.string().uuid() });

const pagination = {
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
};

export const listUsersQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  role: role.optional(),
  ...pagination,
});

export const listCountriesQuerySchema = z.object({
  name: z.string().optional(),
  region: z.string().optional(),
  subregion: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  sortBy: z.enum(['name', 'population', 'area']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  ...pagination,
});

export const listLogsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  endpoint: z.string().optional(),
  method: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ...pagination,
});
