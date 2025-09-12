# @paracelsus/node-sql

A Reactive MySQL wrapper with Drizzle ORM for Node.JS, featuring MySQL replication support with automatic read/write splitting.

## Features

- 🚀 **Reactive Event System** - Built-in event publishing for database changes
- 🔄 **MySQL Replication Support** - Master-slave replication with automatic read/write splitting
- 🛡️ **Type Safety** - Full TypeScript support with Drizzle ORM
- 📦 **Schema Validation** - Built-in support for Zod and Joi validation
- 🔄 **Transactions** - Full transaction support with automatic master routing
- 📊 **Soft Deletes** - Built-in soft delete functionality
- ⚡ **Performance** - Optimized queries with connection pooling
- 🐳 **Docker Ready** - Complete Docker setup with replication testing

## Installation

```bash
npm install @paracelsus/node-sql
```

## Quick Start

### Basic Usage (Single Database)

```typescript
import { Database, eq } from '@paracelsus/node-sql';
import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core';

// Define your table schema
const usersTable = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
});

// Initialize database
const database = new Database('mysql://user:pass@localhost:3306/mydb');
await database.connect();

// Create service
const userService = database.createService(usersTable);

// Use the service
const user = await userService.insertOne({
  email: 'john@example.com',
  name: 'John Doe',
});

const foundUser = await userService.findOne(
  eq(usersTable.email, 'john@example.com')
);
```

### Replication Setup (Master-Slave)

```typescript
import { ReplicationDatabase, ReplicationService, eq } from '@paracelsus/node-sql';

// Initialize replication database
const replicationDb = new ReplicationDatabase(
  'mysql://user:pass@master:3306/mydb',    // Master (writes)
  'mysql://user:pass@slave:3306/mydb'      // Slave (reads)
);

await replicationDb.connect();

// Create replication-aware service
const userService = new ReplicationService(usersTable, replicationDb);

// Writes automatically go to master
const user = await userService.insertOne({
  email: 'john@example.com',
  name: 'John Doe',
});

// Reads automatically go to slave
const foundUser = await userService.findOne(
  eq(usersTable.email, 'john@example.com')
);

// Wait for replication to catch up
await userService.waitForReplication(5000);
```

## Replication Features

### Automatic Read/Write Splitting

The `ReplicationService` automatically routes operations:

- **Write Operations** (INSERT, UPDATE, DELETE) → Master Database
- **Read Operations** (SELECT, COUNT) → Slave Database
- **Transactions** → Always use Master Database

### Replication Monitoring

```typescript
// Check replication lag
const lag = await replicationDb.checkReplicationLag();
console.log(`Replication lag: ${lag} bytes`);

// Wait for replication to catch up
const success = await replicationDb.waitForReplication(5000);
if (success) {
  console.log('Replication is up to date');
}
```

### Transaction Handling

```typescript
// Transactions always use master database
const result = await replicationDb.withTransaction(async (tx) => {
  const user1 = await tx.insert(usersTable).values({
    email: 'user1@example.com',
    name: 'User One',
  });

  const user2 = await tx.insert(usersTable).values({
    email: 'user2@example.com', 
    name: 'User Two',
  });

  return { user1, user2 };
});
```

## Docker Setup

The package includes a complete Docker setup for testing with MySQL replication:

```bash
# Run tests with replication
npm run tests

# Or manually with Docker Compose
docker-compose -f docker-compose.tests.yml up --build
```

### Docker Architecture

- **mysql-master**: Primary MySQL instance for writes
- **mysql-slave**: Secondary MySQL instance for reads
- **mysql-replication-setup**: Configures master-slave replication
- **tests**: Runs the test suite against the replication setup

## Event System

```typescript
import { eventBus } from '@paracelsus/node-sql';

// Listen for database changes
eventBus.on('users.created', (data) => {
  console.log('New user created:', data.doc);
});

eventBus.on('users.updated', (data) => {
  console.log('User updated:', data.doc);
  console.log('Previous data:', data.prevDoc);
});

eventBus.on('users.deleted', (data) => {
  console.log('User deleted:', data.doc);
});
```

## Schema Validation

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const userService = database.createService(usersTable, {
  schemaValidator: (obj) => userSchema.parseAsync(obj),
});
```

## Advanced Queries

```typescript
import { eq, and, or, like, gte, lte } from '@paracelsus/node-sql';

// Complex where conditions
const users = await userService.find(
  and(
    eq(usersTable.isActive, true),
    or(
      like(usersTable.name, '%John%'),
      like(usersTable.email, '%@company.com')
    ),
    gte(usersTable.createdAt, new Date('2024-01-01'))
  )
);

// Pagination
const paginatedUsers = await userService.find(
  eq(usersTable.isActive, true),
  { page: 1, perPage: 10 },
  { orderBy: { createdAt: 'desc' } }
);
```

## Configuration

### Environment Variables

```bash
# Single database
MYSQL_URL=mysql://user:pass@localhost:3306/mydb

# Replication setup
MYSQL_MASTER_URL=mysql://user:pass@master:3306/mydb
MYSQL_SLAVE_URL=mysql://user:pass@slave:3306/mydb
```

### Service Options

```typescript
const userService = database.createService(usersTable, {
  skipDeletedRows: true,        // Exclude soft-deleted records
  publishEvents: true,          // Enable event publishing
  addCreatedAtField: true,      // Auto-add createdAt timestamps
  addUpdatedAtField: true,      // Auto-add updatedAt timestamps
  outbox: false,                // Use outbox pattern for events
  schemaValidator: validator,   // Custom schema validation
});
```

## API Reference

### Database Classes

- `Database` - Single database connection
- `ReplicationDatabase` - Master-slave replication setup

### Service Classes

- `Service` - Basic service for single database
- `ReplicationService` - Service with read/write splitting

### Query Operators

All Drizzle operators are re-exported:
- `eq`, `ne`, `gt`, `gte`, `lt`, `lte`
- `like`, `ilike`, `isNull`, `isNotNull`
- `inArray`, `notInArray`
- `and`, `or`, `not`
- `exists`, `notExists`
- `between`, `notBetween`

## Migration from MongoDB

This package provides a similar API to `@paralect/node-mongo` but adapted for SQL:

```typescript
// MongoDB style (old)
const users = await userService.find({ 
  name: { $regex: 'John' },
  age: { $gte: 18 }
});

// SQL style (new)
const users = await userService.find(
  and(
    like(usersTable.name, '%John%'),
    gte(usersTable.age, 18)
  )
);
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for your changes
4. Run the test suite: `npm run tests`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.