import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { countPhotos, listPhotos } from '../../models/photos';
import logger from '../../services/logger';

/**
 * @apiGroup Photos
 *
 * @api {get} /photos 5. GET /photos
 * @apiDescription List photos.
 *
 * @apiUse AuthorizationHeader
 *
 * @apiUse PaginationParams
 * @apiParam {string} username Username to filter by (case insensitive).
 * @apiParam {string} startDate Minimum `recordedAt` value, must be an ISO date.
 * @apiParam {string} endDate Maximum `recordedAt` value, must be an ISO date.
 * @apiParam {string} osmElementType Element type to filter by.
 * @apiParam {number} osmElementId Element id to filter by.
 *
 * @apiSuccess {object} meta Pagination metadata.
 * @apiSuccess {object} results List of photos.
 * @apiSuccessExample {json} Success response:
 * { meta:
 *  { count: 15,
 *    pageCount: 5,
 *    totalCount: 50,
 *    next: 'http://0.0.0.0:3001/photos?page=4&sort=&limit=15',
 *    previous: 'http://0.0.0.0:3001/photos?page=2&sort=&limit=15',
 *    self: 'http://0.0.0.0:3001/photos?page=3&sort=&limit=15',
 *    first: 'http://0.0.0.0:3001/photos?page=1&sort=&limit=15',
 *    last: 'http://0.0.0.0:3001/photos?page=4&sort=&limit=15' },
 *  results:
 *    [ { id: '_OeLSdc-nf',
 *        ownerId: 87122,
 *        ownerDisplayName: 'User22',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.321Z',
 *        createdAt: '2019-10-16T10:44:16.321Z' },
 *      { id: '2kWAlmk_Ev',
 *        ownerId: 87123,
 *        ownerDisplayName: 'User23',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.326Z',
 *        createdAt: '2019-10-16T10:44:16.326Z' },
 *      { id: '9jF9mT4llR',
 *        ownerId: 87124,
 *        ownerDisplayName: 'User24',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.330Z',
 *        createdAt: '2019-10-16T10:44:16.330Z' },
 *      { id: '0qGqe-jZ5a',
 *        ownerId: 87125,
 *        ownerDisplayName: 'User25',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.334Z',
 *        createdAt: '2019-10-16T10:44:16.334Z' },
 *      { id: 'O1HDf5mOhQ',
 *        ownerId: 87126,
 *        ownerDisplayName: 'User26',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.339Z',
 *        createdAt: '2019-10-16T10:44:16.339Z' },
 *  ]}
 * }
 *
 * @apiUse Error4xx
 */
export default [
  {
    path: '/photos',
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
            id: Joi.string().valid('asc', 'desc'),
            username: Joi.string().empty(''),
            description: Joi.string().valid('asc', 'desc'),
            osmElement: Joi.string().valid('asc', 'desc'),
            createdAt: Joi.string().valid('asc', 'desc')
          }).unknown(false),
          username: Joi.string()
            .empty('')
            .optional(),
          startDate: Joi.string()
            .empty('')
            .optional(),
          endDate: Joi.string()
            .empty('')
            .optional(),
          osmElementType: Joi.string()
            .pattern(/(node|way|relation)/)
            .empty('')
            .optional(),
          osmElementId: Joi.number()
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
          osmElementType,
          osmElementId
        } = request.query;
        const offset = limit * (page - 1);
        let orderBy = [{ column: 'createdAt', order: 'desc' }];

        /**
         * Parses the sort parameter to format used by Knex:
         *   - https://knexjs.org/#Builder-orderBy
         *
         * Example:
         *   - input: sort[createdAt]=asc
         *   - output: { column: 'createdAt', order: 'asc' }
         *
         */
        if (sort) {
          orderBy = Object.keys(sort).map(key => {
            return {
              column: key === 'username' ? 'users.displayName' : key,
              order: sort[key]
            };
          });
        }

        const filterBy = {
          username,
          startDate,
          endDate,
          osmElementType,
          osmElementId
        };

        const results = await listPhotos({
          offset,
          limit,
          orderBy,
          filterBy
        });

        const count = await countPhotos(filterBy);

        return h.paginate(results, count);
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
