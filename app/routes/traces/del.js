import Boom from '@hapi/boom';
import config from 'config';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import traces from '../../models/traces';

const idLength = config.get('idLength');

/**
 * @apiGroup Traces
 *
 * @api {del} /traces/:id 3. DEL /traces/:id
 * @apiDescription Delete trace, must be owner or admin.
 *
 * @apiParam {string} id Trace id.
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
 */
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

          if (!trace) return Boom.notFound('Trace not found.');

          // Verify ownership
          const { osmId, isAdmin } = request.auth.credentials;
          if (trace.ownerId !== osmId && !isAdmin) {
            return Boom.forbidden('Must be owner or admin to edit a trace.');
          }

          // Perform delete
          await traces.del(id);

          return {
            statusCode: 200,
            message: 'Trace deleted successfully.'
          };
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
