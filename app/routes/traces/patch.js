import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import db from '../../services/db';
import logger from '../../services/logger';
import traces from '../../models/traces';
import config from 'config';

const idLength = config.get('idLength');

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
          description: Joi.string()
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
