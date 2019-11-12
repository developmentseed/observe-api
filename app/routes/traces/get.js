import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { getTraceJson } from '../../models/traces';
import logger from '../../services/logger';
import config from 'config';

const idLength = config.get('idLength');

/**
 * @apiGroup Traces
 *
 * @api {get} /traces/:id 4. GET /traces/:id
 * @apiDescription Get trace, must be owner or admin.
 *
 * @apiParam {string} id Trace id.
 *
 * @apiUse Success200TraceJSON
 * @apiUse Error4xx
 */
export default [
  {
    path: '/traces/{id}',
    method: ['GET'],
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.string().length(idLength)
        })
      }
    },
    handler: async function (request, h) {
      try {
        const { id } = request.params;

        const trace = await getTraceJson(id);

        if (!trace) {
          return Boom.notFound(`Trace ${id} not found`);
        }

        return trace;
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
