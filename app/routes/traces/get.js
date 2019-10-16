import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import traces from '../../models/traces';
import logger from '../../services/logger';
import config from 'config';
import db from '../../services/db';

const idLength = config.get('idLength');

/**
 * @apiGroup Traces
 *
 * @api {get} /traces/:id 2. GET /traces/:id
 * @apiDescription Get trace in TraceJSON format.
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

        const [trace] = await traces
          .get(id, [
            'id',
            'ownerId',
            'description',
            'length',
            'recordedAt',
            'uploadedAt',
            'updatedAt',
            'timestamps',
            db.raw('ST_AsGeoJSON(geometry) as geometry')
          ]);

        if (!trace) {
          return Boom.notFound(`Trace ${id} not found`);
        } else {
          return traces.asTraceJson(trace);
        }
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
