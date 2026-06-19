import { config } from 'dotenv';
import { z } from 'zod';

config();

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('1h'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  COUNTRIES_API_URL: z.string().url().default('https://restcountries.com/v3.1'),
  COUNTRIES_API_KEY: z.string().optional(),
  COUNTRIES_CACHE_TTL_MS: z.coerce.number().int().nonnegative().default(600_000),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
