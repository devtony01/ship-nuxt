import { EventEmitter } from 'events';
import type { MySqlDatabase } from 'drizzle-orm/mysql2';
import mysql, { Connection } from 'mysql2/promise';
import { IDatabase, IDocument, ServiceOptions, DrizzleTable } from './types';
import Service from './service';
import OutboxService from './events/outbox';
/**
 * Enhanced Database class with MySQL Master-Slave replication support
 * Provides read/write splitting for better performance and scalability
 */
declare class ReplicationDatabase extends EventEmitter implements IDatabase {
    masterUrl: string;
    slaveUrl: string;
    options: mysql.PoolOptions;
    private masterDb?;
    private slaveDb?;
    private masterConnection?;
    private slaveConnection?;
    connectPromise: Promise<void>;
    connectPromiseResolve?: (value: void) => void;
    outboxService: OutboxService;
    constructor(masterUrl: string, slaveUrl: string, options?: mysql.PoolOptions);
    connect(): Promise<void>;
    close(): Promise<void>;
    waitForConnection: () => Promise<void>;
    createService: <T extends IDocument>(table: DrizzleTable, options?: ServiceOptions) => Service<T>;
    getOutboxService: () => OutboxService;
    private onConnect;
    private onError;
    private onClose;
    /**
     * Get master database for write operations
     */
    getDb: () => MySqlDatabase<any, any>;
    /**
     * Get master database for write operations
     */
    getMasterDb: () => MySqlDatabase<any, any>;
    /**
     * Get slave database for read operations
     */
    getSlaveDb: () => MySqlDatabase<any, any>;
    /**
     * Get appropriate database based on operation type
     * @param forWrite - true for write operations (uses master), false for read operations (uses slave)
     */
    getDbForOperation: (forWrite?: boolean) => MySqlDatabase<any, any>;
    getConnection: () => Promise<Connection>;
    getMasterConnection: () => Promise<Connection>;
    getSlaveConnection: () => Promise<Connection>;
    withTransaction: <TRes = any>(transactionFn: (tx: MySqlDatabase<any, any>) => Promise<TRes>) => Promise<TRes>;
    /**
     * Check replication lag between master and slave
     */
    checkReplicationLag(): Promise<number>;
    /**
     * Wait for slave to catch up to master (useful for tests)
     */
    waitForReplication(maxWaitMs?: number): Promise<boolean>;
}
export default ReplicationDatabase;
//# sourceMappingURL=replication-database.d.ts.map