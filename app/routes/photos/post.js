import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { createPhoto } from '../../models/photos';

/**
 * @apiGroup Photos
 *
 * @api {post} /photos 1. POST /photos
 *
 * @apiDescription Upload a new photo.
 *
 * @apiParam {string} file Image in base64 format.
 * @apiParam {float} bearing Bearing.
 * @apiParam {string} description Description.
 * @apiParam {float} lon Longitude.
 * @apiParam {float} lat Latitude.
 * @apiParam {object} osmObjects Array of OpenStreetMap ids.
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
    path: '/photos',
    method: ['POST'],
    options: {
      auth: 'jwt',
      payload: {
        maxBytes: 10485760 // 10 MB
      },
      validate: {
        payload: Joi.object({
          createdAt: Joi.date()
            .iso()
            .required(),
          bearing: Joi.number()
            .max(360)
            .required(),
          description: Joi.string().empty(''),
          lon: Joi.number()
            .min(-180)
            .max(180)
            .required(),
          lat: Joi.number()
            .min(-90)
            .max(90)
            .required(),
          file: Joi.string()
            .base64()
            .required(),
          osmObjects: Joi.array()
            .items(Joi.string().pattern(/^(node|way|relation)\/[0-9]+$/))
            .optional()
        }).required()
      },
      handler: async function (request) {
        try {
          // Get user id
          const {
            credentials: { osmId }
          } = request.auth;

          const photo = await createPhoto({
            ...request.payload,
            ownerId: osmId
          });

          return photo;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
