import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import config from 'config';

import * as schema from './schema';

const connection = mysql.createPool({
  uri: config.DATABASE_URL,
});

export const db = drizzle(connection, { schema, mode: 'default' });

export * from './schema';
