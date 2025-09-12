import type { MySqlDatabase } from 'drizzle-orm/mysql2';
import { DbChangeData, IChangePublisher, PublishEventOptions, DbChangeType } from '../types';
declare class OutboxService implements IChangePublisher {
    private db;
    private connectionPromise;
    private connectionPromiseResolve?;
    constructor(db: MySqlDatabase<any, any>, waitForConnection: () => Promise<void>);
    private waitForConnection;
    private createEvent;
    private createManyEvents;
    publishDbChange(tableName: string, changeType: DbChangeType, eventData: DbChangeData, options?: PublishEventOptions): Promise<void>;
    publishDbChanges(tableName: string, changeType: DbChangeType, eventsData: DbChangeData[], options?: PublishEventOptions): Promise<void>;
}
export default OutboxService;
//# sourceMappingURL=outbox.d.ts.map