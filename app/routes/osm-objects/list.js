import Joi from '@hapi/joi';
import logger from '../../services/logger';
import Boom from '@hapi/boom';
import {
  getOsmObjects,
  getOsmObjectStats,
  countOsmObjects
} from '../../models/osm-objects';

export default [
  {
    /**
     * @apiGroup OSM Objects
     *
     * @api GET /osmobjects
     *
     * @apiDescription Get OSM Objects as a FeatureCollection for the given quadkey
     *
     * @apiParam {string} quadkey
     * @apiParam {integer} limit
     * @apiParam {integer} page
     *
     * @apiUse Success200
     * @apiUse Error4xx
     */
    path: '/osmobjects',
    method: ['GET'],
    options: {
      validate: {
        query: Joi.object({
          limit: Joi.number()
            .integer()
            .min(1)
            .max(100),
          page: Joi.number()
            .integer()
            .min(1),
          quadkey: Joi.string(),
          observations: Joi.string()
        })
      },
      handler: async function (request, h) {
        try {
          const { limit, page } = request.query;
          const offset = limit * (page - 1);

          // Get filters
          const { quadkey, observations } = request.query;

          const featureCollection = await getOsmObjects(
            {
              quadkey,
              observations
            },
            offset,
            limit
          );
          const count = await countOsmObjects(quadkey);

          if (!featureCollection) {
            return Boom.notFound('No features found for that tile');
          }

          return h.paginate(featureCollection.features, count);
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  },
  {
    /**
     * @apiGroup OSM Objects
     *
     * @api GET /osmobjects/stats
     *
     * @apiDescription Get stats about OSM Objects and Observations. Returns number of total and unsurveyed objects.
     *
     * @apiUse Success200
     * @apiUse Error4xx
     */
    path: '/osmobjects/stats',
    method: ['GET'],
    options: {
      handler: async function (request) {
        try {
          const stats = await getOsmObjectStats();
          return stats;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
