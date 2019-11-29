import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { listTraces, getTracesCount } from '../../models/traces';
import logger from '../../services/logger';

/**
 * @apiGroup Traces
 *
 * @api {get} /traces 6. GET /traces
 * @apiDescription Get a list of photos.
 *
 * @apiUse AuthorizationHeader
 *
 * @apiUse PaginationParams
 * @apiParam {string} username Username to filter by (case insensitive).
 * @apiParam {string} startDate Minimum `recordedAt` value, must be an ISO date.
 * @apiParam {string} endDate Maximum `recordedAt` value, must be an ISO date.
 * @apiParam {number} lengthMin Minimum length value to filter by.
 * @apiParam {number} lengthMax Maximum length value to filter by.
 *
 * @apiSuccess {object} meta Pagination metadata.
 * @apiSuccess {object} results List of traces.
 * @apiSuccessExample {json} Success response:
 * { meta:
 *  { count: 15,
 *    pageCount: 5,
 *    totalCount: 50,
 *    next: 'http://0.0.0.0:3001/traces?page=4&sort=&limit=15',
 *    previous: 'http://0.0.0.0:3001/traces?page=2&sort=&limit=15',
 *    self: 'http://0.0.0.0:3001/traces?page=3&sort=&limit=15',
 *    first: 'http://0.0.0.0:3001/traces?page=1&sort=&limit=15',
 *    last: 'http://0.0.0.0:3001/traces?page=4&sort=&limit=15' },
 *  results:
 *    [ { id: '_OeLSdc-nf',
 *        ownerId: 87008,
 *        description: 'This is a TraceJSON file.',
 *        length: 534.717,
 *        recordedAt: '2019-07-24T23:34:20.021Z',
 *        uploadedAt: '2019-10-16T10:44:16.321Z',
 *        updatedAt: '2019-10-16T10:44:16.321Z' },
 *      { id: '2kWAlmk_Ev',
 *        ownerId: 87008,
 *        description: 'This is a TraceJSON file.',
 *        length: 534.717,
 *        recordedAt: '2019-07-24T23:34:20.021Z',
 *        uploadedAt: '2019-10-16T10:44:16.326Z',
 *        updatedAt: '2019-10-16T10:44:16.326Z' },
 *      { id: '9jF9mT4llR',
 *        ownerId: 87008,
 *        description: 'This is a TraceJSON file.',
 *        length: 534.717,
 *        recordedAt: '2019-07-24T23:34:20.021Z',
 *        uploadedAt: '2019-10-16T10:44:16.330Z',
 *        updatedAt: '2019-10-16T10:44:16.330Z' },
 *      { id: '0qGqe-jZ5a',
 *        ownerId: 87008,
 *        description: 'This is a TraceJSON file.',
 *        length: 534.717,
 *        recordedAt: '2019-07-24T23:34:20.021Z',
 *        uploadedAt: '2019-10-16T10:44:16.334Z',
 *        updatedAt: '2019-10-16T10:44:16.334Z' },
 *      { id: 'O1HDf5mOhQ',
 *        ownerId: 87008,
 *        description: 'This is a TraceJSON file.',
 *        length: 534.717,
 *        recordedAt: '2019-07-24T23:34:20.021Z',
 *        uploadedAt: '2019-10-16T10:44:16.339Z',
 *        updatedAt: '2019-10-16T10:44:16.339Z' },
 *  ]}
 * }
 *
 * @apiUse Error4xx
 */
export default [
  {
    path: '/traces',
    method: ['GET'],
    options: {
      auth: 'jwt',
      validate: {
        query: Joi.object({
          limit: Joi.number()
            .integer()
            .min(1)
            .max(100),
          page: Joi.number()
            .integer()
            .min(1),
          sort: Joi.object({
            recordedAt: Joi.string().valid('asc', 'desc'),
            description: Joi.string().valid('asc', 'desc'),
            length: Joi.string().valid('asc', 'desc'),
            uploadedAt: Joi.string().valid('asc', 'desc'),
            updatedAt: Joi.string().valid('asc', 'desc'),
            ownerId: Joi.string().valid('asc', 'desc')
          }),
          username: Joi.string()
            .empty('')
            .optional(),
          startDate: Joi.string()
            .empty('')
            .optional(),
          endDate: Joi.string()
            .empty('')
            .optional(),
          lengthMin: Joi.string()
            .empty('')
            .optional(),
          lengthMax: Joi.string()
            .empty('')
            .optional()
        })
      }
    },
    handler: async function (request, h) {
      try {
        // Get query params
        const {
          limit,
          page,
          sort,
          username,
          startDate,
          endDate,
          lengthMin,
          lengthMax
        } = request.query;
        const offset = limit * (page - 1);
        let orderBy = [{ column: 'uploadedAt', order: 'desc' }];

        /**
         * Parses the sort parameter to format used by Knex:
         *   - https://knexjs.org/#Builder-orderBy
         *
         * Example:
         *   - input: sort[uploadedAt]=asc
         *   - output: { column: 'uploadedAt', order: 'asc' }
         *
         */
        if (sort) {
          orderBy = Object.keys(sort).map(key => {
            return {
              column: key,
              order: sort[key]
            };
          });
        }

        // Get filter properties
        const filterBy = {
          username,
          startDate,
          endDate,
          lengthMin,
          lengthMax
        };

        const results = await listTraces({
          offset,
          limit,
          orderBy,
          filterBy
        });

        const count = await getTracesCount(filterBy);

        return h.paginate(results, count);
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
