import { EventEmitter } from 'events';
import { drizzle } from 'drizzle-orm/mysql2';
import type { MySqlDatabase } from 'drizzle-orm/mysql2';
import mysql, { Connection, Pool } from 'mysql2/promise';

import { IDatabase, IDocument, ServiceOptions, DrizzleTable } from './types';
import Service from './service';
import OutboxService from './events/outbox';

/**
 * Enhanced Database class with MySQL Master-Slave replication support
 * Provides read/write splitting for better performance and scalability
 */
class ReplicationDatabase extends EventEmitter implements IDatabase {
  masterUrl: string;
  slaveUrl: string;
  options: mysql.PoolOptions;
  
  private masterDb?: MySqlDatabase<any, any>;
  private slaveDb?: MySqlDatabase<any, any>;
  private masterConnection?: Pool;
  private slaveConnection?: Pool;
  
  connectPromise: Promise<void>;
  connectPromiseResolve?: (value: void) => void;
  outboxService: OutboxService;

  constructor(
    masterUrl: string,
    slaveUrl: string,
    options: mysql.PoolOptions = {},
  ) {
    super();
    this.masterUrl = masterUrl;
    this.slaveUrl = slaveUrl;
    this.options = options;
    this.connectPromise = new Promise((res) => { this.connectPromiseResolve = res; });
    
    // Initialize outbox service after connection is established
    this.outboxService = new OutboxService(
      {} as MySqlDatabase<any, any>, // Will be set after connection
      this.waitForConnection
    );
  }

  async connect() {
    try {
      // Connect to master
      this.masterConnection = mysql.createPool({
        uri: this.masterUrl,
        ...this.options,
      });

      this.masterDb = drizzle(this.masterConnection);
      
      // Connect to slave
      this.slaveConnection = mysql.createPool({
        uri: this.slaveUrl,
        ...this.options,
      });

      this.slaveDb = drizzle(this.slaveConnection);

      // Test connections
      await this.masterConnection.getConnection().then(conn => {
        conn.release();
        console.log('✅ Connected to MySQL Master');
      });

      await this.slaveConnection.getConnection().then(conn => {
        conn.release();
        console.log('✅ Connected to MySQL Slave');
      });

      // Set up outbox service with master database
      this.outboxService = new OutboxService(
        this.masterDb,
        this.waitForConnection
      );

      (this.masterConnection as any).on('connection', this.onConnect);
      (this.masterConnection as any).on('error', this.onError);
      (this.slaveConnection as any).on('error', this.onError);

      this.emit('connected');

      if (this.connectPromiseResolve) {
        this.connectPromiseResolve();
      }
    } catch (error) {
      console.error('Failed to connect to MySQL:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async close() {
    if (this.masterConnection) {
      await this.masterConnection.end();
    }
    if (this.slaveConnection) {
      await this.slaveConnection.end();
    }
    this.emit('disconnected');
  }

  public waitForConnection = async (): Promise<void> => {
    await this.connectPromise;
  };

  public createService = <T extends IDocument>(
    table: DrizzleTable,
    options: ServiceOptions = {},
  ): Service<T> => {
    return new Service<T>(table, this, options);
  };

  public getOutboxService = (): OutboxService => {
    return this.outboxService;
  };

  private onConnect() {
    this.emit('connected');
  }

  private onError(error: any) {
    this.emit('error', error);
  }

  private onClose(error: any) {
    this.emit('disconnected', error);
  }

  /**
   * Get master database for write operations
   */
  public getDb = (): MySqlDatabase<any, any> => {
    return this.getMasterDb();
  };

  /**
   * Get master database for write operations
   */
  public getMasterDb = (): MySqlDatabase<any, any> => {
    if (!this.masterDb) {
      throw new Error('Master database is not connected');
    }
    return this.masterDb;
  };

  /**
   * Get slave database for read operations
   */
  public getSlaveDb = (): MySqlDatabase<any, any> => {
    if (!this.slaveDb) {
      throw new Error('Slave database is not connected');
    }
    return this.slaveDb;
  };

  /**
   * Get appropriate database based on operation type
   * @param forWrite - true for write operations (uses master), false for read operations (uses slave)
   */
  public getDbForOperation = (forWrite: boolean = false): MySqlDatabase<any, any> => {
    return forWrite ? this.getMasterDb() : this.getSlaveDb();
  };

  public getConnection = async (): Promise<Connection> => {
    if (!this.masterConnection) {
      throw new Error('Master database is not connected');
    }
    return this.masterConnection.getConnection();
  };

  public getMasterConnection = async (): Promise<Connection> => {
    if (!this.masterConnection) {
      throw new Error('Master database is not connected');
    }
    return this.masterConnection.getConnection();
  };

  public getSlaveConnection = async (): Promise<Connection> => {
    if (!this.slaveConnection) {
      throw new Error('Slave database is not connected');
    }
    return this.slaveConnection.getConnection();
  };

  public withTransaction = async <TRes = any>(
    transactionFn: (tx: MySqlDatabase<any, any>) => Promise<TRes>,
  ): Promise<TRes> => {
    if (!this.masterDb) {
      throw new Error('Master database is not connected');
    }

    // Transactions always use master database
    return this.masterDb.transaction(transactionFn);
  };

  /**
   * Check replication lag between master and slave
   */
  public async checkReplicationLag(): Promise<number> {
    try {
      const masterConnection = await this.getMasterConnection();
      const slaveConnection = await this.getSlaveConnection();

      // Get master position
      const [masterStatus] = await masterConnection.execute('SHOW MASTER STATUS');
      const masterPos = (masterStatus as any[])[0];

      // Get slave position
      const [slaveStatus] = await slaveConnection.execute('SHOW SLAVE STATUS');
      const slavePos = (slaveStatus as any[])[0];

      (masterConnection as any).release();
      (slaveConnection as any).release();

      if (!masterPos || !slavePos) {
        throw new Error('Could not get replication status');
      }

      // Calculate lag (simplified - in production you'd want more sophisticated lag calculation)
      const masterLogPos = masterPos.Position;
      const slaveLogPos = slavePos.Exec_Master_Log_Pos;
      
      return Math.abs(masterLogPos - slaveLogPos);
    } catch (error) {
      console.error('Error checking replication lag:', error);
      return -1; // Return -1 to indicate error
    }
  }

  /**
   * Wait for slave to catch up to master (useful for tests)
   */
  public async waitForReplication(maxWaitMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      const lag = await this.checkReplicationLag();
      if (lag === 0) {
        return true;
      }
      if (lag === -1) {
        return false; // Error occurred
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false; // Timeout
  }
}

export default ReplicationDatabase;