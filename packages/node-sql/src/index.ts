import Database from './database';
import Service from './service';
import ReplicationDatabase from './replication-database';
import ReplicationService from './replication-service';
import Outbox from './events/outbox';
import { eventBus, inMemoryPublisher } from './events/in-memory';

// Re-export specific Drizzle types to avoid conflicts
export type { SQL } from 'drizzle-orm';
export { eq, ne, gt, gte, lt, lte, like, ilike, isNull, isNotNull, inArray, notInArray, and, or, not, exists, notExists, between, notBetween } from 'drizzle-orm';
export { mysqlTable, varchar, text, int, timestamp, boolean, json } from 'drizzle-orm/mysql-core';
export * from './types';
export * from './utils/helpers';

export {
  Database,
  Service,
  ReplicationDatabase,
  ReplicationService,
  Outbox,
  eventBus,
  inMemoryPublisher,
};

export default Database;