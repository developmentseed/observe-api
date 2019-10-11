import config from 'config';
import Hapi from '@hapi/hapi';
import hapiRouter from 'hapi-router';
import Boom from '@hapi/boom';
import setupAuth from './services/auth';
import qs from 'qs';

const port = config.get('port');

export default async function () {
  // Init server
  const server = Hapi.server({
    port,
    host: '0.0.0.0',
    query: {
      parser: q => qs.parse(q)
    },
    routes: {
      cors: true,
      validate: {
        failAction: async (request, h, err) => {
          if (process.env.NODE_ENV === 'production') {
            // In prod, log a limited error message and throw the default Bad Request error.
            /* eslint-disable-next-line no-console */
            console.error('ValidationError:', err.message);
            throw Boom.badRequest('Invalid request payload input');
          } else {
            // During development, log and respond with the full error.
            /* eslint-disable-next-line no-console */
            console.error(err);
            throw err;
          }
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
      routes: 'app/routes/*.js'
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
        include: ['/users']
      }
    }
  });

  await server.start();

  return server;
}
