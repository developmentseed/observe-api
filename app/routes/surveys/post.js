import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { createSurvey } from '../../models/surveys';

/**
 * @apiGroup Surveys
 *
 * @api POST /surveys
 *
 * @apiDescription Create a new survey
 *
 * @apiParam {string} Name
 * @apiParam {array} Question IDs
 */

export default [
  {
    path: '/surveys',
    method: ['POST'],
    options: {
      auth: 'jwt',
      validate: {
        payload: Joi.object({
          name: Joi.string()
            .required()
            .error(new Error('Survey should have a name')),
          questions: Joi.array()
            .required()
            .error(new Error('Survey should have an array of questions, at least one.'))
        }).required()
      },
      handler: async function (request) {
        try {
          logger.error(JSON.stringify(request.auth));
          const { credentials: { osmId } } = request.auth;
          const surveyId = await createSurvey({
            ...request.payload,
            ownerId: osmId
          });
          return surveyId;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
