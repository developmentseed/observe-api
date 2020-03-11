import Joi from '@hapi/joi';
import logger from '../../services/logger';
import Boom from '@hapi/boom';
import { getOsmObjectsByQuadkey } from '../../models/osm-objects';

/**
 * @apiGroup OSM Objects
 *
 * @api GET /osmobjects
 *
 * @apiDescription Get OSM Objects as a FeatureCollection for the given quadkey
 *
 * @apiParam {string} quadkey
 * @apiUse Success200
 * @apiUse Error4xx
 */

export default [
  {
    path: '/osmobjects/{quadkey}',
    method: ['GET'],
    options: {
      validate: {
        params: Joi.object({
          quadkey: Joi.string().required()
        }).required()
      },
      handler: async function (request) {
        try {
          const features = getOsmObjectsByQuadkey(request.params.quadkey);

          if (!features) return Boom.notFound('No features found for that tile');

          return features;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];