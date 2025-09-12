import type { MySqlDatabase } from 'drizzle-orm/mysql2';
import { mysqlTable, varchar, timestamp, json } from 'drizzle-orm/mysql-core';

import { generateId } from '../utils/helpers';

import {
  DbChangeData, IChangePublisher, PublishEventOptions, OutboxEvent, DbChangeType,
} from '../types';
import logger from '../utils/logger';

const isDev = process.env.NODE_ENV === 'development';

// Define outbox table schema
const outboxTable = mysqlTable('outbox_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  tableName: varchar('table_name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  doc: json('doc').notNull(),
  prevDoc: json('prev_doc'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

class OutboxService implements IChangePublisher {
  private db: MySqlDatabase<any, any>;
  private connectionPromise: Promise<void>;
  private connectionPromiseResolve?: (value: void) => void;

  constructor(
    db: MySqlDatabase<any, any>,
    waitForConnection: () => Promise<void>,
  ) {
    this.db = db;
    this.connectionPromise = new Promise((res) => { this.connectionPromiseResolve = res; });

    waitForConnection().then(() => {
      if (this.connectionPromiseResolve) {
        this.connectionPromiseResolve();
      }
    });
  }

  private async waitForConnection() {
    await this.connectionPromise;
  }

  private async createEvent(
    tableName: string,
    changeType: DbChangeType,
    data: DbChangeData,
    options: { transaction?: any } = {},
  ): Promise<OutboxEvent | null> {
    await this.waitForConnection();

    const event: OutboxEvent = {
      id: generateId(),
      createdAt: new Date(),
      type: changeType,
      ...data,
    };

    const dbToUse = options.transaction || this.db;

    await dbToUse.insert(outboxTable).values({
      id: event.id,
      tableName,
      type: changeType,
      doc: event.doc,
      prevDoc: event.prevDoc,
      createdAt: event.createdAt,
    });

    if (isDev) {
      logger.info(`published outbox event: ${tableName} ${changeType}`);
    }

    return event;
  }

  private async createManyEvents(
    tableName: string,
    changeType: DbChangeType,
    data: DbChangeData[],
    options: { transaction?: any } = {},
  ): Promise<OutboxEvent[] | null> {
    await this.waitForConnection();

    const events: OutboxEvent[] = data.map((e) => ({
      id: generateId(),
      createdAt: new Date(),
      type: changeType,
      ...e,
    }));

    const dbToUse = options.transaction || this.db;

    const values = events.map((event) => ({
      id: event.id,
      tableName,
      type: changeType,
      doc: event.doc,
      prevDoc: event.prevDoc,
      createdAt: event.createdAt,
    }));

    await dbToUse.insert(outboxTable).values(values);

    if (isDev) {
      logger.info(`published outbox events: ${tableName} ${changeType}`);
    }

    return events;
  }

  async publishDbChange(
    tableName: string,
    changeType: DbChangeType,
    eventData: DbChangeData,
    options?: PublishEventOptions,
  ): Promise<void> {
    await this.createEvent(tableName, changeType, eventData, { transaction: options?.transaction });
  }

  async publishDbChanges(
    tableName: string,
    changeType: DbChangeType,
    eventsData: DbChangeData[],
    options?: PublishEventOptions,
  ): Promise<void> {
    await this.createManyEvents(
      tableName, changeType, eventsData, { transaction: options?.transaction },
    );
  }
}

export default OutboxService;