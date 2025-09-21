/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec.ts)'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  watchPathIgnorePatterns: ['globalConfig'],
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>/src'],
  moduleDirectories: ['node_modules'],
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true,
};

module.exports = config;
