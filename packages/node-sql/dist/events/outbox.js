"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_core_1 = require("drizzle-orm/mysql-core");
const helpers_1 = require("../utils/helpers");
const logger_1 = __importDefault(require("../utils/logger"));
const isDev = process.env.NODE_ENV === 'development';
// Define outbox table schema
const outboxTable = (0, mysql_core_1.mysqlTable)('outbox_events', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    tableName: (0, mysql_core_1.varchar)('table_name', { length: 255 }).notNull(),
    type: (0, mysql_core_1.varchar)('type', { length: 50 }).notNull(),
    doc: (0, mysql_core_1.json)('doc').notNull(),
    prevDoc: (0, mysql_core_1.json)('prev_doc'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
});
class OutboxService {
    constructor(db, waitForConnection) {
        this.db = db;
        this.connectionPromise = new Promise((res) => { this.connectionPromiseResolve = res; });
        waitForConnection().then(() => {
            if (this.connectionPromiseResolve) {
                this.connectionPromiseResolve();
            }
        });
    }
    async waitForConnection() {
        await this.connectionPromise;
    }
    async createEvent(tableName, changeType, data, options = {}) {
        await this.waitForConnection();
        const event = Object.assign({ id: (0, helpers_1.generateId)(), createdAt: new Date(), type: changeType }, data);
        const dbToUse = options.transaction || this.db;
        await dbToUse.insert(outboxTable).values({
            id: event.id,
            tableName,
            type: changeType,
            doc: event.doc,
            prevDoc: event.prevDoc,
            createdAt: event.createdAt,
        });
        if (isDev) {
            logger_1.default.info(`published outbox event: ${tableName} ${changeType}`);
        }
        return event;
    }
    async createManyEvents(tableName, changeType, data, options = {}) {
        await this.waitForConnection();
        const events = data.map((e) => (Object.assign({ id: (0, helpers_1.generateId)(), createdAt: new Date(), type: changeType }, e)));
        const dbToUse = options.transaction || this.db;
        const values = events.map((event) => ({
            id: event.id,
            tableName,
            type: changeType,
            doc: event.doc,
            prevDoc: event.prevDoc,
            createdAt: event.createdAt,
        }));
        await dbToUse.insert(outboxTable).values(values);
        if (isDev) {
            logger_1.default.info(`published outbox events: ${tableName} ${changeType}`);
        }
        return events;
    }
    async publishDbChange(tableName, changeType, eventData, options) {
        await this.createEvent(tableName, changeType, eventData, { transaction: options === null || options === void 0 ? void 0 : options.transaction });
    }
    async publishDbChanges(tableName, changeType, eventsData, options) {
        await this.createManyEvents(tableName, changeType, eventsData, { transaction: options === null || options === void 0 ? void 0 : options.transaction });
    }
}
exports.default = OutboxService;
