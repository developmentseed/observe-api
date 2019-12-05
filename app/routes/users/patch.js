import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import * as users from '../../models/users';
import config from 'config';

const elementIds = config.get('elementIds');

/**
 * @apiGroup Users
 *
 * @api {patch} /users/:id 2. PATCH /users/:id
 * @apiDescription Update user, must be owner or admin.
 *
 * @apiParam {string} :id User id.
 * @apiParam {string} description User description.
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
 */

export default [
  {
    path: '/users/{id}',
    method: ['PATCH'],
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.string()
        }),
        payload: Joi.object({
          isAdmin: Joi.boolean()
        })
      },
      handler: async function (request) {
        try {
          // Get user
          const { id } = request.params;
          const user = await users.get(id);

          if (!user) return Boom.notFound('User not found.');

          // Verify ownership
          const { isAdmin } = request.auth.credentials;
          if (!isAdmin) {
            return Boom.forbidden('Must admin to edit a user.');
          }

          // Patch
          await users.update(id, { isAdmin: request.payload.isAdmin });

          return {};
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
