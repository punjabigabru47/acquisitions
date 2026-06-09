import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z
      .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
      .default('info'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid database URL'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    ARCJET_KEY: z.string().optional(),
    NEON_LOCAL: z
      .enum(['true', 'false'])
      .default('false')
      .transform(value => value === 'true'),
    NEON_FETCH_ENDPOINT: z
      .string()
      .url()
      .default('http://neon-local:5432/sql'),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.ARCJET_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ARCJET_KEY'],
        message: 'ARCJET_KEY is required in production',
      });
    }
  });

const runtimeEnv = {
  ...process.env,
};

if (process.env.NODE_ENV === 'test') {
  runtimeEnv.DATABASE_URL =
    process.env.DATABASE_URL ||
    'postgresql://user:password@localhost:5432/acquisitions_test';
  runtimeEnv.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
}

const parsedEnv = envSchema.safeParse(runtimeEnv);

if (!parsedEnv.success) {
  console.error('Invalid environment configuration');
  console.error(z.flattenError(parsedEnv.error).fieldErrors);
  process.exit(1);
}

const env = parsedEnv.data;

export default env;
