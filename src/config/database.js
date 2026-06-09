import { neon, neonConfig } from '@neondatabase/serverless';
import env from '#config/env.js';
import { drizzle } from 'drizzle-orm/neon-http';

if (env.NEON_LOCAL) {
  neonConfig.fetchEndpoint = env.NEON_FETCH_ENDPOINT;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(env.DATABASE_URL);

const db = drizzle(sql);

export { db, sql };
