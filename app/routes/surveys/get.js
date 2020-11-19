import Joi from '@hapi/joi';
import Boom from '@hapi/boom';
import { getSurvey } from '../../models/surveys';
import logger from '../../services/logger';

/**
 * @apiGroup Surveys
 *
 * @api GET /surveys/:id
 * @apiDescription Get a survey
 *
 * @apiParam {integer} id Survey id.
 *
 * @apiUse Error4xx
 */

export default [
  {
    path: '/surveys/{id}',
    method: ['GET'],
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.number().required()
        })
      },
      handler: async function (request) {
        try {
          const { id } = request.params;
          const survey = await getSurvey(id);

          if (!survey) return Boom.notFound(`survey ${id} not found`);
          return survey;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
