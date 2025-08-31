import { defineConfig } from 'drizzle-kit';
import { env } from 'node:process';

import 'dotenv/config';

export default defineConfig({
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: env.DATABASE_URL || 'mysql://ship_user:ship_password@localhost:3306/ship_nuxt',
  },
  verbose: true,
  strict: true,
});
