import { SQL } from 'drizzle-orm';
import type { MySqlDatabase } from 'drizzle-orm/mysql2';
import { IDocument, FindResult, ServiceOptions, ReadConfig, CreateConfig, UpdateConfig, DrizzleTable, Sort } from './types';
import ReplicationDatabase from './replication-database';
/**
 * Enhanced Service class with read/write splitting support
 * Automatically routes read operations to slave and write operations to master
 */
declare class ReplicationService<T extends IDocument> {
    private table;
    private _tableName;
    private options;
    private db;
    private waitForConnection;
    private changePublisher;
    constructor(table: DrizzleTable, db: ReplicationDatabase, options?: ServiceOptions);
    get tableName(): string;
    validateSchema: <U = T>(entity: U | Partial<U>) => Promise<U | Partial<U>>;
    protected handleReadOperations: (whereClause: SQL | undefined, _readConfig: ReadConfig) => SQL | undefined;
    protected validateCreateOperation: <U extends T = T>(object: Partial<U>, createConfig: CreateConfig) => Promise<U>;
    /**
     * Get database for read operations (uses slave)
     */
    protected getReadDb: () => MySqlDatabase<any, any>;
    /**
     * Get database for write operations (uses master)
     */
    protected getWriteDb: () => MySqlDatabase<any, any>;
    findOne: <U extends T = T>(whereClause?: SQL, readConfig?: ReadConfig, findOptions?: {
        orderBy?: Sort<U>;
    }) => Promise<U | null>;
    find: <U extends T = T>(whereClause?: SQL, readConfig?: ReadConfig & {
        page?: number;
        perPage?: number;
    }, findOptions?: {
        orderBy?: Sort<U>;
    }) => Promise<FindResult<U>>;
    exists: (whereClause?: SQL, readConfig?: ReadConfig) => Promise<boolean>;
    count: (whereClause?: SQL, readConfig?: ReadConfig) => Promise<number>;
    insertOne: <U extends T = T>(object: Partial<U>, createConfig?: CreateConfig) => Promise<U>;
    insertMany: <U extends T = T>(objects: Partial<U>[], createConfig?: CreateConfig) => Promise<U[]>;
    updateOne: <U extends T = T>(whereClause: SQL, updateFn: (doc: U) => Partial<U>, updateConfig?: UpdateConfig) => Promise<U | null>;
    /**
     * Helper method to read from master database (for consistency in updates)
     */
    private findOneFromMaster;
    /**
     * Wait for replication to catch up (useful for tests)
     */
    waitForReplication: (maxWaitMs?: number) => Promise<boolean>;
    countDocuments: (whereClause?: SQL, readConfig?: ReadConfig) => Promise<number>;
    drop: (_recreate?: boolean) => Promise<void>;
}
export default ReplicationService;
//# sourceMappingURL=replication-service.d.ts.map