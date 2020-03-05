import { ensureDir } from 'fs-extra';
import config from 'config';
import Hapi from '@hapi/hapi';
import hapiRouter from 'hapi-router';
import Boom from '@hapi/boom';
import Inert from '@hapi/inert';
import logger from './services/logger';
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
      cors: true,
      validate: {
        failAction: async (request, h, err) => {
          throw Boom.badRequest(err);
        }
      }
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
        'app/routes/photos/*.js',
        'app/routes/profile/*.js',
        'app/routes/users/*.js',
        'app/routes/questions/*.js',
        'app/routes/surveys/*.js',
        'app/routes/observations/*.js'
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
      meta: {
        page: { active: true }
      },
      routes: {
        include: ['/users', '/traces', '/photos']
      }
    }
  });

  // Setup media store
  const mediaStore = config.get('media.store');
  if (mediaStore.type === 'local') {
    // Get media path from config
    const mediaStorePath = config.get('mediaStorePath');

    logger.info(`Media will be served/stored from path: ${mediaStorePath}`);

    // Create dir if not exists
    await ensureDir(mediaStorePath);

    // Setup file serving
    await server.register(Inert);
    server.route({
      method: 'GET',
      path: '/media/{param*}',
      handler: {
        directory: {
          path: mediaStorePath,
          redirectToSlash: true,
          index: false
        }
      }
    });
  }

  await server.start();

  return server;
}
