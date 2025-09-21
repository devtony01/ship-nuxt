import { eventBus } from '@paracelsus/node-sql';

import { analyticsService } from 'services';

import ioEmitter from 'io-emitter';

import logger from 'logger';

import type { User } from 'types';

import userService from './user.service';

const tableName = 'users';

eventBus.on(`${tableName}.updated`, (data: { doc: User }) => {
  try {
    const user = data.doc as User;

    // Only publish if user has an ID (should always be true for updated events)
    if (user.id !== undefined) {
      ioEmitter.publishToUser(user.id.toString(), 'user:updated', userService.getPublic(user));
      logger.info(`Published user:updated event for user ${user.id}`);
    } else {
      logger.warn('User updated event received but user has no ID');
    }
  } catch (err) {
    logger.error(`${tableName}.updated handler error: ${err}`);
  }
});

eventBus.on(`${tableName}.created`, (data: { doc: User }) => {
  try {
    const user = data.doc as User;

    const { firstName, lastName } = user;

    analyticsService.track('New user created', {
      firstName,
      lastName,
    });
  } catch (err) {
    logger.error(`${tableName}.created handler error: ${err}`);
  }
});
