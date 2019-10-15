import Boom from '@hapi/boom';
import config from 'config';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import traces from '../../models/traces';

const idLength = config.get('idLength');

export default [
  {
    path: '/traces/{id}',
    method: ['DELETE'],
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.string().length(idLength)
        })
      },
      handler: async function (request) {
        try {
          // Get trace
          const { id } = request.params;
          const [trace] = await traces.get(id);

          // Verify ownership
          const { osmId, isAdmin } = request.auth.credentials;
          if (trace.ownerId !== osmId && !isAdmin) {
            return Boom.forbidden('Must be owner or admin to edit a trace.');
          }

          // Perform delete
          await traces.del(id);

          return 'ok';
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
