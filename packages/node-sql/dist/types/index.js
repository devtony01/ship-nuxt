"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notBetween = exports.between = exports.notExists = exports.exists = exports.not = exports.or = exports.and = exports.notInArray = exports.inArray = exports.isNotNull = exports.isNull = exports.ilike = exports.like = exports.lte = exports.lt = exports.gte = exports.gt = exports.ne = exports.eq = exports.SQL = void 0;
// Re-export Drizzle's SQL type for where clauses
var drizzle_orm_1 = require("drizzle-orm");
Object.defineProperty(exports, "SQL", { enumerable: true, get: function () { return drizzle_orm_1.SQL; } });
// Re-export common Drizzle operators for convenience
var drizzle_orm_2 = require("drizzle-orm");
Object.defineProperty(exports, "eq", { enumerable: true, get: function () { return drizzle_orm_2.eq; } });
Object.defineProperty(exports, "ne", { enumerable: true, get: function () { return drizzle_orm_2.ne; } });
Object.defineProperty(exports, "gt", { enumerable: true, get: function () { return drizzle_orm_2.gt; } });
Object.defineProperty(exports, "gte", { enumerable: true, get: function () { return drizzle_orm_2.gte; } });
Object.defineProperty(exports, "lt", { enumerable: true, get: function () { return drizzle_orm_2.lt; } });
Object.defineProperty(exports, "lte", { enumerable: true, get: function () { return drizzle_orm_2.lte; } });
Object.defineProperty(exports, "like", { enumerable: true, get: function () { return drizzle_orm_2.like; } });
Object.defineProperty(exports, "ilike", { enumerable: true, get: function () { return drizzle_orm_2.ilike; } });
Object.defineProperty(exports, "isNull", { enumerable: true, get: function () { return drizzle_orm_2.isNull; } });
Object.defineProperty(exports, "isNotNull", { enumerable: true, get: function () { return drizzle_orm_2.isNotNull; } });
Object.defineProperty(exports, "inArray", { enumerable: true, get: function () { return drizzle_orm_2.inArray; } });
Object.defineProperty(exports, "notInArray", { enumerable: true, get: function () { return drizzle_orm_2.notInArray; } });
Object.defineProperty(exports, "and", { enumerable: true, get: function () { return drizzle_orm_2.and; } });
Object.defineProperty(exports, "or", { enumerable: true, get: function () { return drizzle_orm_2.or; } });
Object.defineProperty(exports, "not", { enumerable: true, get: function () { return drizzle_orm_2.not; } });
Object.defineProperty(exports, "exists", { enumerable: true, get: function () { return drizzle_orm_2.exists; } });
Object.defineProperty(exports, "notExists", { enumerable: true, get: function () { return drizzle_orm_2.notExists; } });
Object.defineProperty(exports, "between", { enumerable: true, get: function () { return drizzle_orm_2.between; } });
Object.defineProperty(exports, "notBetween", { enumerable: true, get: function () { return drizzle_orm_2.notBetween; } });
// Note: IDatabase and ServiceOptions are already exported above
