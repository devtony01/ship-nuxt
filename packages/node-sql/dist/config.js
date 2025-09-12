"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = void 0;
const _ = __importStar(require("lodash"));
const env = process.env.NODE_ENV || 'test';
// Base configuration
let base = {
    env,
    mysql: {
        connection: process.env.MYSQL_URL || 'mysql://testuser:testpass@mysql:3306/testdb',
        master: process.env.MYSQL_MASTER_URL || 'mysql://testuser:testpass@mysql-master:3306/testdb',
        slave: process.env.MYSQL_SLAVE_URL || 'mysql://testuser:testpass@mysql-slave:3306/testdb',
    },
};
const load = () => {
    let resultConfig = base;
    let localConfig = { default: {} };
    try {
        localConfig = require('./config/local');
        resultConfig = _.merge(resultConfig, localConfig.default);
    }
    catch (_a) {
        // Local config is optional
    }
    return resultConfig;
};
exports.load = load;
base = load();
exports.default = base;
