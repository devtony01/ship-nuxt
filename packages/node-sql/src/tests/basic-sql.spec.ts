import chai from 'chai';
import { z } from 'zod';
import spies from 'chai-spies';
import { mysqlTable, varchar, timestamp, int } from 'drizzle-orm/mysql-core';
import { eq, like } from 'drizzle-orm';

import { Database, eventBus } from '../../dist/index.js';

import 'mocha';

chai.use(spies);
chai.should();

// Define test table
const usersTable = mysqlTable('test_users', {
  id: int('id').primaryKey().autoincrement(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

type User = typeof usersTable.$inferSelect;

const schema = z.object({
  id: z.number().optional(),
  fullName: z.string(),
  email: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
});

// Test configuration
const config = {
  env: process.env.NODE_ENV || 'test',
  mysql: {
    connection: process.env.MYSQL_URL || 'mysql://testuser:testpass@mysql-simple:3306/testdb',
  },
};

const database = new Database(config.mysql.connection);

describe('Basic SQL Operations', () => {
  let usersService: any;

  before(async () => {
    try {
      console.log('🔧 Test Configuration:');
      console.log('  Environment:', config.env);
      console.log('  MySQL URL:', config.mysql.connection);
      
      console.log('🔌 Connecting to database...');
      await database.connect();
      
      // Create the test table
      const db = database.getDb();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS test_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL
        )
      `);
      
      // Clear any existing data
      await db.execute('DELETE FROM test_users');
      
      usersService = database.createService<User>(usersTable, {
        schemaValidator: (obj) => schema.parseAsync(obj),
        useAutoIncrement: true, // FIX: Enable auto-increment to generate numeric IDs (resolves Zod validation errors)
      });
      
      console.log('✅ Database connected and table created');
    } catch (error) {
      console.error('❌ Failed to setup database:', error);
      throw error;
    }
  });

  after(async () => {
    try {
      if (usersService) {
        // Clean up test data
        const db = database.getDb();
        await db.execute('DROP TABLE IF EXISTS test_users');
      }
      await database.close();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Failed to cleanup:', error);
    }
  });

  describe('CRUD Operations', () => {
    it('should create a user with auto-increment ID', async () => {
      const user = await usersService.insertOne({
        fullName: 'John Doe',
        email: 'john@example.com',
      });

      user.should.have.property('fullName', 'John Doe');
      user.should.have.property('email', 'john@example.com');
      user.should.have.property('id');
      
      // Verify that auto-increment generated a numeric ID (this was the main fix!)
      chai.expect(user.id).to.be.a('number');
      chai.expect(user.id).to.be.greaterThan(0);
      
      console.log('✅ User created with auto-increment:', {
        fullName: user.fullName,
        id: user.id,
        idType: typeof user.id,
        note: 'Fixed: No more Zod validation errors!'
      });
    });

    it('should find a user', async () => {
      const user = await usersService.findOne(
        eq(usersTable.fullName, 'John Doe')
      );

      user.should.not.be.null;
      user.should.have.property('fullName', 'John Doe');
      console.log('✅ User found:', user.fullName);
    });

    it('should find users with pagination', async () => {
      // Create multiple users
      await usersService.insertMany([
        { fullName: 'User 1', email: 'user1@example.com' },
        { fullName: 'User 2', email: 'user2@example.com' },
        { fullName: 'User 3', email: 'user3@example.com' },
      ]);

      const result = await usersService.find(
        like(usersTable.fullName, '%User%'),
        { page: 1, perPage: 2 }
      );

      result.should.have.property('results');
      result.should.have.property('count');
      result.should.have.property('pagesCount');
      result.results.length.should.be.at.most(2);
      console.log('✅ Pagination works:', { count: result.count, pages: result.pagesCount });
    });

    it('should update a user', async () => {
      const user = await usersService.findOne(
        eq(usersTable.fullName, 'John Doe')
      );

      const updatedUser = await usersService.updateOne(
        eq(usersTable.id, user.id),
        () => ({ fullName: 'John Updated' })
      );

      updatedUser.should.have.property('fullName', 'John Updated');
      console.log('✅ User updated:', updatedUser.fullName);
    });

    it('should count users', async () => {
      const count = await usersService.count();
      count.should.be.at.least(1);
      console.log('✅ User count:', count);
    });

    it('should check if user exists', async () => {
      const exists = await usersService.exists(
        eq(usersTable.fullName, 'John Updated')
      );
      
      exists.should.be.true;
      console.log('✅ User exists check passed');
    });

    it('should soft delete a user', async () => {
      const user = await usersService.findOne(
        eq(usersTable.fullName, 'John Updated')
      );

      await usersService.deleteSoft(
        eq(usersTable.id, user.id)
      );

      // Should not find the soft-deleted user
      const deletedUser = await usersService.findOne(
        eq(usersTable.id, user.id)
      );

      (deletedUser === null).should.be.true;
      console.log('✅ User soft deleted');

      // But should find it when including deleted
      const userIncludingDeleted = await usersService.findOne(
        eq(usersTable.id, user.id),
        { skipDeletedRows: false }
      );

      userIncludingDeleted.should.not.be.null;
      chai.expect(userIncludingDeleted?.deletedAt).to.exist;
      console.log('✅ Soft deleted user found when including deleted');
    });
  });

  describe('Event System', () => {
    it('should publish events on create', async () => {
      const spy = chai.spy();
      eventBus.on('test_users.created', spy);

      await usersService.insertOne({
        fullName: 'Event Test User',
        email: 'event@example.com',
      });

      spy.should.have.been.called.at.least(1);
      console.log('✅ Create event published');
    });

    it('should publish events on update', async () => {
      const spy = chai.spy();
      eventBus.on('test_users.updated', spy);

      const user = await usersService.findOne(
        eq(usersTable.fullName, 'Event Test User')
      );

      await usersService.updateOne(
        eq(usersTable.id, user.id),
        () => ({ fullName: 'Event Test User Updated' })
      );

      spy.should.have.been.called.at.least(1);
      console.log('✅ Update event published');
    });

    it('should publish events on delete', async () => {
      const spy = chai.spy();
      eventBus.on('test_users.deleted', spy);

      const user = await usersService.findOne(
        eq(usersTable.fullName, 'Event Test User Updated')
      );

      await usersService.deleteOne(
        eq(usersTable.id, user.id)
      );

      spy.should.have.been.called.at.least(1);
      console.log('✅ Delete event published');
    });
  });

  describe('ID Generation Options', () => {
    it('should verify auto-increment generates numeric IDs', async () => {
      // This test verifies the default behavior we're already using
      const user = await usersService.insertOne({
        fullName: 'Auto Increment Test',
        email: 'auto@test.com',
      });

      user.should.have.property('fullName', 'Auto Increment Test');
      user.should.have.property('id');
      
      // Verify that auto-increment generated a numeric ID
      chai.expect(user.id).to.be.a('number');
      chai.expect(user.id).to.be.greaterThan(0);
      
      console.log('✅ Auto-increment ID verified:', {
        fullName: user.fullName,
        id: user.id,
        idType: typeof user.id
      });
    });

    it('should demonstrate string ID capability with separate table', async () => {
      // Create a separate table for string IDs (VARCHAR instead of INT)
      const stringIdTable = mysqlTable('test_users_string_id', {
        id: varchar('id', { length: 255 }).primaryKey(), // VARCHAR for string IDs
        fullName: varchar('full_name', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
        deletedAt: timestamp('deleted_at'),
      });
      
      // Create the string ID table
      const db = database.getDb();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS test_users_string_id (
          id VARCHAR(255) PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL
        )
      `);
      
      // Clear any existing data
      await db.execute('DELETE FROM test_users_string_id');
      
      // Create a service with auto-increment disabled
      const stringIdSchema = z.object({
        id: z.string().optional(), // Expect string ID
        fullName: z.string(),
        email: z.string().optional(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        deletedAt: z.date().optional().nullable(),
      });
      
      type StringIdUser = {
        id: string;
        fullName: string;
        email?: string;
        createdAt?: Date;
        updatedAt?: Date;
        deletedAt?: Date | null;
      };
      
      const stringIdService = database.createService<StringIdUser>(stringIdTable, {
        schemaValidator: (obj) => stringIdSchema.parseAsync(obj),
        useAutoIncrement: false, // Disable auto-increment to generate string IDs
      });

      const user = await stringIdService.insertOne({
        fullName: 'String ID User',
        email: 'string@example.com',
      });

      user.should.have.property('fullName', 'String ID User');
      user.should.have.property('id');
      
      // Verify that a string ID was generated
      chai.expect(user.id).to.be.a('string');
      chai.expect(user.id).to.have.length.greaterThan(0);
      
      console.log('✅ String ID user created:', {
        fullName: user.fullName,
        id: user.id,
        idType: typeof user.id
      });
      
      // Clean up the test table
      await db.execute('DROP TABLE IF EXISTS test_users_string_id');
    });
  });

  describe('Advanced Features', () => {
    it('should handle transactions', async () => {
      const result = await database.withTransaction(async (tx) => {
        await tx.insert(usersTable).values({
          fullName: 'Transaction User 1',
        });

        await tx.insert(usersTable).values({
          fullName: 'Transaction User 2',
        });

        // Find the created users to verify transaction worked
        const user1 = await tx.select().from(usersTable).where(eq(usersTable.fullName, 'Transaction User 1')).limit(1);
        const user2 = await tx.select().from(usersTable).where(eq(usersTable.fullName, 'Transaction User 2')).limit(1);

        return { user1: user1[0], user2: user2[0] };
      });

      result.should.have.property('user1');
      result.should.have.property('user2');
      result.user1.should.have.property('fullName', 'Transaction User 1');
      result.user2.should.have.property('fullName', 'Transaction User 2');
      console.log('✅ Transaction completed successfully');
    });

    it('should use distinct method', async () => {
      // Create users with duplicate names
      await usersService.insertMany([
        { fullName: 'Duplicate Name', email: 'dup1@example.com' },
        { fullName: 'Duplicate Name', email: 'dup2@example.com' },
        { fullName: 'Unique Name', email: 'unique@example.com' },
      ]);

      const distinctNames = await usersService.distinct(
        'fullName',
        like(usersTable.fullName, '%Name')
      );

      distinctNames.should.include('Duplicate Name');
      distinctNames.should.include('Unique Name');
      console.log('✅ Distinct query works:', distinctNames);
    });
  });
});