import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { createCampaign } from '../../models/campaigns';

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
      auth: 'jwt',
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
        const { credentials: { id } } = request.auth;
        const campaignId = await createCampaign({
          ...request.payload,
          ownerId: id
        });
        return campaignId;
      } catch (error) {
        logger.error(error);
        if (error.code === '23505') {
          return Boom.conflict('A campaign with this slug already exists. Slug should be unique');
        }
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
