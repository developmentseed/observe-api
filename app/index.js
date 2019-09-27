import Hapi from '@hapi/hapi';
import hapiRouter from 'hapi-router';
import Boom from '@hapi/boom';

export default async function () {
  // Init server
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
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
    debug: process.env.NODE_ENV !== 'test' ? {
      log: ['error'],
      request: ['error']
    } : false
  });

  // Init routes
  await server.register({
    plugin: hapiRouter,
    options: {
      routes: 'app/routes/*.js'
    }
  });

  await server.start();

  return server;
}
