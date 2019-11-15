import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { getTraceJson } from '../../models/traces';
import logger from '../../services/logger';
import config from 'config';
import togpx from 'togpx';

const idLength = config.get('idLength');

const validate = {
  params: Joi.object({
    id: Joi.string().length(idLength)
  })
};

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
      validate
    },
    handler: handler('json')
  },
  {
    path: '/traces/{id}.gpx',
    method: ['GET'],
    options: {
      auth: 'jwt',
      validate
    },
    handler: handler('gpx')
  }
];

function handler (type) {
  return async (request, h) => {
    try {
      const { id } = request.params;

      const trace = await getTraceJson(id);

      if (!trace) {
        return Boom.notFound(`Trace ${id} not found`);
      }

      if (type === 'gpx') {
        return togpx(trace, {
          featureCoordTimes: f =>
            f.properties.timestamps.map(t => new Date(t).toISOString())
        });
      }

      return trace;
    } catch (error) {
      logger.error(error);
      return Boom.badImplementation('Unexpected error.');
    }
  };
}
