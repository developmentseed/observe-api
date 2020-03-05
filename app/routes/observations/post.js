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
 * @apiParam {object} OSM object
 * @apiParam {object} Questions and answers
 *
 * @apiParamExample {json} Example:
 * {
 * "createdAt": "2020-03-03T12:17:24.878Z",
 * "osmObject": {
 * "id": "node/60952254",
 *   "type": "Feature",
 *   "geometry": {
 *     "coordinates": [
 *       77.6047644,
 *       12.970884
 *     ],
 *     "type": "Point"
 *   },
 *   "properties": {
 *     "changeset": "33994798",
 *     "highway": "traffic_signals",
 *     "icon": "temaki_traffic_signals",
 *     "id": "node/60952254",
 *     "junction": "yes",
 *     "name": "Prof Ashirvadam Junction",
 *     "timestamp": "2015-09-13T08:26:39Z",
 *     "uid": "1306",
 *     "user": "PlaneMad",
 *     "version": "12"
 *   }
 * },
 * "surveyId": 1,
 * "answers": [
 *   {
 *     "questionId": 1,
 *     "questionVersion": 3,
 *     "answer": {
 *       "no": "No"
 *     }
 *   }
 *  ]
 * }
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200
 * @apiUse Error4xx
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
