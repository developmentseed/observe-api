import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import traces from '../../models/traces';
import logger from '../../services/logger';

export default [
  {
    path: '/traces',
    method: ['GET'],
    options: {
      auth: 'jwt',
      validate: {
        query: Joi.object({
          limit: Joi.number()
            .integer()
            .min(1)
            .max(100),
          page: Joi.number()
            .integer()
            .min(1),
          sort: Joi.object({
            recordedAt: Joi.string().valid('asc', 'desc'),
            description: Joi.string().valid('asc', 'desc'),
            length: Joi.string().valid('asc', 'desc'),
            uploadedAt: Joi.string().valid('asc', 'desc'),
            updatedAt: Joi.string().valid('asc', 'desc'),
            ownerId: Joi.string().valid('asc', 'desc')
          })
        })
      }
    },
    handler: async function (request, h) {
      try {
        // Get query params
        const { limit, page, sort } = request.query;
        const offset = limit * (page - 1);
        let orderBy = [{ column: 'uploadedAt', order: 'desc' }];

        /**
         * Parses the sort parameter to format used by Knex:
         *   - https://knexjs.org/#Builder-orderBy
         *
         * Example:
         *   - input: sort[uploadedAt]=asc
         *   - output: { column: 'uploadedAt', order: 'asc' }
         *
         */
        if (sort) {
          orderBy = Object.keys(sort).map(key => {
            return {
              column: key,
              order: sort[key]
            };
          });
        }

        const results = await traces.list({
          offset,
          limit,
          orderBy
        });
        const count = await traces.count();

        return h.paginate(results, count);
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
