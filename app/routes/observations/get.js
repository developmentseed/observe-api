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
   *
   */
    path: '/observations',
    method: ['GET'],
    options: {
      validate: {
        query: Joi.object({
          surveyId: Joi.number().required(),
          osmObjectId: Joi.string()
        })
      },
      handler: async function (request) {
        try {
          const observations = await getObservationsWithAnswers(request.query.surveyId, request.query.osmObjectId);
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
   *
   */
    path: '/observations/summary',
    method: ['GET'],
    options: {
      validate: {
        query: Joi.object({
          surveyId: Joi.number().required(),
          questionId: Joi.number().required(),
          osmObjectId: Joi.string()
        })
      },
      handler: async function (request) {
        try {
          const observations = await getObservationsSummary(request.query.surveyId, request.query.questionId, request.query.osmObjectId);
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
