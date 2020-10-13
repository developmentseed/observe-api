import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { createCampaign } from '../../models/campaigns';
import { join } from '../../services/db';

/**
 * @apiGroup Campaigns
 *
 * @api POST /campaigns
 *
 * @apiDescription Create a new campaign
 *
 * @apiParam {string} Name
 * @apiParam {object} AOI GeoJSON Feature
 * @apiParam {string} Slug
 * @apiParam {array} Survey ids
 *
 * @apiParamExample {json} Example:
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUser Error4xx
 */

export default [
  {
    path: '/campaigns',
    method: ['POST'],
    options: {
      // FIXME: this endpoint should use auth
      // auth: 'jwt',
      validate: {
        payload: Joi.object({
          name: Joi.string().required().error(new Error('Campaign should have a name')),
          slug: Joi.string().required().error(new Error('Campaign should have a slug')),
          aoi: Joi.object().required().error(new Error('Campaigns should have an AOI')),
          surveys: Joi.array()
        }).required()
      }
    },
    handler: async function (request) {
      try {
        // FIXME: this endpoint should use auth
        // const { credentials: { osmId } } = request.auth;
        const campaignId = await createCampaign(request.payload);
        return campaignId;
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
