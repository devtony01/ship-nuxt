import { MySqlTable } from 'drizzle-orm/mysql-core';
import type { MySqlDatabase } from 'drizzle-orm/mysql2';
import { Connection } from 'mysql2/promise';

export type DbChangeType = 'create' | 'update' | 'delete';

export type InMemoryEventHandler = (evt: InMemoryEvent) => Promise<void> | void;

export type OnUpdatedProperties = Array<Record<string, unknown> | string>;

export type PublishEventOptions = {
  transaction?: any; // MySQL transaction context
};

export type IChangePublisher = {
  publishDbChange: (
    tableName: string,
    changeType: DbChangeType,
    eventData: DbChangeData,
    options?: PublishEventOptions,
  ) => Promise<void>;
  publishDbChanges: (
    tableName: string,
    changeType: DbChangeType,
    eventsData: DbChangeData[],
    options?: PublishEventOptions,
  ) => Promise<void>;
};

export interface DbChangeData<T = any> {
  doc: T;
  prevDoc?: T;
}

export type OutboxEvent<T = any> = {
  id: string;
  type: 'create' | 'update' | 'delete';
  doc: T;
  prevDoc?: T;
  createdAt: Date;
};

export type InMemoryEvent<T = any> = {
  doc: T;
  prevDoc?: T;
  name: string;
  createdAt: Date;
};

export interface IDocument {
  id: number | string;
  updatedAt?: Date;
  deletedAt?: Date | null;
  createdAt?: Date;
}

export type FindResult<T> = {
  results: T[];
  pagesCount: number;
  count: number;
};

export type CreateConfig = {
  validateSchema?: boolean;
  publishEvents?: boolean;
};

export type ReadConfig = {
  skipDeletedRows?: boolean;
};

export type UpdateConfig = {
  skipDeletedRows?: boolean;
  validateSchema?: boolean;
  publishEvents?: boolean;
};

export type DeleteConfig = {
  skipDeletedRows?: boolean;
  publishEvents?: boolean;
};

export interface IDatabase {
  getOutboxService: () => IChangePublisher;
  waitForConnection: () => Promise<void>;
  getDb: () => MySqlDatabase<any, any>;
  getConnection: () => Promise<Connection>;
  withTransaction: <TRes = any>(
    transactionFn: (tx: MySqlDatabase<any, any>) => Promise<TRes>,
  ) => Promise<TRes>;
}

export interface ServiceOptions {
  skipDeletedRows?: boolean;
  schemaValidator?: (obj: any) => Promise<any>;
  publishEvents?: boolean;
  addCreatedAtField?: boolean;
  addUpdatedAtField?: boolean;
  outbox?: boolean;
  useAutoIncrement?: boolean; // If true, let MySQL handle ID generation; if false, generate string IDs
}

export type DrizzleTable = MySqlTable<any>;

// Re-export Drizzle's SQL type for where clauses
export { SQL } from 'drizzle-orm';

// Re-export common Drizzle operators for convenience
export {
  eq, ne, gt, gte, lt, lte, like, ilike, 
  isNull, isNotNull, inArray, notInArray,
  and, or, not, exists, notExists,
  between, notBetween
} from 'drizzle-orm';

export type SortOrder = 'asc' | 'desc';

export type Sort<T> = {
  [K in keyof T]?: SortOrder;
};

// Note: IDatabase and ServiceOptions are already exported above