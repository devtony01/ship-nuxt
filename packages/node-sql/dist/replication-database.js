"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const service_1 = __importDefault(require("./service"));
const outbox_1 = __importDefault(require("./events/outbox"));
/**
 * Enhanced Database class with MySQL Master-Slave replication support
 * Provides read/write splitting for better performance and scalability
 */
class ReplicationDatabase extends events_1.EventEmitter {
    constructor(masterUrl, slaveUrl, options = {}) {
        super();
        this.waitForConnection = async () => {
            await this.connectPromise;
        };
        this.createService = (table, options = {}) => {
            return new service_1.default(table, this, options);
        };
        this.getOutboxService = () => {
            return this.outboxService;
        };
        /**
         * Get master database for write operations
         */
        this.getDb = () => {
            return this.getMasterDb();
        };
        /**
         * Get master database for write operations
         */
        this.getMasterDb = () => {
            if (!this.masterDb) {
                throw new Error('Master database is not connected');
            }
            return this.masterDb;
        };
        /**
         * Get slave database for read operations
         */
        this.getSlaveDb = () => {
            if (!this.slaveDb) {
                throw new Error('Slave database is not connected');
            }
            return this.slaveDb;
        };
        /**
         * Get appropriate database based on operation type
         * @param forWrite - true for write operations (uses master), false for read operations (uses slave)
         */
        this.getDbForOperation = (forWrite = false) => {
            return forWrite ? this.getMasterDb() : this.getSlaveDb();
        };
        this.getConnection = async () => {
            if (!this.masterConnection) {
                throw new Error('Master database is not connected');
            }
            return this.masterConnection.getConnection();
        };
        this.getMasterConnection = async () => {
            if (!this.masterConnection) {
                throw new Error('Master database is not connected');
            }
            return this.masterConnection.getConnection();
        };
        this.getSlaveConnection = async () => {
            if (!this.slaveConnection) {
                throw new Error('Slave database is not connected');
            }
            return this.slaveConnection.getConnection();
        };
        this.withTransaction = async (transactionFn) => {
            if (!this.masterDb) {
                throw new Error('Master database is not connected');
            }
            // Transactions always use master database
            return this.masterDb.transaction(transactionFn);
        };
        this.masterUrl = masterUrl;
        this.slaveUrl = slaveUrl;
        this.options = options;
        this.connectPromise = new Promise((res) => { this.connectPromiseResolve = res; });
        // Initialize outbox service after connection is established
        this.outboxService = new outbox_1.default({}, // Will be set after connection
        this.waitForConnection);
    }
    async connect() {
        try {
            // Connect to master
            this.masterConnection = promise_1.default.createPool(Object.assign({ uri: this.masterUrl }, this.options));
            this.masterDb = (0, mysql2_1.drizzle)(this.masterConnection);
            // Connect to slave
            this.slaveConnection = promise_1.default.createPool(Object.assign({ uri: this.slaveUrl }, this.options));
            this.slaveDb = (0, mysql2_1.drizzle)(this.slaveConnection);
            // Test connections
            await this.masterConnection.getConnection().then(conn => {
                conn.release();
                console.log('✅ Connected to MySQL Master');
            });
            await this.slaveConnection.getConnection().then(conn => {
                conn.release();
                console.log('✅ Connected to MySQL Slave');
            });
            // Set up outbox service with master database
            this.outboxService = new outbox_1.default(this.masterDb, this.waitForConnection);
            this.masterConnection.on('connection', this.onConnect);
            this.masterConnection.on('error', this.onError);
            this.slaveConnection.on('error', this.onError);
            this.emit('connected');
            if (this.connectPromiseResolve) {
                this.connectPromiseResolve();
            }
        }
        catch (error) {
            console.error('Failed to connect to MySQL:', error);
            this.emit('error', error);
            throw error;
        }
    }
    async close() {
        if (this.masterConnection) {
            await this.masterConnection.end();
        }
        if (this.slaveConnection) {
            await this.slaveConnection.end();
        }
        this.emit('disconnected');
    }
    onConnect() {
        this.emit('connected');
    }
    onError(error) {
        this.emit('error', error);
    }
    onClose(error) {
        this.emit('disconnected', error);
    }
    /**
     * Check replication lag between master and slave
     */
    async checkReplicationLag() {
        try {
            const masterConnection = await this.getMasterConnection();
            const slaveConnection = await this.getSlaveConnection();
            // Get master position
            const [masterStatus] = await masterConnection.execute('SHOW MASTER STATUS');
            const masterPos = masterStatus[0];
            // Get slave position
            const [slaveStatus] = await slaveConnection.execute('SHOW SLAVE STATUS');
            const slavePos = slaveStatus[0];
            masterConnection.release();
            slaveConnection.release();
            if (!masterPos || !slavePos) {
                throw new Error('Could not get replication status');
            }
            // Calculate lag (simplified - in production you'd want more sophisticated lag calculation)
            const masterLogPos = masterPos.Position;
            const slaveLogPos = slavePos.Exec_Master_Log_Pos;
            return Math.abs(masterLogPos - slaveLogPos);
        }
        catch (error) {
            console.error('Error checking replication lag:', error);
            return -1; // Return -1 to indicate error
        }
    }
    /**
     * Wait for slave to catch up to master (useful for tests)
     */
    async waitForReplication(maxWaitMs = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitMs) {
            const lag = await this.checkReplicationLag();
            if (lag === 0) {
                return true;
            }
            if (lag === -1) {
                return false; // Error occurred
            }
            // Wait a bit before checking again
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return false; // Timeout
    }
}
exports.default = ReplicationDatabase;
