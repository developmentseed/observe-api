import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import {
  getObservationsSummary,
  getObservationsWithAnswers
} from '../../models/observations';

export default [
  {
    /**
     * @apiGroup GET /observations
     * @apiDescription Get observations for a survey optionally filtered by OSM Object ID or userId.
     *
     * @apiQueryParam {integer} surveyId - Survey ID
     * @apiQueryParam {string} osmObjectId - OSM ID (optional)
     * @apiQueryParam {string} userId - userId (optional)
     *
     */
    path: '/observations',
    method: ['GET'],
    options: {
      validate: {
        query: Joi.object({
          surveyId: Joi.number().required(),
          osmObjectId: Joi.string(),
          userId: Joi.string()
        })
      },
      handler: async function (request) {
        try {
          const { surveyId, osmObjectId, userId } = request.query;
          console.log(userId);
          const observations = await getObservationsWithAnswers(
            surveyId,
            osmObjectId,
            userId
          );
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
     * @apiDescription Get summary of observations for a survey, for a specific question. Filter by OSM Object ID or userId.
     *
     * @apiQueryParam {integer} surveyId - Survey ID
     * @apiQueryParam {integer} questionId - Question ID
     * @apiQueryParam {string} osmObjectId - OSM ID (optional)
     * @apiQueryParam {string} userId - userId (optional)
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
          userId: Joi.string()
        })
      },
      handler: async function (request) {
        try {
          const { surveyId, questionId, osmObjectId, userId } = request.query;
          const observations = await getObservationsSummary(
            surveyId,
            questionId,
            osmObjectId,
            userId
          );
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
