import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { getSurvey } from '../../models/surveys';
import { createObservation } from '../../models/observations';
import { getCampaign } from '../../models/campaigns';

/**
 * @apiGroup Observations
 *
 * @api POST /observations
 *
 * @apiDescription Submit a new observation
 *
 * @apiParam {integer} Survey ID
 * @apiParam {integer} Campaign ID
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
 * "campaignId": 1,
 * "answers": [
 *   {
 *     "questionId": 1,
 *     "questionVersion": 3,
 *     "answer": {
 *       // array of answers as an object
 *       "answer": ["no"]
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
          campaignId: Joi.number().required(),
          createdAt: Joi.date().iso().required(),
          osmObject: Joi.object().required(),
          answers: Joi.array().required()
        }).required()
      },
      handler: async function (request) {
        try {
          const { credentials: { id } } = request.auth;
          const data = {
            surveyId: request.payload.surveyId,
            campaignId: request.payload.campaignId,
            userId: id,
            createdAt: request.payload.createdAt,
            osmObject: request.payload.osmObject,
            answers: request.payload.answers
          };

          // check if this campaign exists
          const campaign = await getCampaign(data.campaignId);
          if (!campaign) return Boom.notFound('campaign not found');

          // check if this survey exists
          const survey = await getSurvey(data.surveyId);
          if (!survey) return Boom.notFound('survey not found');

          // if it does, create an observation
          const observationId = await createObservation(data);
          return observationId;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
