import logger from '../../services/logger';
import Boom from '@hapi/boom';
import { getSurveys } from '../../models/surveys';

export default [
  {
    /**
     * @apiGroup Surveys
     *
     * @api GET /surveys
     *
     * @apiDescription Get all surveys.
     *
     *
     * @apiUse Success200
     * @apiUse Error4xx
     */
    path: '/surveys',
    method: ['GET'],
    options: {
      handler: async function () {
        try {
          const surveys = await getSurveys();
          return surveys;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
