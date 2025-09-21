/* eslint-disable simple-import-sort/imports, import/first */
// Allows requiring modules relative to /src folder,
// All options can be found here: https://gist.github.com/branneman/8048520
import moduleAlias from 'module-alias';

moduleAlias.addPath(__dirname);
moduleAlias(); // read aliases from package json

import 'dotenv/config';
import 'express-async-errors';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'node:http';

import { socketService } from 'services';
import routes from 'routes';

import config from 'config';

import ioEmitter from 'io-emitter';

import redisClient, { redisErrorHandler } from 'redis-client';

import logger from 'logger';

const initExpress = (): express.Express => {
  const app = express();

  app.set('trust proxy', true);

  app.use(
    cors({
      credentials: true,
      origin: true, // Reflect the request origin, similar to Koa's behavior
    }),
  );
  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
        method: req.method,
        endpoint: req.originalUrl,
        status: res.statusCode,
        time: `${duration}ms`,
        length: res.get('content-length') || '0',
      });
    });

    next();
  });

  routes(app);

  return app;
};

const app = initExpress();

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  (async () => {
    const server = http.createServer(app);

    if (config.REDIS_URI) {
      await redisClient
        .connect()
        .then(() => {
          ioEmitter.initClient();
          socketService(server);
        })
        .catch(redisErrorHandler);
    }

    server.listen(config.PORT, () => {
      logger.info(`API server is listening on ${config.PORT} in ${config.APP_ENV} environment`);
    });
  })();
}

export default app;
