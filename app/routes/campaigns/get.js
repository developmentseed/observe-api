import Joi from '@hapi/joi';
import Boom from '@hapi/boom';
import { getCampaign } from '../../models/campaigns';
import logger from '../../services/logger';

/**
 * @apiGroup Campaigns
 *
 * @api GET /campaigns/:id
 * @apiDescription Get a campaign
 *
 * @apiParam {integer} id Campaign id.
 *
 * @apiUse Error4xx
 * @apiUse Success2xx
 */

export default [
  {
    path: '/campaigns/{id}',
    method: ['GET'],
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().required()
        })
      },
      handler: async function (request) {
        try {
          const { id } = request.params;
          const campaign = await getCampaign(id);

          if (!campaign) return Boom.notFound(`campaign ${id} not found`);
          return campaign;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
