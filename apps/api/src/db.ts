import { Database } from '@paracelsus/node-sql';
import process from 'node:process';

import config from 'config';

// Create database instance using our @paracelsus/node-sql package
const database = new Database(config.DATABASE_URL);

// Connect to database
database.connect().catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

export default database;
