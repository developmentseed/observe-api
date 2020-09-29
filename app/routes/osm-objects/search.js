import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { searchOsmObjects } from '../../models/osm-objects';
import logger from '../../services/logger';

/**
 * @apiGroup osmObjects
 *
 * @api {get} /osmobjects/search  5. GET /osmobjects/search
 * @apiDescription Search OSM Objects.
 *
 * @apiParam {string} q Search string.
 * @apiParam {string} bbox Bounding box to limit the search
 * @apiUse Error4xx
 */

export default [
  {
    path: '/osmobjects/search',
    method: ['GET'],
    options: {
      validate: {
        query: Joi.object({
          q: Joi.string().required(),
          bbox: Joi.string().optional()
        })
      }
    },
    handler: async function (request, h) {
      try {
        const { q, bbox } = request.query;
        const results = await searchOsmObjects({
          q
        });

        return results;
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
