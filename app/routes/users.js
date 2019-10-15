import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import users from '../models/users';

/**
 * @api {get} /users GET
 * @apiGroup Users
 * @apiDescription Provides a simple listing of users.
 *
 * @apiParam {number} [page=1] Paginate through results.
 * @apiParam {number} [limit=15] Change the number of results returned, max is 100.
 * @apiParam {object} [sort=asc] Define sort order for one or more fields (ex. `sort[osmDisplayName]=asc&sort[osmCreatedAt]=desc`).
 *
 * @apiSuccess {string}   id              User id
 * @apiSuccess {integer}  osmId           User id in OSM
 * @apiSuccess {string}   osmDisplayName  Display name in OSM
 * @apiSuccess {string}   osmCreatedAt    User creation data in OSM
 * @apiSuccess {boolean}  isAdmin         True if user has admin status
 * @apiSuccessExample {json} Success Response:
 *
 *   [
 *     {
 *       id: 'ef6133bb-ade4-43a8-a230-f23b324828d6',
 *       osmId: 35366,
 *       osmDisplayName: 'User95714',
 *       osmCreatedAt: '2019-10-11T11:18:18.582Z',
 *       isAdmin: false
 *     },
 *     {
 *       id: '9a03458d-3514-41f7-a850-729896c60cdd',
 *       osmId: 43533,
 *       osmDisplayName: 'User79416',
 *       osmCreatedAt: '2019-10-11T11:18:18.577Z',
 *       isAdmin: false
 *     },
 *     ...
 *   ]
 *
 * @apiError statusCode     The error code
 * @apiError error          Error name
 * @apiError message        Error message
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *      "statusCode": 400,
 *      "error": "Bad Request",
 *      "message": "Oops!"
 *     }
 */
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
