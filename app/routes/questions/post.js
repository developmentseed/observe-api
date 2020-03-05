import Joi from '@hapi/joi';
import logger from '../../services/logger';
import Boom from '@hapi/boom';
import { createQuestion } from '../../models/questions';

/**
 * @apiGroup Questions
 *
 * @api {post} POST /questions
 * @apiDescription Create a new question
 *
 * @apiParam {integer} version
 * @apiParam {string} label
 * @apiParam {string} type
 * @apiParam {json} options
 */

export default [
  {
    path: '/questions',
    method: ['POST'],
    options: {
      auth: 'jwt',
      validate: {
        payload: Joi.object({
          version: Joi.number().required(),
          label: Joi.string().required(),
          type: Joi.string().required(),
          options: Joi.object()
        }).required()
      },
      handler: async function (request) {
        try {
          const question = await createQuestion(request.payload);
          return question;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
