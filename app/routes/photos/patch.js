import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { getPhoto, updatePhoto, photoToJson } from '../../models/photos';

/**
 * @apiGroup Photos
 *
 * @api {patch} /photos 3. POST /photos
 *
 * @apiDescription Update a photo, user must be logged.
 *
 * @apiParam {object} osmObjects Array of OSM ids
 * @apiParamExample {json} Example:
 * {
 *  osmObjects: ['way/677949489', 'node/677949489', 'relation/10230293']
 * }
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
 */

export default [
  {
    path: '/photos/{id}',
    method: ['PATCH'],
    options: {
      auth: 'jwt',
      validate: {
        payload: Joi.object({
          bearing: Joi.number()
            .max(360)
            .message('Invalid bearing.'),
          lon: Joi.number()
            .min(-180)
            .max(180),
          lat: Joi.number()
            .min(-90)
            .max(90),
          osmObjects: Joi.array()
            .items(Joi.string().pattern(/^(node|way|relation)\/[0-9]+$/))
            .optional()
        }).required()
      },
      handler: async function (request) {
        try {
          // Get photo
          const { id } = request.params;
          const [photo] = await getPhoto(id);

          if (!photo) return Boom.notFound('Photo not found.');

          // Verify ownership
          const { osmId, isAdmin } = request.auth.credentials;
          if (photo.ownerId !== osmId && !isAdmin) {
            return Boom.forbidden('Must be owner or admin to edit a photo.');
          }

          // Transform lon/lat into WKT
          const data = Object.assign({}, request.payload);
          const { lon, lat } = data;
          if (typeof lon !== 'undefined' && typeof lat !== 'undefined') {
            data.location = `POINT(${lon} ${lat})`;
            delete data.lon;
            delete data.lat;
          }

          const [patchedPhoto] = await updatePhoto(id, data);

          return photoToJson(patchedPhoto);
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
