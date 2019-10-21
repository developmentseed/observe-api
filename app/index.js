import { ensureDir } from 'fs-extra';
import config from 'config';
import Hapi from '@hapi/hapi';
import hapiRouter from 'hapi-router';
import Inert from '@hapi/inert';
import logger from './services/logger';
import path from 'path';
import qs from 'qs';
import setupAuth from './services/auth';

export default async function () {
  // Init server
  const server = Hapi.server({
    port: config.get('port'),
    host: config.get('host'),
    query: {
      parser: q => qs.parse(q)
    },
    routes: {
      cors: true
    },
    debug:
      process.env.NODE_ENV !== 'test'
        ? {
          log: ['error'],
          request: ['error']
        }
        : false
  });

  // Setup auth
  await setupAuth(server);

  // Init routes
  await server.register({
    plugin: hapiRouter,
    options: {
      routes: [
        'app/routes/*.js',
        'app/routes/traces/*.js',
        'app/routes/photos/*.js'
      ]
    }
  });

  // Setup pagination
  await server.register({
    plugin: require('hapi-pagination'),
    options: {
      query: {
        limit: {
          default: config.get('pagination.limit')
        }
      },
      routes: {
        include: ['/users', '/traces']
      }
    }
  });

  // Setup media store
  const mediaStore = config.get('media.store');
  if (mediaStore.type === 'local') {
    // Get media path from config
    const mediaPath = path.join(__dirname, '..', mediaStore.path);

    logger.info(`Uploaded media will be stored locally at ${mediaPath}`);

    // Create dir if not exists
    await ensureDir(mediaPath);

    // Setup file serving
    await server.register(Inert);
    server.route({
      method: 'GET',
      path: '/media/{param*}',
      handler: {
        directory: {
          path: mediaPath,
          redirectToSlash: true,
          index: false
        }
      }
    });
  }

  await server.start();

  return server;
}
