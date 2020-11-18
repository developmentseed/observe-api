import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { getCampaign, deleteCampaign } from '../../models/campaigns';

/**
 * @apiGroup Campaigns
 *
 * @api {del} /campaigns/:id DEL /campaigns/:id
 * @apiDescription Delete a campaign, must be owner or admin.
 *
 * @apiParam {string} id Campaign id.
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
 */
export default [
  {
    path: '/campaigns/{id}',
    method: ['DELETE'],
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.string().required()
        })
      },
      handler: async function (request) {
        try {
          // Get campaign
          const { id } = request.params;
          const campaign = await getCampaign(id);

          if (!campaign) return Boom.notFound('Campaign not found.');

          // Verify ownership
          const { id: userId, isAdmin } = request.auth.credentials;
          if (campaign.ownerId !== userId && !isAdmin) {
            return Boom.forbidden('Must be owner or admin to delete a campaign.');
          }

          // Perform delete
          await deleteCampaign(id);

          // Return empty response
          return {};
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
