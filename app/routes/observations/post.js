import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { getSurvey } from '../../models/surveys';
import { createObservation } from '../../models/observations';

/**
 * @apiGroup Observations
 *
 * @api POST /observations
 *
 * @apiDescription Submit a new observation
 *
 * @apiParam {integer} Survey ID
 * @apiParam {string} Created timestamp
 * @apiParam {string} OSM object ID
 * @apiParam {object} Questions and answers
 */

export default [
  {
    path: '/observations',
    method: ['POST'],
    options: {
      auth: 'jwt',
      validate: {
        payload: Joi.object({
          surveyId: Joi.number().required(),
          createdAt: Joi.date().iso().required(),
          osmObject: Joi.object().required(),
          answers: Joi.array().required()
        }).required()
      },
      handler: async function (request) {
        try {
          const { credentials: { osmId } } = request.auth;
          const data = {
            surveyId: request.payload.surveyId,
            userId: osmId,
            createdAt: request.payload.createdAt,
            osmObject: request.payload.osmObject,
            answers: request.payload.answers
          };

          // check if this survey exists
          const survey = getSurvey(data.surveyId);
          if (!survey) return Boom.notFound('survey not found');

          // if it does, create an observation
          const id = await createObservation(data);
          return id;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
