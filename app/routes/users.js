import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import users from '../models/users';

module.exports = [
  {
    path: '/users',
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
            osmDisplayName: Joi.string().valid('asc', 'desc'),
            osmCreatedAt: Joi.string().valid('asc', 'desc')
          })
        })
      }
    },
    handler: async function (request, h) {
      // Check if user has proper credentials
      const { credentials } = request.auth;
      if (!credentials.isAdmin) {
        return Boom.unauthorized('Restricted to admin users.');
      }

      // Get query params
      const { limit, page, sort } = request.query;
      const offset = limit * (page - 1);
      let orderBy = ['osmDisplayName'];

      /**
       * Parses the sort parameter to format used by Knex:
       *   - https://knexjs.org/#Builder-orderBy
       *
       * Example:
       *   - input: sort[osmDisplayName]=asc
       *   - output: { column: 'osmDisplayName', order: 'asc' }
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

      const results = await users.list({
        offset,
        limit,
        orderBy
      });
      const count = await users.count();

      return h.paginate(results, count);
    }
  }
];
