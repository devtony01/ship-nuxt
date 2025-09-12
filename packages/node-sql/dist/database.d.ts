import { EventEmitter } from 'events';
import type { MySqlDatabase } from 'drizzle-orm/mysql2';
import mysql, { Connection } from 'mysql2/promise';
import { IDatabase, IDocument, ServiceOptions, DrizzleTable } from './types';
import Service from './service';
import OutboxService from './events/outbox';
declare class Database extends EventEmitter implements IDatabase {
    url: string;
    options: mysql.PoolOptions;
    private db?;
    private connection?;
    connectPromise: Promise<void>;
    connectPromiseResolve?: (value: void) => void;
    outboxService: OutboxService;
    constructor(url: string, options?: mysql.PoolOptions);
    waitForConnection: () => Promise<void>;
    getOutboxService: () => OutboxService;
    connect: () => Promise<void>;
    close: () => Promise<void>;
    createService<T extends IDocument>(table: DrizzleTable, options?: ServiceOptions | undefined): Service<T>;
    ping(): Promise<any>;
    private onClose;
    getDb: () => MySqlDatabase<any, any>;
    getConnection: () => Promise<Connection>;
    withTransaction: <TRes = any>(transactionFn: (tx: MySqlDatabase<any, any>) => Promise<TRes>) => Promise<TRes>;
}
export default Database;
//# sourceMappingURL=database.d.ts.map