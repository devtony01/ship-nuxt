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
exports.addUpdatedAtField = exports.generateId = exports.deepCompare = void 0;
const _ = __importStar(require("lodash"));
const deepCompare = (data, initialData, properties) => properties.some((prop) => {
    let isChanged;
    if (typeof prop === 'string') {
        const value = _.get(data, prop);
        const initialValue = _.get(initialData, prop);
        isChanged = !_.isEqual(value, initialValue);
    }
    else {
        isChanged = Object.keys(prop).every((p) => {
            const value = _.get(data, p);
            const initialValue = _.get(initialData, p);
            return _.isEqual(value, prop[p]) && !_.isEqual(initialValue, prop[p]);
        });
    }
    return isChanged;
});
exports.deepCompare = deepCompare;
const generateId = () => {
    // Generate a unique string ID similar to MongoDB ObjectId
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const randomBytes = Math.random().toString(16).substring(2, 18);
    return timestamp + randomBytes;
};
exports.generateId = generateId;
const addUpdatedAtField = (update) => {
    return Object.assign(Object.assign({}, update), { updatedAt: new Date() });
};
exports.addUpdatedAtField = addUpdatedAtField;
