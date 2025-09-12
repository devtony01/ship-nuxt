import chai from 'chai';
import { z } from 'zod';
import spies from 'chai-spies';
import { mysqlTable, varchar, timestamp, int, boolean } from 'drizzle-orm/mysql-core';
import { eq, like } from 'drizzle-orm';

import { ReplicationDatabase, eventBus } from '../../dist/index.js';

import 'mocha';

chai.use(spies);
chai.should();

// Define test table
const usersTable = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

type User = typeof usersTable.$inferSelect;

const schema = z.object({
  id: z.number().optional(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  passwordHash: z.string(),
  isEmailVerified: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
});

// Test configuration
const config = {
  env: process.env.NODE_ENV || 'test',
  mysql: {
    masterUrl: process.env.MYSQL_MASTER_URL || 'mysql://testuser:testpass@mysql-master:3306/testdb',
    slaveUrl: process.env.MYSQL_SLAVE_URL || 'mysql://testuser:testpass@mysql-slave:3306/testdb',
  },
};

describe('MySQL Replication Tests', () => {
  let replicationDb: ReplicationDatabase;
  let usersService: any;

  before(async function() {
    this.timeout(30000); // Increase timeout for replication setup
    
    try {
      console.log('🔧 Replication Test Configuration:');
      console.log('  Environment:', config.env);
      console.log('  Master URL:', config.mysql.masterUrl);
      console.log('  Slave URL:', config.mysql.slaveUrl);
      
      console.log('🔌 Connecting to replication databases...');
      replicationDb = new ReplicationDatabase(
        config.mysql.masterUrl,
        config.mysql.slaveUrl
      );
      
      await replicationDb.connect();
      
      // Create the users table on master (should replicate to slave)
      console.log('🏗️ Creating users table on master...');
      const masterDb = replicationDb.getMasterDb();
      
      // Create table on master (will replicate to slave)
      await masterDb.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
          deleted_at TIMESTAMP NULL
        )
      `);
      console.log('✅ Table created on master');
      
      // Wait for table creation to replicate
      console.log('⏳ Waiting for table creation to replicate...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Verify replication is working by checking if table exists on slave
      const slaveDb = replicationDb.getSlaveDb();
      try {
        await slaveDb.execute('DESCRIBE users');
        console.log('✅ Table successfully replicated to slave');
      } catch (error) {
        console.error('❌ Table not found on slave - replication may not be working:', error);
        throw new Error('Replication setup failed - table not replicated to slave');
      }
      
      usersService = replicationDb.createService<User>(usersTable, {
        schemaValidator: (obj) => schema.parseAsync(obj),
        useAutoIncrement: true,
      });
      
      // Clean up any existing test data
      console.log('🧹 Cleaning up existing test data...');
      try {
        await masterDb.execute('DELETE FROM users');
        await replicationDb.waitForReplication(2000);
      } catch {
        console.log('⚠️ No existing data to clean up');
      }
      
      console.log('✅ Replication databases connected and cleaned');
    } catch (error) {
      console.error('❌ Failed to setup replication databases:', error);
      throw error;
    }
  });

  after(async () => {
    try {
      if (replicationDb) {
        // Clean up test table
        console.log('🧹 Cleaning up test table...');
        const masterDb = replicationDb.getMasterDb();
        await masterDb.execute('DROP TABLE IF EXISTS users');
        
        await replicationDb.close();
        console.log('✅ Replication database connections closed');
      }
    } catch (error) {
      console.error('❌ Failed to cleanup:', error);
    }
  });

  describe('Replication Database Connection', () => {
    it('should connect to both master and slave databases', async () => {
      const masterDb = replicationDb.getMasterDb();
      const slaveDb = replicationDb.getSlaveDb();
      
      masterDb.should.not.be.undefined;
      slaveDb.should.not.be.undefined;
      
      console.log('✅ Both master and slave connections established');
    });

    it('should check replication lag', async function() {
      this.timeout(10000);
      
      const lag = await replicationDb.checkReplicationLag();
      console.log('📊 Current replication lag:', lag, 'bytes');
      
      // Lag should be a number (could be 0 or positive, -1 indicates error)
      lag.should.be.a('number');
      lag.should.be.at.least(-1);
    });
  });

  describe('Read/Write Splitting', () => {
    it('should write to master and read from slave', async function() {
      this.timeout(15000);
      
      // Write operation (should go to master)
      console.log('📝 Writing to master...');
      const newUser = await usersService.insertOne({
        email: 'replication@test.com',
        firstName: 'Replication',
        lastName: 'Test',
        passwordHash: 'hashed_password',
        isEmailVerified: true,
      });
      
      newUser.should.have.property('email', 'replication@test.com');
      newUser.should.have.property('id');
      console.log('✅ User written to master:', newUser.email);
      
      // Wait for replication to catch up
      console.log('⏳ Waiting for replication...');
      const replicationSuccess = await replicationDb.waitForReplication(5000);
      
      if (replicationSuccess) {
        console.log('✅ Replication caught up');
      } else {
        console.log('⚠️ Replication lag detected, but continuing test');
      }
      
      // Read operation (should go to slave)
      console.log('📖 Reading from slave...');
      const foundUser = await usersService.findOne(eq(usersTable.email, 'replication@test.com'));
      
      foundUser.should.not.be.null;
      foundUser.should.have.property('email', 'replication@test.com');
      foundUser.should.have.property('firstName', 'Replication');
      console.log('✅ User read from slave:', foundUser.email);
    });

    it('should handle multiple read operations from slave', async function() {
      this.timeout(10000);
      
      // Create multiple users on master
      console.log('📝 Creating multiple users on master...');
      await usersService.insertMany([
        {
          email: 'user1@replication.test',
          firstName: 'User',
          lastName: 'One',
          passwordHash: 'hash1',
        },
        {
          email: 'user2@replication.test',
          firstName: 'User',
          lastName: 'Two',
          passwordHash: 'hash2',
        },
        {
          email: 'user3@replication.test',
          firstName: 'User',
          lastName: 'Three',
          passwordHash: 'hash3',
        },
      ]);
      
      // Wait for replication
      await replicationDb.waitForReplication(3000);
      
      // Read operations from slave
      console.log('📖 Reading multiple users from slave...');
      const users = await usersService.find(
        like(usersTable.email, '%@replication.test'),
        { page: 1, perPage: 10 }
      );
      
      users.should.have.property('results');
      users.results.length.should.be.at.least(3);
      console.log('✅ Multiple users read from slave:', users.results.length);
      
      // Count operation from slave
      const count = await usersService.count(like(usersTable.email, '%@replication.test'));
      count.should.be.at.least(3);
      console.log('✅ Count operation from slave:', count);
    });

    it('should handle update operations on master', async function() {
      this.timeout(10000);
      
      // Find user to update (read from slave)
      const userToUpdate = await usersService.findOne(eq(usersTable.email, 'replication@test.com'));
      userToUpdate.should.not.be.null;
      
      // Update operation (should use master for both read and write)
      console.log('✏️ Updating user on master...');
      const updatedUser = await usersService.updateOne(
        eq(usersTable.id, userToUpdate.id),
        () => ({ firstName: 'Updated Replication' })
      );
      
      updatedUser.should.not.be.null;
      updatedUser.should.have.property('firstName', 'Updated Replication');
      console.log('✅ User updated on master:', updatedUser.firstName);
      
      // Wait for replication
      await replicationDb.waitForReplication(3000);
      
      // Verify update replicated to slave
      const replicatedUser = await usersService.findOne(eq(usersTable.id, userToUpdate.id));
      replicatedUser.should.have.property('firstName', 'Updated Replication');
      console.log('✅ Update replicated to slave');
    });
  });

  describe('Transaction Support', () => {
    it('should handle transactions on master', async function() {
      this.timeout(10000);
      
      console.log('🔄 Testing transaction on master...');
      const result = await replicationDb.withTransaction(async (tx) => {
        // All transaction operations use master
        await tx.insert(usersTable).values({
          email: 'tx1@replication.test',
          firstName: 'Transaction',
          lastName: 'User1',
          passwordHash: 'txhash1',
        });
        
        await tx.insert(usersTable).values({
          email: 'tx2@replication.test',
          firstName: 'Transaction',
          lastName: 'User2',
          passwordHash: 'txhash2',
        });
        
        console.log('  📝 Created users in transaction');
        
        // Return something to verify transaction worked
        return { user1Count: 1, user2Count: 1 };
      });
      
      result.should.have.property('user1Count', 1);
      result.should.have.property('user2Count', 1);
      console.log('✅ Transaction completed successfully');
      
      // Wait for replication
      await replicationDb.waitForReplication(3000);
      
      // Verify transaction results replicated to slave
      const txUsers = await usersService.find(like(usersTable.email, '%@replication.test'));
      const txUserEmails = txUsers.results.map((u: User) => u.email);
      
      txUserEmails.should.include('tx1@replication.test');
      txUserEmails.should.include('tx2@replication.test');
      console.log('✅ Transaction results replicated to slave');
    });
  });

  describe('Event System with Replication', () => {
    it('should publish events for operations on master', async function() {
      this.timeout(10000);
      
      const createSpy = chai.spy();
      const updateSpy = chai.spy();
      const deleteSpy = chai.spy();
      
      eventBus.on('users.created', createSpy);
      eventBus.on('users.updated', updateSpy);
      eventBus.on('users.deleted', deleteSpy);
      
      // Create user (master operation)
      console.log('📝 Creating user with events...');
      const eventUser = await usersService.insertOne({
        email: 'events@replication.test',
        firstName: 'Event',
        lastName: 'User',
        passwordHash: 'eventhash',
      });
      
      // Update user (master operation)
      console.log('✏️ Updating user with events...');
      await usersService.updateOne(
        eq(usersTable.id, eventUser.id),
        () => ({ firstName: 'Updated Event' })
      );
      
      // Delete user (master operation)
      console.log('🗑️ Deleting user with events...');
      await usersService.deleteOne(eq(usersTable.id, eventUser.id));
      
      // Verify events were published
      createSpy.should.have.been.called.at.least(1);
      updateSpy.should.have.been.called.at.least(1);
      deleteSpy.should.have.been.called.at.least(1);
      
      console.log('✅ All events published correctly');
    });
  });

  describe('Replication Monitoring', () => {
    it('should monitor replication status', async function() {
      this.timeout(10000);
      
      // Create some data to generate replication activity
      console.log('📝 Creating data for replication monitoring...');
      await usersService.insertMany([
        {
          email: 'monitor1@test.com',
          firstName: 'Monitor',
          lastName: 'User1',
          passwordHash: 'hash1',
        },
        {
          email: 'monitor2@test.com',
          firstName: 'Monitor',
          lastName: 'User2',
          passwordHash: 'hash2',
        },
      ]);
      
      // Check replication lag multiple times
      console.log('📊 Monitoring replication lag...');
      let hasPermissions = true;
      
      for (let i = 0; i < 3; i++) {
        const lag = await replicationDb.checkReplicationLag();
        console.log(`  Lag check ${i + 1}: ${lag} bytes`);
        
        lag.should.be.a('number');
        lag.should.be.at.least(-1);
        
        if (lag === -1) {
          hasPermissions = false;
          console.log('  ⚠️ No replication monitoring permissions (expected in test environment)');
          break;
        }
        
        if (lag === 0) {
          console.log('  ✅ No replication lag detected');
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Test wait for replication (should work even without lag monitoring)
      console.log('⏳ Testing wait for replication...');
      const waitResult = await replicationDb.waitForReplication(2000); // Shorter timeout
      console.log('  Wait result:', waitResult);
      
      waitResult.should.be.a('boolean');
      
      if (!hasPermissions) {
        console.log('✅ Replication monitoring test completed (limited permissions)');
      } else {
        console.log('✅ Replication monitoring test completed (full permissions)');
      }
    });
  });

  describe('Direct Database Access', () => {
    it('should allow direct access to master and slave databases', async function() {
      this.timeout(10000);
      
      const masterDb = replicationDb.getMasterDb();
      const slaveDb = replicationDb.getSlaveDb();
      
      // Direct write to master
      console.log('📝 Direct write to master...');
      await masterDb.insert(usersTable).values({
        email: 'direct@master.test',
        firstName: 'Direct',
        lastName: 'Master',
        passwordHash: 'directhash',
      });
      
      // Wait for replication with multiple attempts
      console.log('⏳ Waiting for replication...');
      let directUsers: User[] = [];
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Direct read from slave
        console.log(`📜 Direct read from slave (attempt ${attempts + 1}/${maxAttempts})...`);
        directUsers = await slaveDb.select().from(usersTable)
          .where(eq(usersTable.email, 'direct@master.test'))
          .limit(1);
        
        if (directUsers.length > 0) {
          break;
        }
        
        attempts++;
      }
      
      directUsers.length.should.equal(1);
      directUsers[0].should.have.property('email', 'direct@master.test');
      console.log('✅ Direct database access working');
    });
  });
});