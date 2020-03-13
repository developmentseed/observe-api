import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { getObservationsSummary, getObservationsWithAnswers } from '../../models/observations';

export default [
  {
  /**
   * @apiGroup GET /observations
   * @apiDescription Get observations for a survey and OSM ID
   *
   * @apiQueryParam {integer} surveyId - Survey ID
   * @apiQueryParam {string} osmObjectId - OSM ID (optional)
   * @apiQueryParam {string} username - username (optional)
   *
   */
    path: '/observations',
    method: ['GET'],
    options: {
      validate: {
        query: Joi.object({
          surveyId: Joi.number().required(),
          osmObjectId: Joi.string(),
          username: Joi.string()
        })
      },
      handler: async function (request) {
        try {
          const { surveyId, osmObjectId, username } = request.query;
          const observations = await getObservationsWithAnswers(surveyId, osmObjectId, username);
          if (!observations) return Boom.notFound('No observations found');

          return observations;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  },
  {
  /**
   * @apiGroup GET /observations/summary
   * @apiDescription Get summary of observations for a survey and OSM ID, for a specific question
   *
   * @apiQueryParam {integer} surveyId - Survey ID
   * @apiQueryParam {integer} questionId - Question ID
   * @apiQueryParam {string} osmObjectId - OSM ID (optional)
   * @apiQueryParam {string} username - username (optional)
   *
   */
    path: '/observations/summary',
    method: ['GET'],
    options: {
      validate: {
        query: Joi.object({
          surveyId: Joi.number().required(),
          questionId: Joi.number(),
          osmObjectId: Joi.string(),
          username: Joi.string()
        })
      },
      handler: async function (request) {
        try {
          const { surveyId, questionId, osmObjectId, username } = request.query;
          const observations = await getObservationsSummary(surveyId, questionId, osmObjectId, username);
          if (!observations) return Boom.notFound('No observations found');

          return observations;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
