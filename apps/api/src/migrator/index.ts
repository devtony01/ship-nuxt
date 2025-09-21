import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { createConnection } from 'mysql2/promise';
import { join } from 'node:path';
import process, { env } from 'node:process';

import logger from 'logger';

const exec = async () => {
  try {
    // Validate environment variables
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    logger.info('[Migrator] Starting database migrations...');
    logger.info(`[Migrator] Database URL: ${env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@')}`);

    // Create database connection
    const connection = await createConnection(env.DATABASE_URL);
    const db = drizzle(connection);

    // Run migrations
    const migrationsFolder = join(__dirname, '../../drizzle');
    logger.info(`[Migrator] Running migrations from: ${migrationsFolder}`);

    await migrate(db, { migrationsFolder });

    logger.info('[Migrator] ✅ Database migrations completed successfully!');

    // Close connection
    await connection.end();

    process.exit(0);
  } catch (error) {
    logger.error('[Migrator] ❌ Migration failed:', error);
    process.exit(1);
  }
};

export default {
  exec,
};
