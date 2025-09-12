import { EventEmitter } from 'events';
import { drizzle } from 'drizzle-orm/mysql2';
import type { MySqlDatabase } from 'drizzle-orm/mysql2';
import mysql, { Connection, Pool } from 'mysql2/promise';

import { IDatabase, IDocument, ServiceOptions, DrizzleTable } from './types';
import Service from './service';
import logger from './utils/logger';
import OutboxService from './events/outbox';

class Database extends EventEmitter implements IDatabase {
  url: string;
  options: mysql.PoolOptions;
  private db?: MySqlDatabase<any, any>;
  private connection?: Pool;
  connectPromise: Promise<void>;
  connectPromiseResolve?: (value: void) => void;
  outboxService: OutboxService;

  constructor(url: string, options: mysql.PoolOptions = {}) {
    super();

    this.url = url;
    this.options = options;

    this.connectPromise = new Promise((res) => { this.connectPromiseResolve = res; });
    
    // Initialize outbox service after connection is established
    this.outboxService = new OutboxService(
      {} as MySqlDatabase<any, any>, // Will be set after connection
      this.waitForConnection
    );
  }

  public waitForConnection = async (): Promise<void> => {
    await this.connectPromise;
  };

  public getOutboxService = (): OutboxService => this.outboxService;

  connect = async (): Promise<void> => {
    try {
      this.connection = mysql.createPool({
        uri: this.url,
        ...this.options,
      });

      this.db = drizzle(this.connection, { mode: 'default' });

      // Update outbox service with the database instance
      this.outboxService = new OutboxService(this.db, this.waitForConnection);

      this.emit('connected');
      logger.info('Connected to MySQL database.');
      this.connection.on('error', this.onClose);

      if (this.connectPromiseResolve) {
        this.connectPromiseResolve();
      }
    } catch (e) {
      this.emit('error', e);
    }
  };

  close = async (): Promise<void> => {
    if (!this.connection) {
      return;
    }
    logger.info('Disconnecting from MySQL database.');
    await this.connection.end();
  };

  createService<T extends IDocument>(
    table: DrizzleTable,
    options?: ServiceOptions | undefined,
  ): Service<T> {
    return new Service<T>(
      table,
      this as IDatabase,
      options,
    );
  }

  async ping(): Promise<any> {
    await this.waitForConnection();

    if (!this.connection) {
      return null;
    }

    try {
      const [rows] = await this.connection.execute('SELECT 1 as ping');
      return rows;
    } catch (error) {
      logger.error('Database ping failed:', error);
      return null;
    }
  }

  private onClose(error: any) {
    this.emit('disconnected', error);
  }

  public getDb = (): MySqlDatabase<any, any> => {
    if (!this.db) {
      throw new Error('Database is not connected');
    }
    return this.db;
  };

  public getConnection = async (): Promise<Connection> => {
    await this.waitForConnection();
    if (!this.connection) {
      throw new Error('Database connection is not established');
    }
    return this.connection.getConnection();
  };

  public withTransaction = async <TRes = any>(
    transactionFn: (tx: MySqlDatabase<any, any>) => Promise<TRes>,
  ): Promise<TRes> => {
    if (!this.db) {
      throw new Error('Database is not connected');
    }

    let res: any;

    try {
      res = await this.db.transaction(async (tx) => {
        return await transactionFn(tx);
      });
    } catch (error: any) {
      logger.error(error.stack || error);
      throw error;
    }

    return res as TRes;
  };
}

export default Database;