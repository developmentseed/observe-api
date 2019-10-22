import config from 'config';
import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { getPhoto, photoToJson } from '../../models/photos';
import logger from '../../services/logger';
import db from '../../services/db';

const idLength = config.get('idLength');

/**
 * @apiGroup Photos
 *
 * @api {get} /photos/:id 2. GET /photos/:id
 * @apiDescription Get photo as JSON.
 *
 * @apiParam {string} id photo id.
 *
 * @apiUse Error4xx
 */
export default [
  {
    path: '/photos/{id}',
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

        const [photo] = await getPhoto(id);

        if (!photo) return Boom.notFound(`photo ${id} not found`);

        return photoToJson(photo);
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
