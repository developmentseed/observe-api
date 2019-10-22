import Boom from '@hapi/boom';
import config from 'config';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { deletePhoto, getPhoto } from '../../models/photos';

const idLength = config.get('idLength');

/**
 * @apiGroup photos
 *
 * @api {del} /photos/:id 5. DEL /photos/:id
 * @apiDescription Delete photo, user must be logged as admin or photo owner.
 *
 * @apiParam {string} id photo id.
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
 */
export default [
  {
    path: '/photos/{id}',
    method: ['DELETE'],
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.string().length(idLength)
        })
      },
      handler: async function (request) {
        try {
          // Get photo
          const { id } = request.params;
          const [photo] = await getPhoto(id);

          // Return 404 if not found
          if (!photo) return Boom.notFound('Photo not found.');

          // Verify ownership
          const { osmId, isAdmin } = request.auth.credentials;
          if (photo.ownerId !== osmId && !isAdmin) {
            return Boom.forbidden('Must be owner or admin to delete a photo.');
          }

          // Perform delete
          await deletePhoto(id);

          return {
            statusCode: 200,
            message: 'Photo deleted successfully.'
          };
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
