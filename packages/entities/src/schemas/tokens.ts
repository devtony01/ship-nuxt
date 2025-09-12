import { TokenType } from '@ship-nuxt/enums';
import { datetime, int, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';

import { users } from './users';

export const tokens = mysqlTable('tokens', {
  id: int('id').primaryKey().autoincrement(),
  value: text('value').notNull(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).$type<TokenType>().notNull(),
  expiresOn: datetime('expires_on').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});