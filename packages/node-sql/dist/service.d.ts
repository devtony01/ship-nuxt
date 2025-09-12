import { SQL } from 'drizzle-orm';
import type { MySqlDatabase } from 'drizzle-orm/mysql2';
import { IDocument, FindResult, IDatabase, ServiceOptions, ReadConfig, CreateConfig, UpdateConfig, DeleteConfig, DrizzleTable, Sort } from './types';
declare class Service<T extends IDocument> {
    private table;
    private _tableName;
    private options;
    private db;
    private waitForConnection;
    private changePublisher;
    constructor(table: DrizzleTable, db: IDatabase, options?: ServiceOptions);
    get tableName(): string;
    validateSchema: <U = T>(entity: U | Partial<U>) => Promise<U | Partial<U>>;
    protected handleReadOperations: (whereClause: SQL | undefined, readConfig: ReadConfig) => SQL | undefined;
    protected validateCreateOperation: <U extends T = T>(object: Partial<U>, createConfig: CreateConfig) => Promise<U>;
    protected getDb: () => MySqlDatabase<any, any>;
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
    updateMany: <U extends T = T>(whereClause: SQL, updateFn: (doc: U) => Partial<U>, updateConfig?: UpdateConfig) => Promise<U[]>;
    deleteOne: <U extends T = T>(whereClause: SQL, deleteConfig?: DeleteConfig) => Promise<U | null>;
    deleteMany: <U extends T = T>(whereClause: SQL, deleteConfig?: DeleteConfig) => Promise<U[]>;
    deleteSoft: <U extends T = T>(whereClause: SQL, deleteConfig?: DeleteConfig) => Promise<U[]>;
    atomic: {
        updateOne: (whereClause: SQL, updateData: Partial<T>, readConfig?: ReadConfig) => Promise<any>;
        updateMany: (whereClause: SQL, updateData: Partial<T>, readConfig?: ReadConfig) => Promise<any>;
    };
    countDocuments: (whereClause?: SQL, readConfig?: ReadConfig) => Promise<number>;
    distinct: (field: string, whereClause?: SQL, readConfig?: ReadConfig) => Promise<any[]>;
    replaceOne: (whereClause: SQL, replacement: Partial<T>, readConfig?: ReadConfig) => Promise<any>;
    createIndex: (_indexSpec: any, _options?: any) => Promise<string>;
    createIndexes: (indexSpecs: any[], _options?: any) => Promise<string[]>;
    indexExists: (_indexName: string | string[]) => Promise<boolean>;
    dropIndex: (_indexName: string) => Promise<void>;
    dropIndexes: () => Promise<void>;
    aggregate: (_pipeline: any[]) => Promise<any[]>;
    drop: (_recreate?: boolean) => Promise<void>;
}
export default Service;
//# sourceMappingURL=service.d.ts.map