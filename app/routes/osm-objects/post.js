import Joi from '@hapi/joi';
import logger from '../../services/logger';
import Boom from '@hapi/boom';
import { insertFeatureCollection } from '../../models/osm-objects';

/**
 * @apiGroup OSM Objects
 *
 * @api POST /osmobjects
 *
 * @apiDescription Create OSM Objects from a FeatureCollection
 *
 * @apiParam {object} FeatureCollection of OSM Objects
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
 */

export default [
  {
    path: '/osmobjects',
    method: ['POST'],
    options: {
      auth: 'jwt',
      payload: {
        maxBytes: 10485760
      },
      validate: {
        payload: Joi.object({
          type: Joi.string().required(),
          features: Joi.array().required()
        }).required()
      },
      handler: async function (request) {
        try {
          // FIXME: should validate geojson feature collection here or above
          const response = await insertFeatureCollection(request.payload);
          return response;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
