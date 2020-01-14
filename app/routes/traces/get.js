import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { getTraceJson } from '../../models/traces';
import logger from '../../services/logger';
import config from 'config';
import togpx from 'togpx';

const elementIds = config.get('elementIds');

const validate = {
  params: Joi.object({
    id: Joi.string().length(elementIds.length)
  })
};

export default [
  /**
   * @apiGroup Traces
   *
   * @api {get} /traces/:id 4. GET /traces/:id
   * @apiDescription Get trace as GeoJSON. Must be trace's owner or admin.
   *
   * @apiParam {string} id Trace id.
   *
   * @apiUse AuthorizationHeader
   * @apiUse Success200TraceJSON
   * @apiUse Error4xx
   */
  {
    path: '/traces/{id}',
    method: ['GET'],
    options: {
      auth: 'jwt',
      validate
    },
    handler: handler('json')
  },
  /**
   * @apiGroup Traces
   *
   * @api {get} /traces/:id.gpx 5. GET /traces/:id.gpx
   * @apiDescription Get trace in GPX format. No authorization is required.
   *
   * @apiParam {string} id Trace id.
   *
   * @apiUse Success200GPX
   * @apiUse Error4xx
   */
  {
    path: '/traces/{id}.gpx',
    method: ['GET'],
    options: {
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
        // Generate GPX file
        const gpx = togpx(trace, {
          featureCoordTimes: f =>
            f.properties.timestamps.map(t => new Date(t).toISOString())
        });

        // Return as text/plain
        const response = h.response(gpx);
        response.type('text/plain');
        return response;
      }

      // Return as TraceJSON
      return trace;
    } catch (error) {
      logger.error(error);
      return Boom.badImplementation('Unexpected error.');
    }
  };
}
