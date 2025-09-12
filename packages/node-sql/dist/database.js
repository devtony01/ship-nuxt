"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const service_1 = __importDefault(require("./service"));
const logger_1 = __importDefault(require("./utils/logger"));
const outbox_1 = __importDefault(require("./events/outbox"));
class Database extends events_1.EventEmitter {
    constructor(url, options = {}) {
        super();
        this.waitForConnection = async () => {
            await this.connectPromise;
        };
        this.getOutboxService = () => this.outboxService;
        this.connect = async () => {
            try {
                this.connection = promise_1.default.createPool(Object.assign({ uri: this.url }, this.options));
                this.db = (0, mysql2_1.drizzle)(this.connection, { mode: 'default' });
                // Update outbox service with the database instance
                this.outboxService = new outbox_1.default(this.db, this.waitForConnection);
                this.emit('connected');
                logger_1.default.info('Connected to MySQL database.');
                this.connection.on('error', this.onClose);
                if (this.connectPromiseResolve) {
                    this.connectPromiseResolve();
                }
            }
            catch (e) {
                this.emit('error', e);
            }
        };
        this.close = async () => {
            if (!this.connection) {
                return;
            }
            logger_1.default.info('Disconnecting from MySQL database.');
            await this.connection.end();
        };
        this.getDb = () => {
            if (!this.db) {
                throw new Error('Database is not connected');
            }
            return this.db;
        };
        this.getConnection = async () => {
            await this.waitForConnection();
            if (!this.connection) {
                throw new Error('Database connection is not established');
            }
            return this.connection.getConnection();
        };
        this.withTransaction = async (transactionFn) => {
            if (!this.db) {
                throw new Error('Database is not connected');
            }
            let res;
            try {
                res = await this.db.transaction(async (tx) => {
                    return await transactionFn(tx);
                });
            }
            catch (error) {
                logger_1.default.error(error.stack || error);
                throw error;
            }
            return res;
        };
        this.url = url;
        this.options = options;
        this.connectPromise = new Promise((res) => { this.connectPromiseResolve = res; });
        // Initialize outbox service after connection is established
        this.outboxService = new outbox_1.default({}, // Will be set after connection
        this.waitForConnection);
    }
    createService(table, options) {
        return new service_1.default(table, this, options);
    }
    async ping() {
        await this.waitForConnection();
        if (!this.connection) {
            return null;
        }
        try {
            const [rows] = await this.connection.execute('SELECT 1 as ping');
            return rows;
        }
        catch (error) {
            logger_1.default.error('Database ping failed:', error);
            return null;
        }
    }
    onClose(error) {
        this.emit('disconnected', error);
    }
}
exports.default = Database;
