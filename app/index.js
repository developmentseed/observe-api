import config from 'config';
import Hapi from '@hapi/hapi';
import hapiRouter from 'hapi-router';
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
      routes: ['app/routes/*.js', 'app/routes/traces/*.js']
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
