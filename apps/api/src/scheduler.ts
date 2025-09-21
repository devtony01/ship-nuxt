/* eslint-disable simple-import-sort/imports, import/first */
import process from 'node:process';
import moduleAlias from 'module-alias';

moduleAlias.addPath(__dirname);
moduleAlias();

import 'dotenv/config';

import schedule from 'node-schedule';

import logger from 'logger';

const initScheduler = () => {
  logger.info('Scheduler service started');

  // Example scheduled job - runs every hour
  schedule.scheduleJob('0 * * * *', () => {
    logger.info('Running hourly scheduled job');
    // Add your scheduled tasks here
  });

  // Example scheduled job - runs daily at midnight
  schedule.scheduleJob('0 0 * * *', () => {
    logger.info('Running daily scheduled job');
    // Add your daily tasks here
  });

  logger.info('Scheduled jobs initialized');
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Scheduler service shutting down...');
  schedule.gracefulShutdown().then(() => {
    logger.info('Scheduler service stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Scheduler service shutting down...');
  schedule.gracefulShutdown().then(() => {
    logger.info('Scheduler service stopped');
    process.exit(0);
  });
});

initScheduler();
