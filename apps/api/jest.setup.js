// Load test environment variables
require('dotenv').config({ path: '.env.test' });

// jest.setup.js
const { env } = require('node:process');

// Set test environment variables
env.NODE_ENV = 'test';
env.APP_ENV = 'test';