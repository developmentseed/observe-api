import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { getCampaign, updateCampaign } from '../../models/campaigns'

/**
 * @apiGroup Campaigns
 *
 * @api {patch} /campaigns/:id PATCH /campaigns/:id
 * @apiDescription Update campaigns, must be owner or admin.
 *
 * @apiParam {string} :id Campaign id.
 * @apiParam {string} name Campaign name.
 * @apiParam {string} slug Campaign slug.
 * @apiParam {array} surveys Campaign surveys.
 * @apiParam {object} aoi Campaign aoi.
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
 */

export default [
  {
    path: '/campaigns/{id}',
    method: ['PATCH'],
    options: {
      // FIXME
      // auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.string()
        }),
        payload: Joi.object({
          name: Joi.string().optional(),
          slug: Joi.string().optional(),
          surveys: Joi.array().optional(),
          aoi: Joi.object().optional()
        })
      },
      handler: async function (request) {
        try {
          // Get campaign
          const { id } = request.params;
          const campaign = await getCampaign(id);

          if (!campaign) return Boom.notFound('Campaign not found.');

          // FIXME
          // // Verify ownership
          // const { userId, isAdmin } = request.auth.credentials;
          // if (trace.ownerId !== userId && !isAdmin) {
          //   return Boom.forbidden('Must be owner or admin to edit a campaign.');
          // }

          // Patch
          const updatedId = await updateCampaign(id, request.payload);

          return updatedId;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
