// eslint-disable-next-line max-classes-per-file
import { EventEmitter } from 'events';

import {
  DbChangeData, DbChangeType, IChangePublisher, InMemoryEvent,
  InMemoryEventHandler, OnUpdatedProperties,
} from '../types';
import { deepCompare } from '../utils/helpers';
import logger from '../utils/logger';

const isDev = process.env.NODE_ENV === 'development';

class EventBus {
  private _bus: EventEmitter;

  constructor() {
    this._bus = new EventEmitter();
  }

  async publish(
    name: string, event: Partial<InMemoryEvent>,
  ): Promise<void> {
    const evtCopy = {
      ...event,
    };

    if (!evtCopy.createdAt) {
      evtCopy.createdAt = new Date();
    }

    this._bus.emit(name, evtCopy);
  }

  on = (eventName: string, handler: InMemoryEventHandler): void => {
    this._bus.on(eventName, handler);
  };

  once = (eventName: string, handler: InMemoryEventHandler): void => {
    this._bus.once(eventName, handler);
  };

  onUpdated = (entity: string, properties: OnUpdatedProperties, handler: InMemoryEventHandler): void => this.on(`${entity}.updated`, (event) => {
    const isChanged = deepCompare(
      event.doc,
      event.prevDoc,
      properties as Array<string | Record<string, unknown>>,
    );

    if (isChanged) handler(event);
  });
}

const eventBus = new EventBus();

class InMemoryPublisher implements IChangePublisher {
  private _bus = eventBus;

  private static getEventName(tableName: string, eventType: DbChangeType) {
    return `${tableName}.${eventType}d`;
  }

  async publishDbChange(
    tableName: string,
    changeType: DbChangeType,
    eventData: DbChangeData,
  ): Promise<void> {
    const name = InMemoryPublisher.getEventName(tableName, changeType);
    const evt: Partial<InMemoryEvent> = {
      name,
      doc: eventData.doc,
      prevDoc: eventData.prevDoc,
    };

    this._bus.publish(name, evt);

    if (isDev) {
      logger.info(`published in-memory event: ${name}`);
    }
  }

  async publishDbChanges(
    tableName: string,
    changeType: DbChangeType,
    eventsData: DbChangeData[],
  ): Promise<void> {
    eventsData.forEach((evt: DbChangeData) => {
      this.publishDbChange(tableName, changeType, evt);
    });
  }
}

const inMemoryPublisher = new InMemoryPublisher();

export {
  inMemoryPublisher,
  eventBus,
};