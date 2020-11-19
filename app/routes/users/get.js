import Joi from '@hapi/joi';
import Boom from '@hapi/boom';
import { getWithProfile } from '../../models/users';
import logger from '../../services/logger';

/**
 * @apiGroup Users
 *
 * @api GET /users/:id
 * @apiDescription Get a user by id and its asoociated objects
 *
 * @apiParam {integer} id User id.
 *
 * @apiUse Error4xx
 */

export default [
  {
    path: '/users/{id}',
    method: ['GET'],
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().required()
        })
      },
      handler: async function (request) {
        try {
          const { id } = request.params;
          const user = await getWithProfile(id);

          if (!user) return Boom.notFound(`user ${id} not found`);
          return user;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
