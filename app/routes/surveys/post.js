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
 * @apiParam {array} Question ids
 * @apiParam {array} Optional question ids
 *
 * @apiParamExample {json} Example:
 * {
 *  "name": "Survey restaurants in Washington, DC",
 *  "questions": [1, 2]
 *  "optionalQuestions": [3, 4]
 * }
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
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
          optionalQuestions: Joi.array(),
          questions: Joi.array()
        }).required()
      },
      handler: async function (request) {
        try {
          const { credentials: { id } } = request.auth;
          const surveyId = await createSurvey({
            ...request.payload,
            ownerId: id
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
