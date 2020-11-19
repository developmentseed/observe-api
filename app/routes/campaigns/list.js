import logger from '../../services/logger';
import Boom from '@hapi/boom';
import { getCampaigns } from '../../models/campaigns';

/**
 * @apiGroup Campaigns
 *
 * @api GET /campaigns
 *
 * @apiDescription Get all campaigns.
 *
 *
 * @apiUse Success200
 * @apiUse Error4xx
 */
export default [
  {
    path: '/campaigns',
    method: ['GET'],
    options: {
      handler: async function () {
        try {
          const campaigns = await getCampaigns();
          return campaigns;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
