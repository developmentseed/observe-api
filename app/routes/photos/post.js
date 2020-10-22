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
 * @apiParam {float} heading Heading.
 * @apiParam {string} description Description.
 * @apiParam {float} lon Longitude.
 * @apiParam {float} lat Latitude.
 * @apiParam {string} osmElement OpenStreetMap id of photographed element..
 * @apiParamExample {json} Example:
 * {
 *  osmElement: 'way/677949489'
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
          heading: Joi.number()
            .min(0)
            .max(360)
            .allow(null)
            .error(new Error('Heading should be a number between 0 and 360, or null.')),
          description: Joi.string().allow('', null),
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
          osmElement: Joi.string()
            .pattern(/^(node|way|relation)\/[0-9]+$/)
            .allow('', null)
        }).required()
      },
      handler: async function (request) {
        try {
          // Get user id
          const {
            credentials: { id }
          } = request.auth;

          const photo = await createPhoto({
            ...request.payload,
            ownerId: id
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
