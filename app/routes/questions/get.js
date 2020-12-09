import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { getQuestion } from '../../models/questions';

/**
* @apiGroup Questions
*
* @api {get} /questions/:id/:version
* @apiDescription Get a question
*
* @apiParam {integer} id Question id
* @apiParam {integer} version Question version
*
* @apiUse Error4xx
*/

export default [
  {
    path: '/questions/{id}/{version}',
    method: ['GET'],
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
          version: Joi.number().required()
        })
      },
      handler: async function (request) {
        try {
          const { id, version } = request.params;
          const question = await getQuestion(id, version);
          if (!question) return Boom.notFound(`question ${id} with version ${version} not found`);

          return question;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
