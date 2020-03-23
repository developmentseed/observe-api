import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { getOsmObject } from '../../models/osm-objects';
import logger from '../../services/logger';

/**
 * @apiGroup osmObjects
 *
 * @api {get} /osmobjects/:id  4. GET /osmobjects/:id
 * @apiDescription Get photo.
 *
 * @apiParam {string} id OSM object id.
 *
 * @apiUse Error4xx
 */
export default [
  {
    path: '/osmobjects/{osmId*2}',
    method: ['GET'],
    options: {
      validate: {
        params: Joi.object({
          osmId: Joi.string()
            .pattern(/^(node|way|relation)\/[0-9]+$/)
            .allow('', null)
        })
      }
    },
    handler: async function (request) {
      try {
        const { osmId } = request.params;

        const osmObject = await getOsmObject(osmId);

        if (!osmObject) return Boom.notFound(`OSM object ${osmId} not found`);

        return osmObject;
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
