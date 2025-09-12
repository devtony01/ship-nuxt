import { defineConfig } from 'drizzle-kit';
import { dirname, join } from 'node:path';
import { env } from 'node:process';

import 'dotenv/config';

// Resolve the entities package path
const entities = dirname(require.resolve('@ship-nuxt/entities/package.json'));

export default defineConfig({
  schema: [join(entities, 'src/schemas/*.ts')],
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: env.DATABASE_URL || 'mysql://ship_user:ship_password@localhost:3306/ship_nuxt',
  },
  verbose: true,
  strict: true,
});
