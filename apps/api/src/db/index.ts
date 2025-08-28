import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import * as schema from './schema';

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://ship_user:ship_password@localhost:3306/ship_nuxt',
});

export const db = drizzle(connection, { schema, mode: 'default' });

export * from './schema';