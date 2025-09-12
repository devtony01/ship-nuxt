"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.inMemoryPublisher = void 0;
// eslint-disable-next-line max-classes-per-file
const events_1 = require("events");
const helpers_1 = require("../utils/helpers");
const logger_1 = __importDefault(require("../utils/logger"));
const isDev = process.env.NODE_ENV === 'development';
class EventBus {
    constructor() {
        this.on = (eventName, handler) => {
            this._bus.on(eventName, handler);
        };
        this.once = (eventName, handler) => {
            this._bus.once(eventName, handler);
        };
        this.onUpdated = (entity, properties, handler) => this.on(`${entity}.updated`, (event) => {
            const isChanged = (0, helpers_1.deepCompare)(event.doc, event.prevDoc, properties);
            if (isChanged)
                handler(event);
        });
        this._bus = new events_1.EventEmitter();
    }
    async publish(name, event) {
        const evtCopy = Object.assign({}, event);
        if (!evtCopy.createdAt) {
            evtCopy.createdAt = new Date();
        }
        this._bus.emit(name, evtCopy);
    }
}
const eventBus = new EventBus();
exports.eventBus = eventBus;
class InMemoryPublisher {
    constructor() {
        this._bus = eventBus;
    }
    static getEventName(tableName, eventType) {
        return `${tableName}.${eventType}d`;
    }
    async publishDbChange(tableName, changeType, eventData) {
        const name = InMemoryPublisher.getEventName(tableName, changeType);
        const evt = {
            name,
            doc: eventData.doc,
            prevDoc: eventData.prevDoc,
        };
        this._bus.publish(name, evt);
        if (isDev) {
            logger_1.default.info(`published in-memory event: ${name}`);
        }
    }
    async publishDbChanges(tableName, changeType, eventsData) {
        eventsData.forEach((evt) => {
            this.publishDbChange(tableName, changeType, evt);
        });
    }
}
const inMemoryPublisher = new InMemoryPublisher();
exports.inMemoryPublisher = inMemoryPublisher;
