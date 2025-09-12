import { DbChangeData, DbChangeType, IChangePublisher, InMemoryEvent, InMemoryEventHandler, OnUpdatedProperties } from '../types';
declare class EventBus {
    private _bus;
    constructor();
    publish(name: string, event: Partial<InMemoryEvent>): Promise<void>;
    on: (eventName: string, handler: InMemoryEventHandler) => void;
    once: (eventName: string, handler: InMemoryEventHandler) => void;
    onUpdated: (entity: string, properties: OnUpdatedProperties, handler: InMemoryEventHandler) => void;
}
declare const eventBus: EventBus;
declare class InMemoryPublisher implements IChangePublisher {
    private _bus;
    private static getEventName;
    publishDbChange(tableName: string, changeType: DbChangeType, eventData: DbChangeData): Promise<void>;
    publishDbChanges(tableName: string, changeType: DbChangeType, eventsData: DbChangeData[]): Promise<void>;
}
declare const inMemoryPublisher: InMemoryPublisher;
export { inMemoryPublisher, eventBus, };
//# sourceMappingURL=in-memory.d.ts.map