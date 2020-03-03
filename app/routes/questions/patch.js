import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import logger from '../../services/logger';
import { getQuestion, updateQuestion } from '../../models/questions';

/**
 * @apiGroup Questions
 *
 * @api PATCH /questions/:id
 *
 * @apiDescription Create a new version of a question
 *
 * @apiParam {integer} id
 * @apiParam {integer} current version
 * @apiParam {string} label
 * @apiParam {string} type
 * @apiParam {json} options
 */

export default [
  {
    path: '/questions/{id}',
    method: ['PATCH'],
    options: {
      auth: 'jwt',
      validate: {
        payload: Joi.object({
          id: Joi.number().required(),
          version: Joi.number().required(),
          label: Joi.string().required(),
          type: Joi.string().required(),
          options: Joi.object()
        }).required()
      },
      handler: async function (request) {
        try {
          // Check if this question exists
          const question = await getQuestion(request.params.id);

          if (!question) return Boom.notFound('Question not found.');
          const id = await updateQuestion(request.payload, question.version);
          return id;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
