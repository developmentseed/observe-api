import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import db from '../../services/db';
import logger from '../../services/logger';
import traces from '../../models/traces';
import config from 'config';

const idLength = config.get('idLength');

/**
 * @apiGroup Traces
 *
 * @api {patch} /traces/:id 2. PATCH /traces/:id
 * @apiDescription Update trace, must be owner or admin.
 *
 * @apiParam {string} :id Trace id.
 * @apiParam {string} description Trace description.
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
 */

export default [
  {
    path: '/traces/{id}',
    method: ['PATCH'],
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.string().length(idLength)
        }),
        payload: Joi.object({
          description: Joi.string().empty('')
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

          // Patch
          const { description } = request.payload;
          const [patchedTrace] = await traces
            .update(id, { description })
            .returning([
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

          // Return as TraceJSON
          return traces.asTraceJson(patchedTrace);
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
