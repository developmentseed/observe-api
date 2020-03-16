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
          label: Joi.string(),
          type: Joi.string(),
          options: Joi.object()
        }).required()
      },
      handler: async function (request) {
        try {
          // Check if this question exists
          const question = await getQuestion(request.params.id);

          if (!question) return Boom.notFound('Question not found.');
          const data = {
            'id': question.id,
            'version': question.version + 1, // create new version
            'label': request.payload.label || question.label,
            'type': request.payload.type || question.type,
            'options': request.payload.options || question.options
          };
          const id = await updateQuestion(data);
          return id;
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
